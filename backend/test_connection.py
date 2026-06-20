from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
uri = os.getenv("MONGO_URI")
print("URI being used:", uri)  # so you can visually check it

client = MongoClient(uri)
try:
    client.admin.command("ping")
    print("✅ Connected successfully!")
except Exception as e:
    print("❌ Connection failed:", e)