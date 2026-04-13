from pydantic import BaseModel


class UserLogin(BaseModel):
    """Model for login data."""

    username: str
    password: str
