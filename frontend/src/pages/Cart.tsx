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
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--finery-cream)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--finery-body)", color: "var(--finery-ink-soft)", fontSize: 15 }}>
      Loading cart...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--finery-cream)", fontFamily: "var(--finery-body)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px clamp(24px, 6vw, 96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 28, color: "var(--finery-ink)", letterSpacing: "-0.3px" }}>
            Your Cart
          </h2>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--finery-violet)", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14 }}
          >
            ← Continue Shopping
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "var(--finery-card)",
            borderRadius: 20,
            border: "1px solid var(--finery-border)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
            <p style={{ fontSize: 16, color: "var(--finery-ink-soft)", fontFamily: "var(--finery-body)", margin: "0 0 20px" }}>
              Your cart is empty.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "12px 28px", background: "var(--finery-gradient)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(124,111,255,0.35)" }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div style={{
              background: "var(--finery-card)",
              borderRadius: 18,
              border: "1px solid var(--finery-border)",
              boxShadow: "0 4px 20px rgba(26,26,46,0.05)",
              overflow: "hidden",
            }}>
              {items.map((item, i) => (
                <div
                  key={item.product_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 24px",
                    borderTop: i === 0 ? "none" : "1px solid var(--finery-border)",
                  }}
                >
                  <img
                    src={item.image_url || "https://placehold.co/80x80"}
                    alt={item.name}
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12, border: "1px solid var(--finery-border)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontFamily: "var(--finery-display)", fontWeight: 600, fontSize: 15, color: "var(--finery-ink)" }}>
                      {item.name || "Product"}
                    </p>
                    <p style={{ margin: "4px 0 0", color: "var(--finery-ink-soft)", fontFamily: "var(--finery-body)", fontSize: 13 }}>
                      Quantity: {item.quantity}
                    </p>
                    <p style={{ margin: "6px 0 0", color: "var(--finery-ink)", fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 15 }}>
                      ₹{((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    style={{ padding: "8px 18px", background: "var(--finery-danger-bg)", color: "var(--finery-danger)", border: "1px solid rgba(225,85,84,0.3)", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              background: "var(--finery-card)",
              borderRadius: 18,
              border: "1px solid var(--finery-border)",
              boxShadow: "0 4px 20px rgba(26,26,46,0.05)",
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}>
              <span style={{ fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 22, color: "var(--finery-ink)" }}>
                Total: ₹{total.toFixed(2)}
              </span>
              <button
                onClick={() => navigate("/checkout")}
                style={{ padding: "14px 36px", background: "var(--finery-gradient)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 15, boxShadow: "0 4px 14px rgba(124,111,255,0.35)" }}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}