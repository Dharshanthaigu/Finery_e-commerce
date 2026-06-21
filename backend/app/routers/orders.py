from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import orders_collection, carts_collection, products_collection
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/")
async def create_order(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = await carts_collection.find_one({"user_id": user_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0.0
    for item in cart["items"]:
        product = await products_collection.find_one({"_id": ObjectId(item["product_id"])})
        if not product:
            continue
        line_total = product["price"] * item["quantity"]
        total += line_total
        order_items.append({
            "product_id": item["product_id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item["quantity"],
        })

    order_doc = {
        "user_id": user_id,
        "items": order_items,
        "total": round(total, 2),
        "status": "pending",
    }
    result = await orders_collection.insert_one(order_doc)

    # Clear the cart after checkout
    await carts_collection.update_one({"user_id": user_id}, {"$set": {"items": []}})

    order_doc["id"] = str(result.inserted_id)
    order_doc.pop("_id", None)
    return order_doc

@router.get("/")
async def list_orders(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    orders = []
    async for order in orders_collection.find({"user_id": user_id}):
        order["id"] = str(order["_id"])
        order.pop("_id", None)
        orders.append(order)
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await orders_collection.find_one({"_id": ObjectId(order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["id"] = str(order["_id"])
    order.pop("_id", None)
    return order