from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product, InventoryLog
from app.schemas.product import InventoryAdjustment, InventoryLogResponse
from app.api.deps import require_roles

router = APIRouter(prefix="/inventory", tags=["Inventory & Audit Logs"])

@router.post("/adjust", response_model=InventoryLogResponse, status_code=status.HTTP_201_CREATED)
async def adjust_inventory(
    adj_in: InventoryAdjustment,
    db: AsyncSession = Depends(get_db),
    staff: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    result = await db.execute(select(Product).where(Product.id == adj_in.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_stock = product.stock_quantity + adj_in.change_amount
    if new_stock < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Adjustment resulting in negative stock ({new_stock}) is invalid."
        )

    prev_stock = product.stock_quantity
    product.stock_quantity = new_stock

    log = InventoryLog(
        product_id=product.id,
        change_amount=adj_in.change_amount,
        previous_stock=prev_stock,
        new_stock=new_stock,
        reason=adj_in.reason
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log

@router.get("/logs", response_model=List[InventoryLogResponse])
async def list_inventory_logs(
    product_id: int = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    staff: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    query = select(InventoryLog).order_by(desc(InventoryLog.created_at))
    if product_id:
        query = query.where(InventoryLog.product_id == product_id)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
