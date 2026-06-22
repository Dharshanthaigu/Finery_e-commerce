import razorpay
import hmac
import hashlib
from app.config import settings

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
        key=settings.razorpay_key_secret.encode(),
        msg=f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(generated_signature, razorpay_signature)


def fetch_payment(payment_id: str) -> dict:
    return client.payment.fetch(payment_id)