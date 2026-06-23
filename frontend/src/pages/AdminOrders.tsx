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
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--finery-cream)", fontFamily: "var(--finery-body)" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px clamp(24px, 6vw, 96px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <span style={{ display: "block", fontFamily: "var(--finery-body)", fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--finery-violet)", marginBottom: 6 }}>
              Admin
            </span>
            <h2 style={{ margin: 0, fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 28, color: "var(--finery-ink)", letterSpacing: "-0.3px" }}>
              Order Management
            </h2>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/admin/products")}
              style={{ background: "var(--finery-card)", border: "1px solid var(--finery-border)", color: "var(--finery-ink)", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, boxShadow: "0 1px 2px rgba(26,26,46,0.04)" }}
            >
              Stock Management
            </button>
            <button
              onClick={() => navigate("/")}
              style={{ background: "var(--finery-gradient)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(124,111,255,0.35)" }}
            >
              ← Back to Store
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: "14px 18px", background: "#EFEBFF", border: "1px solid rgba(124,111,255,0.3)", borderRadius: 12, marginBottom: 20, color: "var(--finery-ink)", fontFamily: "var(--finery-body)", fontSize: 14 }}>
            {message}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
          background: "var(--finery-card)",
          border: "1px solid var(--finery-border)",
          borderRadius: 14,
          padding: "16px 20px",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, color: "var(--finery-ink)" }}>Filter by status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setSkip(0); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--finery-border)", fontFamily: "var(--finery-body)", fontSize: 14, color: "var(--finery-ink)", background: "var(--finery-cream)", cursor: "pointer" }}
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <span style={{ fontFamily: "var(--finery-body)", color: "var(--finery-ink-soft)", fontSize: 14 }}>
            Total <strong style={{ color: "var(--finery-ink)", fontWeight: 700 }}>{total}</strong> orders
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "var(--finery-card)",
                borderRadius: 16,
                border: "1px solid var(--finery-border)",
                boxShadow: "0 2px 12px rgba(26,26,46,0.05)",
                padding: "22px 26px",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 16, color: "var(--finery-ink)" }}>
                    Order #{order.id.slice(-8)}
                  </p>
                  <p style={{ margin: "6px 0 0", color: "#B8B0C8", fontSize: 12, fontFamily: "var(--finery-body)" }}>
                    User: {order.user_id}
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: 14, fontFamily: "var(--finery-body)", color: "var(--finery-ink-soft)" }}>
                    {order.items.map((item, i) => (
                      <span key={i}>{item.name} × {item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
                    ))}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <span style={{ fontFamily: "var(--finery-display)", fontWeight: 700, fontSize: 20, color: "var(--finery-ink)" }}>₹{order.total}</span>
                  <span style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.3px",
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
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--finery-border)", fontSize: 13, fontFamily: "var(--finery-body)", cursor: "pointer", color: "var(--finery-ink)", background: "var(--finery-cream)" }}
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

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 32 }}>
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            style={{ background: "var(--finery-card)", border: "1px solid var(--finery-border)", color: "var(--finery-ink)", padding: "10px 20px", borderRadius: 10, cursor: skip === 0 ? "not-allowed" : "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, opacity: skip === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ fontFamily: "var(--finery-body)", color: "var(--finery-ink-soft)", fontSize: 14 }}>
            Page {Math.floor(skip / limit) + 1}
          </span>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total}
            style={{ background: "var(--finery-card)", border: "1px solid var(--finery-border)", color: "var(--finery-ink)", padding: "10px 20px", borderRadius: 10, cursor: skip + limit >= total ? "not-allowed" : "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, opacity: skip + limit >= total ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

