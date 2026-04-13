from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from backend.url_scanner.url_scanner.db.models.url_db.url_db import Url


class UrlDAO:
    """Data Access Object for URL scan records."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_scan_record(self,
                                 user_id: int,
                                 url: str,
                                 total_img: int,
                                 without_alt: int) -> Url:
        """Saves a new scan result to the database."""

        calculated_with_alt = total_img - without_alt
        new_scan = Url(
            user_id=user_id,
            url=url,
            total_img=total_img,
            with_alt=calculated_with_alt,
            without_alt=without_alt
        )
        self.session.add(new_scan)
        await self.session.commit()

        return new_scan

    async def get_user_history(self, user_id: int) -> list[Url]:
        """Fetches all past scans for a specific user."""
        query = select(Url).where(Url.user_id == user_id).order_by(Url.timestamp.desc())
        result = await self.session.execute(query)

        return list(result.scalars().fetchall())
