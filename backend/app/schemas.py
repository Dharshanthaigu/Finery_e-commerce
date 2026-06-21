from pydantic import BaseModel, EmailStr

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
    stock: int

class ProductOut(Product):
    id:str

class CartItem(BaseModel):
    product_id: str
    quantity: int