from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import orders_collection
from app.dependencies import get_current_user
from app.razorpay_client import create_razorpay_order, verify_razorpay_signature
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["payments"])


class CreatePaymentRequest(BaseModel):
    order_id: str


class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create")
async def create_payment(body: CreatePaymentRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]

    if not ObjectId.is_valid(body.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({"_id": ObjectId(body.order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    if not settings.razorpay_key_id:
        return {
            "mock": True,
            "order_id": body.order_id,
            "razorpay_order_id": "MOCK_ORDER_ID",
            "amount": order["total"],
            "key_id": None,
            "message": "Razorpay key not configured — using mock payment",
        }

    razorpay_order = create_razorpay_order(order["total"], receipt=body.order_id)

    return {
        "mock": False,
        "order_id": body.order_id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": razorpay_order["amount"],
        "currency": razorpay_order["currency"],
        "key_id": settings.razorpay_key_id,
    }


@router.post("/verify")
async def verify_payment(body: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]

    if not ObjectId.is_valid(body.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({"_id": ObjectId(body.order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.razorpay_order_id == "MOCK_ORDER_ID" or not settings.razorpay_key_id:
        await orders_collection.update_one(
            {"_id": ObjectId(body.order_id)},
            {"$set": {"status": "paid", "payment_ref": "MOCK_PAYMENT"}},
        )
        return {"status": "paid", "message": "Mock payment successful", "order_id": body.order_id}

    is_valid = verify_razorpay_signature(
        body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment verification failed — signature mismatch")

    await orders_collection.update_one(
        {"_id": ObjectId(body.order_id)},
        {"$set": {"status": "paid", "payment_ref": body.razorpay_payment_id}},
    )
    return {"status": "paid", "message": "Payment successful", "order_id": body.order_id}