from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
import logging
from app.database import orders_collection, carts_collection, products_collection
from app.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/")
async def create_order(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = await carts_collection.find_one({"user_id": user_id})
    
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total = 0.0

    # Validate stock and verify prices server-side
    for item in cart["items"]:
        product = await products_collection.find_one({"_id": ObjectId(item["product_id"])})
        
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item['product_id']} no longer exists"
            )
        
        # Stock check at order time
        if product["stock"] <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"'{product['name']}' is out of stock"
            )
        if item["quantity"] > product["stock"]:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product['stock']} units of '{product['name']}' available"
            )

        # Server-side price verification (use DB price, not frontend price)
        verified_price = product["price"]
        line_total = verified_price * item["quantity"]
        total += line_total

        order_items.append({
            "product_id": item["product_id"],
            "name": product["name"],
            "price": verified_price,
            "quantity": item["quantity"],
            "image_url": product.get("image_url", ""),
        })

    # Deduct stock for each item
    for item in order_items:
        await products_collection.update_one(
            {"_id": ObjectId(item["product_id"])},
            {"$inc": {"stock": -item["quantity"]}}
        )
        logger.info(f"Stock deducted: {item['quantity']} units of {item['product_id']}")

    order_doc = {
        "user_id": user_id,
        "items": order_items,
        "total": round(total, 2),
        "status": "pending",
    }
    result = await orders_collection.insert_one(order_doc)

    # Clear cart after order
    await carts_collection.update_one(
        {"user_id": user_id},
        {"$set": {"items": []}}
    )

    logger.info(f"Order created: {result.inserted_id} for user {user_id}, total {total}")

    order_doc["id"] = str(result.inserted_id)
    order_doc.pop("_id", None)
    return order_doc

@router.get("/")
async def list_orders(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    orders = []
    async for order in orders_collection.find({"user_id": user_id}).sort("_id", -1):
        order["id"] = str(order["_id"])
        order.pop("_id", None)
        orders.append(order)
    return orders

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": user_id
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["id"] = str(order["_id"])
    order.pop("_id", None)
    return order

@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    order = await orders_collection.find_one({
        "_id": ObjectId(order_id),
        "user_id": user_id
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["status"] == "paid":
        raise HTTPException(status_code=400, detail="Paid orders cannot be cancelled")
    if order["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")

    # Restore stock on cancel
    for item in order.get("items", []):
        await products_collection.update_one(
            {"_id": ObjectId(item["product_id"])},
            {"$inc": {"stock": item["quantity"]}}
        )
        logger.info(f"Stock restored: {item['quantity']} units of {item['product_id']}")

    await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "cancelled"}}
    )
    return {"message": "Order cancelled", "order_id": order_id}