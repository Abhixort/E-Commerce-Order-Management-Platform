from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(..., ge=0)
    category_id: Optional[int] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None

class InventoryAdjustment(BaseModel):
    product_id: int
    change_amount: int
    reason: str

class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    change_amount: int
    previous_stock: int
    new_stock: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
