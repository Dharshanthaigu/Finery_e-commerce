from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client["ecommerce"]

users_collection = db["users"]
products_collection = db["products"]
carts_collection = db["carts"]
orders_collection = db["orders"]