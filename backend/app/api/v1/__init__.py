from fastapi import APIRouter
from app.api.v1 import auth, products, cart, orders, inventory, analytics

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(inventory.router)
api_router.include_router(analytics.router)
