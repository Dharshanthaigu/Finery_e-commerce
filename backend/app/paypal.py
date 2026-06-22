import httpx
from app.config import settings

async def get_paypal_token() -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.paypal_base_url}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=(settings.paypal_client_id, settings.paypal_secret),
        )
        response.raise_for_status()
        return response.json()["access_token"]

async def create_paypal_order(amount: float, currency: str = "USD") -> dict:
    token = await get_paypal_token()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.paypal_base_url}/v2/checkout/orders",
            json={
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "amount": {
                            "currency_code": currency,
                            "value": str(round(amount, 2)),
                        }
                    }
                ],
                "application_context": {
                    "return_url": "http://localhost:5173/order-complete",
                    "cancel_url": "http://localhost:5173/cart",
                },
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        response.raise_for_status()
        return response.json()

async def capture_paypal_order(paypal_order_id: str) -> dict:
    token = await get_paypal_token()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.paypal_base_url}/v2/checkout/orders/{paypal_order_id}/capture",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        response.raise_for_status()
        return response.json()