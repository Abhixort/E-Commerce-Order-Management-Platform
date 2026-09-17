from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product, Category, InventoryLog
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse,
    CategoryCreate, CategoryResponse
)
from app.api.deps import get_current_user, require_roles
from app.redis_client import CacheService

router = APIRouter(prefix="/products", tags=["Products & Catalog"])

@router.get("", response_model=List[ProductResponse])
async def list_products(
    search: Optional[str] = Query(None, description="Search by title or SKU"),
    category_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    cache_key = f"products_list:{search}:{category_id}:{min_price}:{max_price}:{skip}:{limit}"
    cached_data = await CacheService.get(cache_key)
    if cached_data:
        return cached_data

    query = select(Product).options(selectinload(Product.category)).where(Product.is_active == True)

    if search:
        query = query.where(
            or_(
                Product.title.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%")
            )
        )
    if category_id:
        query = query.where(Product.category_id == category_id)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    # Format JSON response for caching
    serialized = [ProductResponse.model_validate(p).model_dump(mode="json") for p in products]
    await CacheService.set(cache_key, serialized, ttl_seconds=120)

    return products

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    result = await db.execute(select(Category).where(Category.name == cat_in.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(name=cat_in.name, description=cat_in.description)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    prod_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    staff: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    sku_check = await db.execute(select(Product).where(Product.sku == prod_in.sku))
    if sku_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Product SKU already exists")

    product = Product(**prod_in.model_dump())
    db.add(product)
    await db.flush()

    # Initial Stock audit log entry
    if prod_in.stock_quantity > 0:
        log = InventoryLog(
            product_id=product.id,
            change_amount=prod_in.stock_quantity,
            previous_stock=0,
            new_stock=prod_in.stock_quantity,
            reason="Initial Stock Creation"
        )
        db.add(log)

    await db.commit()
    
    # Invalidate products cache
    await CacheService.delete_pattern("products_list:*")
    
    res = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product.id)
    )
    return res.scalar_one()

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    staff: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER]))
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = prod_in.model_dump(exclude_unset=True)
    
    if "stock_quantity" in update_data and update_data["stock_quantity"] != product.stock_quantity:
        diff = update_data["stock_quantity"] - product.stock_quantity
        log = InventoryLog(
            product_id=product.id,
            change_amount=diff,
            previous_stock=product.stock_quantity,
            new_stock=update_data["stock_quantity"],
            reason="Manual Admin Product Stock Update"
        )
        db.add(log)

    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await CacheService.delete_pattern("products_list:*")

    res = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product.id)
    )
    return res.scalar_one()

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False  # Soft delete to preserve order histories
    await db.commit()
    await CacheService.delete_pattern("products_list:*")
    return None
