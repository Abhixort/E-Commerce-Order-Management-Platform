from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.schemas.analytics import DashboardStats, LowStockProduct
from app.api.deps import require_roles

router = APIRouter(prefix="/analytics", tags=["Admin Analytics"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    # Total Orders
    tot_orders_res = await db.execute(select(func.count(Order.id)))
    total_orders = tot_orders_res.scalar() or 0

    # Total Revenue (completed orders)
    rev_res = await db.execute(
        select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.COMPLETED)
    )
    total_revenue = rev_res.scalar() or 0.0

    # Total Active Products
    tot_prod_res = await db.execute(select(func.count(Product.id)).where(Product.is_active == True))
    total_products = tot_prod_res.scalar() or 0

    # Low stock count (< 10)
    low_stock_res = await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True, Product.stock_quantity < 10)
    )
    low_stock_count = low_stock_res.scalar() or 0

    # Pending orders count
    pending_res = await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING)
    )
    pending_count = pending_res.scalar() or 0

    # Completed orders count
    completed_res = await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.COMPLETED)
    )
    completed_count = completed_res.scalar() or 0

    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "low_stock_products_count": low_stock_count,
        "pending_orders_count": pending_count,
        "completed_orders_count": completed_count
    }

@router.get("/low-stock", response_model=List[LowStockProduct])
async def get_low_stock_products(
    threshold: int = 10,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    result = await db.execute(
        select(Product)
        .where(Product.is_active == True, Product.stock_quantity < threshold)
        .order_by(Product.stock_quantity.asc())
    )
    return result.scalars().all()
