from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String,Integer

from url_scanner.db.base import Base


class Url(Base):
    """Model for demo purpose."""

    __tablename__ = "url_db"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user: Mapped[str] = mapped_column(String(length=200))
    url: Mapped[str] = mapped_column(String(length=200))
    total_img: Mapped[int] = mapped_column(Integer, nullable=True)
    with_alt: Mapped[int] = mapped_column(Integer,nullable=True)
    without_alt: Mapped[int] = mapped_column(Integer,nullable=True)
    timestamp: Mapped[str] = mapped_column(String(length=200))