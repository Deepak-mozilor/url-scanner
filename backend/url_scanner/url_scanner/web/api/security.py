import os
from datetime import datetime, timedelta

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from url_scanner.db.dependencies import get_db_session
from url_scanner.db.models.user_model import User

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials 

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
            
        return user_id

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid.")


class UserLogin(BaseModel):
    username: str
    password: str


router = APIRouter()


@router.post("/login")
async def send_login(
    user: UserLogin, response: Response, db: AsyncSession = Depends(get_db_session)
):
    db_user = await authenticate_user(db, user.username, user.password)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_token({"user_id": db_user.id})


    return {
        "message": "Login successful",
        "access_token": token,
        "user": {"id": db_user.id, "username": db_user.username}
    }


async def authenticate_user(db: AsyncSession, username: str, password: str):

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_token(data):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=10)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


@router.get("/verify-session")
async def verify_session(user_id: int = Depends(verify_user_token)):
    return {"user": {"id": user_id}}
