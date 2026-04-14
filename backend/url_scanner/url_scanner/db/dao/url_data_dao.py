from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.url_data_model import Url


class UrlDAO:
    """Data Access Object for URL scan records."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_scan_record(
        self,
        user_id: int,
        url: str,
        total_img: int,
        without_alt: int
    ) -> Url:
        """Saves a new scan result to the database."""

        new_scan = Url(
            user_id=user_id,
            url=url,
            total_img=total_img,
            with_alt=total_img - without_alt,
            without_alt=without_alt
        )

        try:
            self.session.add(new_scan)
            await self.session.flush()
            return new_scan

        except SQLAlchemyError as err:
            await self.session.rollback()
            raise err

    async def get_user_history(self, user_id: int) -> list[Url]:
        """Fetches all past scans for a specific user."""
        try:
            query = select(Url).where(Url.user_id == user_id).order_by(Url.timestamp.desc())
            result = await self.session.execute(query)
            return list(result.scalars().fetchall())

        except SQLAlchemyError as err:
            await self.session.rollback()
            raise err
