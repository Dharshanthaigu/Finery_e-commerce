import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface CartItem {
  product_id: string;
  quantity: number;
  name?: string;
  image_url?: string;
  price?: number;
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const cartRes = await api.get("/cart/");
      const cartItems: CartItem[] = cartRes.data.items || [];

      // Fetch product details for each item
      const enriched = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const productRes = await api.get(`/products/${item.product_id}`);
            return {
              ...item,
              name: productRes.data.name,
              image_url: productRes.data.image_url,
              price: productRes.data.price,
            };
          } catch {
            return item;
          }
        })
      );
      setItems(enriched);
    } catch (e) {
      console.error("Failed to fetch cart", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (product_id: string) => {
    await api.delete(`/cart/${product_id}`);
    fetchCart();
  };

  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Loading cart...</div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Your Cart</h2>
        <button onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#2c3e50", fontSize: 14 }}>
          ← Continue Shopping
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
          <p style={{ fontSize: 18 }}>Your cart is empty.</p>
          <button onClick={() => navigate("/")}
            style={{ padding: "10px 24px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
            Shop Now
          </button>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid #eee" }}>
              <img
                src={item.image_url || "https://placehold.co/80x80"}
                alt={item.name}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: 15 }}>{item.name || "Product"}</p>
                <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>Quantity: {item.quantity}</p>
                <p style={{ margin: "4px 0 0", color: "#2c3e50", fontWeight: "bold" }}>
                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
              <button onClick={() => removeItem(item.product_id)}
                style={{ padding: "6px 14px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Remove
              </button>
            </div>
          ))}

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <p style={{ fontSize: 20, fontWeight: "bold" }}>Total: ₹{total.toFixed(2)}</p>
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