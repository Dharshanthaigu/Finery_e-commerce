from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_uri: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    paypal_client_id: str = ""
    paypal_secret: str = ""
    paypal_base_url: str = "https://api-m.sandbox.paypal.com"
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    class Config:
        env_file = ".env"

settings = Settings()