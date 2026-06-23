from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import carts_collection, products_collection
from app.dependencies import get_current_user
from app.schemas import CartItem

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/")
async def get_cart(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = await carts_collection.find_one({"user_id": user_id})
    if not cart:
        return {"user_id": user_id, "items": []}
    cart["_id"] = str(cart["_id"])
    return cart

@router.post("/")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]

    if not ObjectId.is_valid(item.product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    #stock validation 
    if product["stock"] <= 0:
        raise HTTPException(status_code=400, detail="Product is out of stock")
    if item.quantity > product["stock"]:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product['stock']} items available in stock"
        )
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")


    cart = await carts_collection.find_one({"user_id": user_id})
    if not cart:
        await carts_collection.insert_one({"user_id": user_id, "items": [item.dict()]})
    else:
        items = cart.get("items", [])
        found = False
        for i in items:
            if i["product_id"] == item.product_id:
                new_qty = i["quantity"] + item.quantity
                if new_qty > product["stock"]:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Cannot add more. Only {product['stock']} items in stock"
                    )
                i["quantity"] = new_qty
                found = True
                break
        if not found:
            items.append(item.dict())
        await carts_collection.update_one(
            {"user_id": user_id},
            {"$set": {"items": items}}
        )

    updated = await carts_collection.find_one({"user_id": user_id})
    updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/{product_id}")
async def remove_from_cart(product_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    cart = await carts_collection.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = [i for i in cart.get("items", []) if i["product_id"] != product_id]
    await carts_collection.update_one({"user_id": user_id}, {"$set": {"items": items}})
    return {"message": "Item removed", "items": items}