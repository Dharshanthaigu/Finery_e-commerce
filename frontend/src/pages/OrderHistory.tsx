import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface Order {
  id: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/").then((r) => setOrders(r.data));
  }, []);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--finery-cream)", fontFamily: "var(--finery-body)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px clamp(24px, 6vw, 96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 36 }}>
          <div>
            <span style={{ display: "block", fontFamily: "var(--finery-body)", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--finery-violet)", marginBottom: 6 }}>
              Your account
            </span>
            <h2 style={{ margin: 0, fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 30, color: "var(--finery-ink)", letterSpacing: "-0.3px" }}>
              Order History
            </h2>
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--finery-violet)", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
          >
            ← Back to Shop
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "var(--finery-card)",
            borderRadius: 20,
            border: "1px solid var(--finery-border)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛍️</div>
            <p style={{ color: "var(--finery-ink-soft)", fontFamily: "var(--finery-body)", fontSize: 15, margin: 0 }}>
              No orders yet — when you check out, they'll show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "var(--finery-card)",
                  borderRadius: 18,
                  border: "1px solid var(--finery-border)",
                  boxShadow: "0 4px 20px rgba(26,26,46,0.05)",
                  padding: "24px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  background:
                    order.status.toLowerCase() === "paid" ? "var(--finery-success)" :
                      order.status.toLowerCase() === "pending" ? "var(--finery-warning)" :
                        (order.status.toLowerCase() === "cancelled" || order.status.toLowerCase() === "failed") ? "var(--finery-danger)" :
                          "var(--finery-violet)",
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 16, color: "var(--finery-ink)" }}>
                    Order #{order.id.slice(-8)}
                  </span>
                  <span style={{
                    background:
                      order.status.toLowerCase() === "paid" ? "var(--finery-success-bg)" :
                        order.status.toLowerCase() === "pending" ? "var(--finery-warning-bg)" :
                          (order.status.toLowerCase() === "cancelled" || order.status.toLowerCase() === "failed") ? "var(--finery-danger-bg)" :
                            "#F1EEFF",
                    color:
                      order.status.toLowerCase() === "paid" ? "var(--finery-success)" :
                        order.status.toLowerCase() === "pending" ? "var(--finery-warning)" :
                          (order.status.toLowerCase() === "cancelled" || order.status.toLowerCase() === "failed") ? "var(--finery-danger)" :
                            "var(--finery-violet)",
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}>
                    {order.status}
                  </span>
                </div>
                <ul style={{ margin: "0 0 16px", padding: 0, listStyle: "none" }}>
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--finery-ink-soft)",
                        fontFamily: "var(--finery-body)",
                        fontSize: 14,
                        padding: "8px 0",
                        borderBottom: i < order.items.length - 1 ? "1px dashed var(--finery-border)" : "none",
                      }}
                    >
                      <span>{item.name} <span style={{ color: "#B8B0C8" }}>× {item.quantity}</span></span>
                      <span style={{ color: "var(--finery-ink)", fontWeight: 600 }}>₹{item.price}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 8, paddingTop: 12, borderTop: "1px solid var(--finery-border)" }}>
                  <span style={{ fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)" }}>Total</span>
                  <span style={{ fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 20, color: "var(--finery-ink)" }}>
                    ₹{order.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}