import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: { [key: string]: string } = {
  pending: "#f39c12",
  paid: "#27ae60",
  shipped: "#3498db",
  delivered: "#2c3e50",
  cancelled: "#e74c3c",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const limit = 20;

  const fetchOrders = async () => {
    const statusParam = filterStatus ? `&status=${filterStatus}` : "";
    const res = await api.get(`/admin/orders?skip=${skip}&limit=${limit}${statusParam}`);
    setOrders(res.data.orders);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchOrders(); }, [skip, filterStatus]);

  const updateStatus = async (order_id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${order_id}/status`, { status });
      setMessage(`✅ Order #${order_id.slice(-6)} updated to "${status}"`);
      fetchOrders();
    } catch (e: any) {
      setMessage(`❌ ${e.response?.data?.detail || "Update failed"}`);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Admin — Order Management</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/admin/products")} style={btnStyle}>Stock Management</button>
          <button onClick={() => navigate("/")} style={btnStyle}>← Back to Store</button>
        </div>
      </div>

      {message && (
        <div style={{ padding: 12, background: "#f0f9ff", borderRadius: 8, marginBottom: 16 }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <label style={{ fontWeight: "bold" }}>Filter by status:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setSkip(0); }}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd" }}>
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span style={{ color: "#666" }}>Total: <strong>{total}</strong> orders</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((order) => (
          <div key={order.id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: 15 }}>Order #{order.id.slice(-8)}</p>
                <p style={{ margin: "4px 0 0", color: "#666", fontSize: 12 }}>User: {order.user_id}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                  {order.items.map((item, i) => (
                    <span key={i}>{item.name} × {item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
                  ))}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={{ fontWeight: "bold", fontSize: 18 }}>₹{order.total}</span>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: "bold",
                  background: `${STATUS_COLORS[order.status]}20`,
                  color: STATUS_COLORS[order.status],
                }}>
                  {order.status.toUpperCase()}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, cursor: "pointer" }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0} style={btnStyle}>← Previous</button>
        <span style={{ padding: "8px 16px" }}>Page {Math.floor(skip / limit) + 1}</span>
        <button onClick={() => setSkip(skip + limit)} disabled={skip + limit >= total} style={btnStyle}>Next →</button>
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 16px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };