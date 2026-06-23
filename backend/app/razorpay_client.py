import razorpay
import hmac
import hashlib
from app.config import settings

import logging
logger = logging.getLogger(__name__)

client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def create_razorpay_order(amount: float, currency: str = "INR", receipt: str = "") -> dict:
    amount_in_paise = int(round(amount * 100))
    order = client.order.create({
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt,
        "payment_capture": 1,
    })
    return order


def verify_razorpay_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    generated_signature = hmac.new(
        settings.razorpay_key_secret.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated_signature, razorpay_signature)


def fetch_payment(payment_id: str) -> dict:
    return client.payment.fetch(payment_id)