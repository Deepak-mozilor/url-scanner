from pydantic import BaseModel, EmailStr


class UserLoginRequest(BaseModel):
    """Model for login."""

    email: EmailStr
    username: str
    password: str
