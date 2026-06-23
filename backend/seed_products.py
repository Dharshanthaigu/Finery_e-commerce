import asyncio
import httpx
from app.database import products_collection

async def fetch_dummyjson():
    async with httpx.AsyncClient() as client:
        res = await client.get("https://dummyjson.com/products?limit=194&skip=0")
        data = res.json()
        products = []
        for p in data["products"]:
            products.append({
                "name": p["title"],
                "description": p["description"],
                "price": float(p["price"]),
                "image_url": p["thumbnail"],
                "images": p.get("images", []),
                "category": p["category"],
                "stock": p["stock"],
                "rating": p.get("rating", 0),
                "brand": p.get("brand", ""),
            })
        return products

async def fetch_fakestore():
    async with httpx.AsyncClient() as client:
        res = await client.get("https://fakestoreapi.com/products")
        data = res.json()
        products = []
        for p in data:
            products.append({
                "name": p["title"],
                "description": p["description"],
                "price": float(p["price"]),
                "image_url": p["image"],
                "images": [p["image"]],
                "category": p["category"],
                "stock": 50,
                "rating": p.get("rating", {}).get("rate", 0),
                "brand": "",
            })
        return products

async def seed():
    print("Fetching products from DummyJSON...")
    dummy_products = await fetch_dummyjson()
    print(f"Got {len(dummy_products)} products from DummyJSON")

    print("Fetching products from Fake Store API...")
    fake_products = await fetch_fakestore()
    print(f"Got {len(fake_products)} products from Fake Store API")

    all_products = dummy_products + fake_products
    print(f"Total: {len(all_products)} products")

    print("Clearing existing products...")
    await products_collection.delete_many({})

    print("Inserting products...")
    await products_collection.insert_many(all_products)
    print(f"✅ Successfully seeded {len(all_products)} products!")

asyncio.run(seed())