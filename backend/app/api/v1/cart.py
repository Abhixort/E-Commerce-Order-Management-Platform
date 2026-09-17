from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemAdd, CartItemUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

async def _get_or_create_user_cart(user_id: int, db: AsyncSession) -> Cart:
    result = await db.execute(
        select(Cart)
        .options(
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category)
        )
        .where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        result = await db.execute(
            select(Cart)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category)
            )
            .where(Cart.user_id == user_id)
        )
        cart = result.scalar_one()
    return cart

@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cart = await _get_or_create_user_cart(current_user.id, db)
    total = sum(item.product.price * item.quantity for item in cart.items if item.product and item.product.is_active)
    
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": cart.items,
        "total_amount": round(total, 2)
    }

@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item_in: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify Product
    prod_res = await db.execute(select(Product).where(Product.id == item_in.product_id))
    product = prod_res.scalar_one_or_none()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not available")
    
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({product.stock_quantity})"
        )

    cart = await _get_or_create_user_cart(current_user.id, db)

    # Check if item exists in cart
    existing_item = next((i for i in cart.items if i.product_id == item_in.product_id), None)
    if existing_item:
        new_qty = existing_item.quantity + item_in.quantity
        if product.stock_quantity < new_qty:
            raise HTTPException(
                status_code=400,
                detail=f"Total cart quantity ({new_qty}) exceeds stock ({product.stock_quantity})"
            )
        existing_item.quantity = new_qty
    else:
        new_cart_item = CartItem(
            cart=cart,
            product_id=item_in.product_id,
            product=product,
            quantity=item_in.quantity
        )
        db.add(new_cart_item)

    await db.commit()
    return await get_cart(current_user, db)

@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item_quantity(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cart = await _get_or_create_user_cart(current_user.id, db)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item.product.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Quantity ({item_in.quantity}) exceeds stock ({item.product.stock_quantity})"
        )

    item.quantity = item_in.quantity
    await db.commit()
    return await get_cart(current_user, db)

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cart = await _get_or_create_user_cart(current_user.id, db)
    item = next((i for i in cart.items if i.id == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    if item in cart.items:
        cart.items.remove(item)
    await db.commit()
    return await get_cart(current_user, db)

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cart = await _get_or_create_user_cart(current_user.id, db)
    for item in cart.items:
        await db.delete(item)
    await db.commit()
    return None
