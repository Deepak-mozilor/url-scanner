from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.user_model import User


class UserDAO:
    """Data Access Object for User records."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def get_user_by_username(self, username: str) -> User | None:
        """Fetches a user by their username."""
        try:
            query = select(User).where(User.username == username)
            result = await self.session.execute(query)
            return result.scalar_one_or_none()

        except SQLAlchemyError as err:
            await self.session.rollback()
            raise err

    async def create_user(self, email: str, username: str, hashed_password: str) ->User:
        """Saves a new user to the database."""
        new_user = User(
            email=email,
            username=username,
            hashed_password=hashed_password
        )

        try:
            self.session.add(new_user)
            await self.session.flush()
            await self.session.refresh(new_user)
            return new_user

        except SQLAlchemyError as err:
            await self.session.rollback()
            raise err
