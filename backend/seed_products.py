import asyncio
from app.database import products_collection

sample_products = [
    {"name": "Classic White Shirt", "description": "100% cotton, slim fit", "price": 29.99, "image_url": "https://placehold.co/400x400", "stock": 50},
    {"name": "Denim Jacket", "description": "Vintage wash, unisex", "price": 59.99, "image_url": "https://placehold.co/400x400", "stock": 30},
    {"name": "Leather Sneakers", "description": "Handcrafted, true to size", "price": 89.99, "image_url": "https://placehold.co/400x400", "stock": 20},
]

async def seed():
    await products_collection.delete_many({})
    await products_collection.insert_many(sample_products)
    print("✅ Seeded products")

asyncio.run(seed())