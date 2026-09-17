import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_product_crud_and_rbac(client: AsyncClient, admin_token_headers: dict, customer_token_headers: dict):
    # 1. Admin creates Category
    cat_res = await client.post(
        "/api/v1/products/categories",
        json={"name": "Audio", "description": "Headphones & Speakers"},
        headers=admin_token_headers
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # 2. Admin creates Product
    prod_res = await client.post(
        "/api/v1/products",
        json={
            "sku": "AUD-001",
            "title": "Studio Headphones",
            "description": "High fidelity audio",
            "price": 199.99,
            "stock_quantity": 25,
            "category_id": cat_id
        },
        headers=admin_token_headers
    )
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["id"]

    # 3. Customer attempts to create product (Should fail with 403 Forbidden)
    forbidden_res = await client.post(
        "/api/v1/products",
        json={
            "sku": "AUD-002",
            "title": "Unauthorized Headphone",
            "price": 99.99,
            "stock_quantity": 10
        },
        headers=customer_token_headers
    )
    assert forbidden_res.status_code == 403

    # 4. Public lists products
    list_res = await client.get("/api/v1/products")
    assert list_res.status_code == 200
    products = list_res.json()
    assert len(products) >= 1
    assert products[0]["sku"] == "AUD-001"

    # 5. Public gets product detail
    detail_res = await client.get(f"/api/v1/products/{prod_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == "Studio Headphones"
