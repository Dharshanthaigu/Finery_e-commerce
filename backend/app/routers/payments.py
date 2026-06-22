from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.database import orders_collection
from app.dependencies import get_current_user
from app.paypal import create_paypal_order, capture_paypal_order
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["payments"])

class CreatePaymentRequest(BaseModel):
    order_id: str

class CapturePaymentRequest(BaseModel):
    order_id: str
    paypal_order_id: str

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

    # If no API key yet, return mock response
    if not settings.paypal_client_id or settings.paypal_client_id == "your_paypal_client_id_here":
        return {
            "mock": True,
            "order_id": body.order_id,
            "approval_url": None,
            "paypal_order_id": "MOCK_ORDER_ID",
            "message": "PayPal key not configured — using mock payment"
        }

    paypal_order = await create_paypal_order(order["total"])
    approval_url = next(
        (link["href"] for link in paypal_order["links"] if link["rel"] == "approve"),
        None
    )
    return {
        "mock": False,
        "order_id": body.order_id,
        "paypal_order_id": paypal_order["id"],
        "approval_url": approval_url,
    }

@router.post("/capture")
async def capture_payment(body: CapturePaymentRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]

    if not ObjectId.is_valid(body.order_id):
        raise HTTPException(status_code=400, detail="Invalid order ID")

    order = await orders_collection.find_one({"_id": ObjectId(body.order_id), "user_id": user_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Mock capture if no API key
    if body.paypal_order_id == "MOCK_ORDER_ID" or not settings.paypal_client_id or settings.paypal_client_id == "your_paypal_client_id_here":
        await orders_collection.update_one(
            {"_id": ObjectId(body.order_id)},
            {"$set": {"status": "paid", "payment_ref": "MOCK_PAYMENT"}}
        )
        return {"status": "paid", "message": "Mock payment successful", "order_id": body.order_id}

    # Real PayPal capture
    result = await capture_paypal_order(body.paypal_order_id)
    if result["status"] == "COMPLETED":
        await orders_collection.update_one(
            {"_id": ObjectId(body.order_id)},
            {"$set": {"status": "paid", "payment_ref": body.paypal_order_id}}
        )
        return {"status": "paid", "message": "Payment successful", "order_id": body.order_id}

    raise HTTPException(status_code=400, detail="Payment not completed")