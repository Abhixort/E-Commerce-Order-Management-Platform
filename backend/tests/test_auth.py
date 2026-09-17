import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # Register user
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "secretpassword",
            "full_name": "New User",
            "role": "CUSTOMER"
        }
    )
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "CUSTOMER"

    # Login user
    login_response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "newuser@example.com",
            "password": "secretpassword"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["role"] == "CUSTOMER"

    # Fetch current user profile
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = await client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "newuser@example.com"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
