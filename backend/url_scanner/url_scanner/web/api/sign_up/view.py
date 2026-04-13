import bcrypt
from fastapi import APIRouter, Depends

from url_scanner.db.dao.user_dao.user_dao import UserDAO
from url_scanner.web.api.sign_up.schema import UserLoginRequest

router = APIRouter()

@router.post("/signup")
async def sign_up(user: UserLoginRequest,
                  user_dao: UserDAO = Depends()) -> dict:
    """Function for signup api."""

    hashed_pwd = hashed(user.password)

    new_entry = await user_dao.create_user(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pwd,
    )

    return {"message": "User created successfully", "user_id": new_entry.id}


def hashed(password: str) -> str:
    """Convert str to hash for storing in db."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")

