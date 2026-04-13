import logging
from collections import defaultdict
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup  # type: ignore
from fastapi import APIRouter, Depends, HTTPException

from backend.url_scanner.url_scanner.db.dao.url_db_dao import UrlDAO
from url_scanner.web.api.login.view import verify_user_token
from url_scanner.web.api.scanner.schema import (
    HistoryResponse,
    ScanRequest,
    ScanResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/scan", response_model=ScanResponse)
async def scan_website_images(
    request: ScanRequest,
    user_id: int = Depends(verify_user_token),
    url_dao: UrlDAO = Depends()
) -> dict:
    """Function for receiving url and process html."""
    target_url = str(request.url)

    headers = {
        "User-Agent": "MyURLScannerProject/1.0 (testing web scraping; your_actual_email@example.com)"
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, headers=headers, timeout=10.0) as client:
            response = await client.get(target_url)
            response.raise_for_status()
            html_content = response.text

    except Exception as e:
        logger.exception(f"HTTP fetch failed for target website: {e!s}")

        raise HTTPException(
            status_code=400,
            detail="Could not fetch the requested website. Please verify the URL and try again."
        )from e

    soup = BeautifulSoup(html_content, "html.parser")
    img_tags = soup.find_all("img")

    image_data = []
    for img in img_tags:
        src = img.get("src")
        if src:
            full_url = urljoin(target_url, src)
            alt_text = img.get("alt")

            image_data.append({
                "url": full_url,
                "alt_text": alt_text,
                "has_alt": alt_text is not None and alt_text.strip() != ""
            })

    missing_alt_count = sum(1 for img in image_data if not img["has_alt"])

    clean_url = target_url.rstrip("/")

    saved_scan = await url_dao.create_scan_record(
        user_id=user_id,
        url=clean_url,
        total_img=len(image_data),
        without_alt=missing_alt_count
    )

    scan_id = saved_scan.id

    return {
        "message": "Scrape successful",
        "scan_id": scan_id,
        "total_images": len(image_data),
        "missing_alt_count": missing_alt_count,
        "images": image_data
    }


@router.get("/history", response_model=list[HistoryResponse])
async def get_scan_history(
    url_dao: UrlDAO = Depends(),
    user_id: int = Depends(verify_user_token)
) -> list:
    """Function to get user history."""

    return await url_dao.get_user_history(user_id=user_id)

@router.get("/reports")
async def get_reports_data(
    url_dao: UrlDAO = Depends(),
    user_id: int = Depends(verify_user_token)
) ->dict:
    """Function to get report of users search history."""

    # 1. Fetch all scans for this user
    scans = await url_dao.get_user_history(user_id=user_id)

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
    sorted_domains = sorted(domain_errors.items(), key=lambda item: item[1], reverse=True)[:5]  # noqa: E501

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
