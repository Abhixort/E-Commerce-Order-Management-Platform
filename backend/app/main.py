import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.core.rate_limiter import limiter
from app.api.v1 import api_router

# Import models for metadata registration
import app.models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_initial_demo_data():
    """Seed initial categories, products, and admin/customer accounts if database is empty."""
    async with AsyncSessionLocal() as session:
        from app.models.user import User, UserRole
        from app.models.product import Product, Category, InventoryLog
        from app.core.security import get_password_hash
        from sqlalchemy import select

        # 1. Seed Users
        user_check = await session.execute(select(User))
        if not user_check.scalars().first():
            logger.info("Seeding initial users (admin, manager, customer)...")
            admin_user = User(
                email="admin@example.com",
                full_name="Admin Director",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            manager_user = User(
                email="manager@example.com",
                full_name="Inventory Manager",
                hashed_password=get_password_hash("manager123"),
                role=UserRole.MANAGER
            )
            customer_user = User(
                email="customer@example.com",
                full_name="John Doe Customer",
                hashed_password=get_password_hash("customer123"),
                role=UserRole.CUSTOMER
            )
            session.add_all([admin_user, manager_user, customer_user])
            await session.flush()

            # 2. Seed Categories
            cat_electronics = Category(name="Electronics", description="Gadgets and high-tech gear")
            cat_apparel = Category(name="Apparel", description="Fashion clothing and accessories")
            cat_home = Category(name="Home & Kitchen", description="Modern appliances and living decor")
            session.add_all([cat_electronics, cat_apparel, cat_home])
            await session.flush()

            # 3. Seed Products
            products = [
                Product(
                    sku="ELEC-MAC-01",
                    title="MacBook Pro 16\" M3 Max",
                    description="Powerful workstation laptop with 36GB Unified Memory & 1TB SSD.",
                    price=2499.99,
                    stock_quantity=15,
                    category_id=cat_electronics.id
                ),
                Product(
                    sku="ELEC-PHONE-02",
                    title="Wireless Noise-Canceling Headphones",
                    description="Over-ear active noise canceling spatial audio headphones.",
                    price=299.50,
                    stock_quantity=45,
                    category_id=cat_electronics.id
                ),
                Product(
                    sku="APP-HOODIE-01",
                    title="Premium Heavyweight Hoodie",
                    description="100% Organic cotton relaxed fit hoodie in Charcoal Black.",
                    price=89.00,
                    stock_quantity=60,
                    category_id=cat_apparel.id
                ),
                Product(
                    sku="HOME-ESPRESSO-01",
                    title="Barista Touch Espresso Machine",
                    description="Automatic bean-to-cup espresso machine with steam wand.",
                    price=799.00,
                    stock_quantity=8,
                    category_id=cat_home.id
                ),
                Product(
                    sku="ELEC-SMARTWATCH-03",
                    title="Ultra Sport Smartwatch GPS",
                    description="Titanium case smartwatch with dual-frequency GPS and heart rate monitoring.",
                    price=399.99,
                    stock_quantity=5,  # Low stock test item
                    category_id=cat_electronics.id
                ),
            ]
            session.add_all(products)
            await session.commit()
            logger.info("Demo database seeded successfully!")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database Tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await seed_initial_demo_data()
    except Exception as e:
        logger.warning(f"Database table initialization warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup Slowapi Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
