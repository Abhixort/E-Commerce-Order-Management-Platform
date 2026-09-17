from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.order import OrderStatus
from app.schemas.product import ProductResponse

class OrderCreate(BaseModel):
    shipping_address: str = Field(..., min_length=5)
    payment_method: str = Field("CREDIT_CARD")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    unit_price: float
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class PaymentLogResponse(BaseModel):
    id: int
    amount: float
    status: str
    transaction_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    shipping_address: str
    payment_method: str
    celery_task_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    payments: List[PaymentLogResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
