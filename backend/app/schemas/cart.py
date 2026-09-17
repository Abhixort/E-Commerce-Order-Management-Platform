from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_amount: float = 0.0

    class Config:
        from_attributes = True
