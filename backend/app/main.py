from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.routers import auth, products
from app.routers import auth, products, cart
from app.routers import auth, products, cart, orders, payments,admin

app = FastAPI(title="Ecommerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost",       # Docker frontend
        "http://localhost:80",    # Docker frontend explicit port
        "http://127.0.0.1",       # alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)



@app.get("/")
async def root():
    return {"message": "API is running"}