import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface CartItem { product_id: string; quantity: number; }
interface Cart { items: CartItem[]; }

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const navigate = useNavigate();

  const fetchCart = () => api.get("/cart/").then((r) => setCart(r.data));
  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (product_id: string) => {
    await api.delete(`/cart/${product_id}`);
    fetchCart();
  };

  const total = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Your Cart</h2>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2c3e50" }}>← Continue Shopping</button>
      </div>

      {!cart || cart.items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Your cart is empty.</div>
      ) : (
        <>
          {cart.items.map((item) => (
            <div key={item.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eee" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>Product ID: {item.product_id}</p>
                <p style={{ margin: 0, color: "#666" }}>Quantity: {item.quantity}</p>
              </div>
              <button onClick={() => removeItem(item.product_id)}
                style={{ padding: "6px 14px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Remove
              </button>
            </div>
          ))}
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <p style={{ fontSize: 18 }}>Total items: <strong>{total}</strong></p>
            <button onClick={() => navigate("/checkout")}
              style={{ padding: "12px 32px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}