from unittest.mock import patch

import pytest  # type: ignore
from backend.url_scanner.url_scanner.db.models.user import User
from fastapi import FastAPI
from httpx import AsyncClient
from starlette import status

from url_scanner.web.api.login.view import verify_user_token


@pytest.mark.anyio
async def test_unauthenticated_history_rejected(client: AsyncClient,
                                                fastapi_app: FastAPI)-> None:
    """Ensure users cannot view history without a JWT token."""

    response = await client.get("/api/history")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Not authenticated"


@pytest.mark.anyio
async def test_login_wrong_credentials(client: AsyncClient,
                                       fastapi_app: FastAPI) -> None:
    """Ensure bad passwords are rejected."""

    response = await client.post(
        "/api/login",
        json={"username": "fake_user", "password": "wrong_password"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid" in response.json()["detail"]



@pytest.mark.anyio
async def test_scan_url_success(client: AsyncClient,
                                fastapi_app : FastAPI,
                                dbsession) -> None:
    """Ensure the scanner correctly counts missing alt tags."""

    test_user = User(
        email="test@example.com",
        username="test_scanner",
        hashed_password="fake_hash"
    )
    dbsession.add(test_user)

    await dbsession.commit()
    # 1. Arrange: Create fake HTML with 1 good image and 1 bad image
    fake_html = """
        <html>
            <body>
                <img src="/good.jpg" alt="A nice picture">
                <img src="/bad.jpg">
            </body>
        </html>
    """

    # We need a fake valid token to pass the security check
    headers = {"Authorization": "Bearer fake_test_token_here"}

    fastapi_app.dependency_overrides[verify_user_token] = lambda: test_user.id

    with patch("httpx.AsyncClient.get") as mock_get:
        # Set up the fake response
        mock_get.return_value.status_code = 200
        mock_get.return_value.text = fake_html
        # Bypass raise_for_status()
        mock_get.return_value.raise_for_status = lambda: None

        # Fire the request to your endpoint
        response = await client.post(
            "/api/scan",
            json={"url": "https://example.com"},
            headers=headers
        )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_images"] == 2
    assert data["missing_alt_count"] == 1
