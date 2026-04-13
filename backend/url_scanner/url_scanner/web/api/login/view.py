from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from url_scanner.db.dao.user_dao import UserDAO
from url_scanner.settings import settings
from url_scanner.web.api.login.schema import UserLogin

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"

security = HTTPBearer()

async def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:  # noqa: E501
    """Function to verify user."""

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload.")

        return user_id

    except JWTError as err:
        raise HTTPException(status_code=401, detail="Token expired or invalid.")from err



router = APIRouter()


@router.post("/login")
async def send_login(
    user: UserLogin, response: Response, user_dao: UserDAO = Depends()
)->dict:
    """Function for login credentials."""

    db_user = await authenticate_user(user_dao, user.username, user.password)

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


async def authenticate_user(user_dao: UserDAO, username: str, password: str) -> list:
    """Function for checking username and password from db."""

    user = await user_dao.get_user_by_username(username)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_token(data : dict) -> str:
    """Creating jwt token."""

    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=60)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Function to decrpyt password."""
    pwd_bytes = plain_password.encode("utf-8")
    hash_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


@router.get("/verify-session")
async def verify_session(user_id: int = Depends(verify_user_token)) -> dict:
    """Function for session verification."""
    return {"user": {"id": user_id}}
