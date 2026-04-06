import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from urllib.parse import urljoin

from sqlalchemy.ext.asyncio import AsyncSession
from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.main_model import Url

from url_scanner.web.api.security import verify_user_token

router = APIRouter()

class ScanRequest(BaseModel):
    url: HttpUrl

@router.post("/scan")
async def scan_website_images(
    request: ScanRequest,
    user_id: int = Depends(verify_user_token),
    db: AsyncSession= Depends(get_db_session)
):
    target_url = str(request.url)

    headers = {
        "User-Agent": "MyURLScannerProject/1.0 (testing web scraping; your_actual_email@example.com)"
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True,headers=headers, timeout=10.0) as client:
            response = await client.get(target_url)
            response.raise_for_status()
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch website: {str(e)}")

    soup = BeautifulSoup(response.text, 'html.parser')
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

    new_entry = Url(
        user = str(user_id),
        url = target_url,
        total_img = len(image_data),
        with_alt = len(image_data) - missing_alt_count,
        without_alt = missing_alt_count,
        timestamp = datetime.now().isoformat()
    )

    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)

    return {
        "message": "Scrape successful",
        "scan_id": new_entry.id,
        "total_images": len(image_data),
        "missing_alt_count": missing_alt_count, 
        "images": image_data
    }