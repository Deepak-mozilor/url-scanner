from collections import defaultdict
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup  # type: ignore
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.main_model import Url
from url_scanner.web.api.security import verify_user_token

router = APIRouter()

class ScanRequest(BaseModel):  # noqa: D101
    url: HttpUrl
    html: Optional[str] = None

@router.post("/scan")
async def scan_website_images(
    request: ScanRequest,
    user_id: int = Depends(verify_user_token),
    db: AsyncSession= Depends(get_db_session)
):
    target_url = str(request.url)

    if request.html:
        html_content = request.html

    else:
        headers = {
            "User-Agent": "MyURLScannerProject/1.0 (testing web scraping; your_actual_email@example.com)"
        }

        try:
            async with httpx.AsyncClient(follow_redirects=True, headers=headers, timeout=10.0) as client:
                response = await client.get(target_url)
                response.raise_for_status()
                html_content = response.text

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not fetch website: {str(e)}")

    soup = BeautifulSoup(html_content, 'html.parser')
    img_tags = soup.find_all('img')


    image_data = []
    for img in img_tags:
        src = img.get('src')
        if src:
            full_url = urljoin(target_url, src) 
            alt_text = img.get('alt')

            image_data.append({
                "url": full_url,
                "alt_text": alt_text,
                "has_alt": alt_text is not None and alt_text.strip() != ""
            })

    missing_alt_count = sum(1 for img in image_data if not img["has_alt"])

    clean_url = target_url.rstrip("/")

    query = select(Url).where(Url.user == str(user_id), Url.url == clean_url)
    result = await db.execute(query)
    existing_entry = result.scalar_one_or_none()

    if existing_entry:
        existing_entry.total_img = len(image_data)
        existing_entry.with_alt = len(image_data) - missing_alt_count
        existing_entry.without_alt = missing_alt_count
        existing_entry.timestamp = datetime.now().isoformat()

        await db.commit()
        scan_id = existing_entry.id

    else:
        new_entry = Url(
            user=str(user_id),
            url=clean_url,
            total_img=len(image_data),
            with_alt=len(image_data) - missing_alt_count,
            without_alt=missing_alt_count,
            timestamp=datetime.now().isoformat()
        )
        db.add(new_entry)
        await db.commit()
        await db.refresh(new_entry)
        scan_id = new_entry.id

    return {
        "message": "Scrape successful",
        "scan_id": scan_id,
        "total_images": len(image_data),
        "missing_alt_count": missing_alt_count, 
        "images": image_data
    }

@router.get("/proxy/google")
async def proxy_google_search(url: str): 
    
    if "google.com" not in url:
        raise HTTPException(status_code=400, detail="Only Google URLs are allowed in the proxy.")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch from Google")
            
        return {"html": response.text}
    
@router.get("/history")
async def get_scan_history(
    db: AsyncSession = Depends(get_db_session),
    user_id: int = Depends(verify_user_token) 
):
    query = (
        select(Url)
        .where(Url.user == str(user_id))
        .order_by(Url.timestamp.desc())
    )
    
    result = await db.execute(query)
    scans = result.scalars().all()
    
    return scans

@router.get("/reports")
async def get_reports_data(
    db: AsyncSession = Depends(get_db_session),
    user_id: int = Depends(verify_user_token)
):
    # 1. Fetch all scans for this user
    query = select(Url).where(Url.user == str(user_id))
    result = await db.execute(query)
    scans = result.scalars().all()

    # 2. Calculate Global Stats
    total_urls = len(scans)
    total_images = sum(scan.total_img for scan in scans)
    total_errors = sum(scan.without_alt for scan in scans)

    overall_pass_rate = 0
    if total_images > 0:
        overall_pass_rate = round(((total_images - total_errors) / total_images) * 100)

    # 3. Calculate Leaderboard (Group missing tags by Domain)
    domain_errors = defaultdict(int)

    for scan in scans:
        if scan.without_alt > 0:
            # Extract just the domain from the full URL
            domain = urlparse(scan.url).netloc
            # Strip 'www.' to make the chart look cleaner
            if domain.startswith("www."):
                domain = domain[4:]

            domain_errors[domain] += scan.without_alt

    # Sort the dictionary by most errors, and grab the Top 5
    sorted_domains = sorted(domain_errors.items(), key=lambda item: item[1], reverse=True)[:5]

    # Format it for Recharts in React: [{ domain: "google.com", missingTags: 45 }]
    leaderboard = [{"domain": k, "missingTags": v} for k, v in sorted_domains]

    return {
        "stats": {
            "total_urls": total_urls,
            "total_images": total_images,
            "overall_pass_rate": overall_pass_rate
        },
        "leaderboard": leaderboard
    }
