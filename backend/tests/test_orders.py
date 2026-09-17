import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_order_placement_and_inventory_stock_deduction(
    client: AsyncClient,
    admin_token_headers: dict,
    customer_token_headers: dict
):
    # 1. Admin creates product with 5 stock units
    prod_res = await client.post(
        "/api/v1/products",
        json={"sku": "ORD-ITEM-1", "title": "4K Monitor", "price": 300.00, "stock_quantity": 5},
        headers=admin_token_headers
    )
    product_id = prod_res.json()["id"]

    # 2. Customer adds 2 units to cart
    await client.post(
        "/api/v1/cart/items",
        json={"product_id": product_id, "quantity": 2},
        headers=customer_token_headers
    )

    # 3. Customer places order
    order_res = await client.post(
        "/api/v1/orders",
        json={"shipping_address": "123 Innovation Way, Tech City", "payment_method": "CREDIT_CARD"},
        headers=customer_token_headers
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    order_id = order_data["id"]
    assert order_data["total_amount"] == 600.00
    assert order_data["status"] in ["PENDING", "PROCESSING", "COMPLETED"]

    # 4. Check that cart is cleared
    cart_res = await client.get("/api/v1/cart", headers=customer_token_headers)
    assert len(cart_res.json()["items"]) == 0

    # 5. Check product stock quantity deducted from 5 to 3
    updated_prod_res = await client.get(f"/api/v1/products/{product_id}")
    assert updated_prod_res.json()["stock_quantity"] == 3

    # 6. Customer lists orders
    user_orders = await client.get("/api/v1/orders", headers=customer_token_headers)
    assert user_orders.status_code == 200
    assert len(user_orders.json()) >= 1
