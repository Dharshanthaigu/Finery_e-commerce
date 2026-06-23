from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Product(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    images: Optional[List[str]] = []
    category: Optional[str] = ""
    stock: int
    rating: Optional[float] = 0
    brand: Optional[str] = ""

class ProductOut(Product):
    id:str

class CartItem(BaseModel):
    product_id: str
    quantity: int