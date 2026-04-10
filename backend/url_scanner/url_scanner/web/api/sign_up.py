import bcrypt
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.user_model import User


class UserLoginRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


router = APIRouter()


@router.post("/signup")
async def sign_up(user: UserLoginRequest, db: AsyncSession = Depends(get_db_session)):

    new_entry = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed(user.password),
    )

    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)

    return {"message": "User created successfully", "user_id": new_entry.id}


def hashed(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")

