from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
import logging
from app.database import orders_collection, products_collection
from app.dependencies import get_current_user
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

# Simple admin check — in production use a proper role system
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    # For now any logged-in user can access admin
    # Later: check if user has admin role in DB
    return current_user

class RestockRequest(BaseModel):
    quantity: int

class OrderStatusRequest(BaseModel):
    status: str

@router.get("/products")
async def admin_list_products(
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_admin_user)
):
    products = []
    async for product in products_collection.find().skip(skip).limit(limit):
        products.append({
            "id": str(product["_id"]),
            "name": product["name"],
            "category": product.get("category", ""),
            "price": product["price"],
            "stock": product["stock"],
            "image_url": product.get("image_url", ""),
            "brand": product.get("brand", ""),
        })
    total = await products_collection.count_documents({})
    return {"products": products, "total": total}

@router.patch("/products/{product_id}/restock")
async def restock_product(
    product_id: str,
    body: RestockRequest,
    current_user: dict = Depends(get_admin_user)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if body.quantity <= 0:
        raise HTTPException(status_code=400, detail="Restock quantity must be positive")

    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$inc": {"stock": body.quantity}}
    )
    updated = await products_collection.find_one({"_id": ObjectId(product_id)})
    logger.info(f"Restocked {product_id} by {body.quantity} units")
    return {
        "id": product_id,
        "name": updated["name"],
        "stock": updated["stock"],
        "message": f"Added {body.quantity} units successfully"
    }

@router.get("/orders")
async def admin_list_orders(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    current_user: dict = Depends(get_admin_user)
):
    query = {}
    if status:
        query["status"] = status

    orders = []
    async for order in orders_collection.find(query).sort("_id", -1).skip(skip).limit(limit):
        order["id"] = str(order["_id"])
        order.pop("_id", None)
        orders.append(order)

    total = await orders_collection.count_documents(query)
    return {"orders": orders, "total": total}

@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    body: OrderStatusRequest,
    current_user: dict = Depends(get_admin_user)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": body.status}}
    )
    logger.info(f"Order {order_id} status updated to {body.status}")
    return {"order_id": order_id, "status": body.status, "message": "Status updated"}