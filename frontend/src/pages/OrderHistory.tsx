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
    <div style={{ maxWidth: 800, margin: "60px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Order History</h2>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "#2c3e50" }}>← Back to Shop</button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>No orders yet.</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: "bold" }}>Order #{order.id.slice(-8)}</span>
              <span style={{ background: "#e8f5e9", color: "#27ae60", padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>{order.status}</span>
            </div>
            <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ color: "#555", marginBottom: 4 }}>{item.name} × {item.quantity} — ₹{item.price}</li>
              ))}
            </ul>
            <div style={{ textAlign: "right", fontWeight: "bold", fontSize: 18 }}>Total: ₹{order.total}</div>
          </div>
        ))
      )}
    </div>
  );
}