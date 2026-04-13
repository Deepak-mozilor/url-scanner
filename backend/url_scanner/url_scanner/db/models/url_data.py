from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.sqltypes import Integer, Text

from url_scanner.db.base import Base


class Url(Base):
    """Model for Url data."""

    __tablename__ = "url_data"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(Text)
    total_img: Mapped[int] = mapped_column(Integer, nullable=True)
    with_alt: Mapped[int] = mapped_column(Integer,nullable=True)
    without_alt: Mapped[int] = mapped_column(Integer,nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    owner: Mapped["User"] = relationship(back_populates="urls")  # type: ignore # noqa: F821
