import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_shopping_cart_workflow(client: AsyncClient, admin_token_headers: dict, customer_token_headers: dict):
    # Admin creates product
    prod_res = await client.post(
        "/api/v1/products",
        json={"sku": "CART-PROD-1", "title": "Test Gaming Mouse", "price": 49.99, "stock_quantity": 10},
        headers=admin_token_headers
    )
    product_id = prod_res.json()["id"]

    # Customer adds product to cart
    add_res = await client.post(
        "/api/v1/cart/items",
        json={"product_id": product_id, "quantity": 2},
        headers=customer_token_headers
    )
    assert add_res.status_code == 200
    cart_data = add_res.json()
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["quantity"] == 2
    assert cart_data["total_amount"] == 99.98

    # Customer gets cart
    get_res = await client.get("/api/v1/cart", headers=customer_token_headers)
    assert get_res.status_code == 200
    assert len(get_res.json()["items"]) == 1

    # Customer removes item
    item_id = cart_data["items"][0]["id"]
    del_res = await client.delete(f"/api/v1/cart/items/{item_id}", headers=customer_token_headers)
    assert del_res.status_code == 200
    assert len(del_res.json()["items"]) == 0
