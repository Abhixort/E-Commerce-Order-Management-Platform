from typing import List
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_products: int
    low_stock_products_count: int
    pending_orders_count: int
    completed_orders_count: int

class LowStockProduct(BaseModel):
    id: int
    title: str
    sku: str
    stock_quantity: int
    price: float
