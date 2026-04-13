from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.sqltypes import String

from url_scanner.db.base import Base


class User(Base):
    """Model for user data."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(
        String(length=200), index=True, unique=True, nullable=False
    )
    username: Mapped[str] = mapped_column(
        String(length=200), index=True, unique=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        String(length=200), index=True, nullable=False
    )

    urls: Mapped[list["Url"]] = relationship(back_populates="owner", cascade="all, delete-orphan") # type: ignore  # noqa: E501, F821
