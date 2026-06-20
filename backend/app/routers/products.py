from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import products_collection
from app.schemas import ProductOut

router = APIRouter(prefix="/products",tags=["products"])

def serialize_product(product) ->dict:
    return{
        "id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "image_url": product["image_url"],
        "stock": product["stock"]
    }

@router.get("/", response_model=list[ProductOut])
async def list_products():
    products = []
    async for product in products_collection.find():
        products.append(serialize_product(product))
    return products

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return serialize_product(product)
