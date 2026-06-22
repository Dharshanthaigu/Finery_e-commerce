import { useLocation, useNavigate } from "react-router-dom";

export default function OrderComplete() {
  const { state } = useLocation();
  const order = state?.order;
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 600, margin: "100px auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textAlign: "center" }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2>Order Placed Successfully!</h2>
      {order && (
        <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8, textAlign: "left", marginTop: 20 }}>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Total:</strong> ${order.total}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Items:</strong></p>
          <ul>
            {order.items.map((item: any, i: number) => (
              <li key={i}>{item.name} × {item.quantity} — ${item.price}</li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center" }}>
        <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Continue Shopping
        </button>
        <button onClick={() => navigate("/orders")} style={{ padding: "10px 24px", background: "transparent", border: "1px solid #2c3e50", borderRadius: 6, cursor: "pointer" }}>
          View Orders
        </button>
      </div>
    </div>
  );
}