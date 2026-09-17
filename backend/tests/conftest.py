import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User, UserRole

# Use SQLite in-memory for fast unit/integration testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(bind=engine_test, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True)
async def prepare_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
async def admin_token_headers(client: AsyncClient, db_session: AsyncSession) -> dict:
    admin_user = User(
        email="testadmin@example.com",
        full_name="Test Admin",
        hashed_password=get_password_hash("adminpass123"),
        role=UserRole.ADMIN
    )
    db_session.add(admin_user)
    await db_session.commit()

    login_res = await client.post(
        "/api/v1/auth/login",
        data={"username": "testadmin@example.com", "password": "adminpass123"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
async def customer_token_headers(client: AsyncClient, db_session: AsyncSession) -> dict:
    customer_user = User(
        email="testcustomer@example.com",
        full_name="Test Customer",
        hashed_password=get_password_hash("customerpass123"),
        role=UserRole.CUSTOMER
    )
    db_session.add(customer_user)
    await db_session.commit()

    login_res = await client.post(
        "/api/v1/auth/login",
        data={"username": "testcustomer@example.com", "password": "customerpass123"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
