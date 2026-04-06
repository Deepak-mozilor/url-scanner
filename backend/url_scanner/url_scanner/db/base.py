from sqlalchemy.orm import DeclarativeBase

from url_scanner.db.meta import meta


class Base(DeclarativeBase):
    """Base for all models."""

    metadata = meta
