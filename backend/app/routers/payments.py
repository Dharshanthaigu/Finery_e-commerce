from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
import logging
from app.database import orders_collection
from app.dependencies import get_current_user
from app.razorpay_client import create_razorpay_order, verify_razorpay_signature
from app.config import settings
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

class CreatePaymentRequest(BaseModel):
    order_id: str

class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create")
async def create_payment(
    body: CreatePaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]
    logger.info(f"Payment create request for order {body.order_id} by user {user_id}")

    if not ObjectId.is_valid(body.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({
        "_id": ObjectId(body.order_id),
        "user_id": user_id
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["status"] == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    # Mock mode if no Razorpay key configured
    if not settings.razorpay_key_id or settings.razorpay_key_id == "your_key_here":
        logger.warning("Razorpay key not configured — returning mock response")
        return {
            "mock": True,
            "order_id": body.order_id,
            "razorpay_order_id": "MOCK_ORDER_ID",
            "amount": int(order["total"] * 100),
            "currency": "INR",
            "key_id": "mock_key",
        }

    razorpay_order = create_razorpay_order(
        amount=order["total"],
        currency="INR",
        receipt=str(body.order_id)[:40],
    )
    return {
        "mock": False,
        "order_id": body.order_id,
        "razorpay_order_id": razorpay_order["id"],
        "amount": razorpay_order["amount"],
        "currency": razorpay_order["currency"],
        "key_id": settings.razorpay_key_id,
    }

@router.post("/verify")
async def verify_payment(
    body: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["sub"]
    logger.info(f"Payment verify request for order {body.order_id} by user {user_id}")

    if not ObjectId.is_valid(body.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({
        "_id": ObjectId(body.order_id),
        "user_id": user_id
    })
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Mock verification
    if body.razorpay_order_id == "MOCK_ORDER_ID":
        await orders_collection.update_one(
            {"_id": ObjectId(body.order_id)},
            {"$set": {
                "status": "paid",
                "payment_ref": "MOCK_PAYMENT",
                "razorpay_order_id": "MOCK_ORDER_ID",
            }}
        )
        logger.info(f"Mock payment verified for order {body.order_id}")
        return {"status": "paid", "message": "Mock payment successful"}

    # Real Razorpay signature verification
    is_valid = verify_razorpay_signature(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature,
    )
    if not is_valid:
        logger.warning(f"Invalid signature for order {body.order_id}")
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    await orders_collection.update_one(
        {"_id": ObjectId(body.order_id)},
        {"$set": {
            "status": "paid",
            "payment_ref": body.razorpay_payment_id,
            "razorpay_order_id": body.razorpay_order_id,
        }}
    )
    logger.info(f"Payment verified for order {body.order_id}, payment {body.razorpay_payment_id}")
    return {"status": "paid", "message": "Payment verified successfully"}