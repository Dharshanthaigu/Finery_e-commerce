from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from app.database import products_collection
from app.schemas import ProductOut
from typing import Optional

router = APIRouter(prefix="/products", tags=["products"])

def serialize_product(product) -> dict:
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "image_url": product["image_url"],
        "images": product.get("images", []),
        "category": product.get("category", ""),
        "stock": product["stock"],
        "rating": product.get("rating", 0),
        "brand": product.get("brand", ""),
    }

@router.get("/", response_model=list[ProductOut])
async def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
):
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price

    products = []
    async for product in products_collection.find(query).skip(skip).limit(limit):
        products.append(serialize_product(product))
    return products

@router.get("/categories")
async def get_categories():
    categories = await products_collection.distinct("category")
    return sorted([c for c in categories if c])

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(product)