import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  brand: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [restockQty, setRestockQty] = useState<{ [key: string]: number }>({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const limit = 20;

  const fetchProducts = async () => {
    const res = await api.get(`/admin/products?skip=${skip}&limit=${limit}`);
    setProducts(res.data.products);
    setTotal(res.data.total);
  };

  useEffect(() => { fetchProducts(); }, [skip]);

  const handleRestock = async (product_id: string, name: string) => {
    const qty = restockQty[product_id];
    if (!qty || qty <= 0) {
      setMessage("Enter a valid quantity");
      return;
    }
    try {
      const res = await api.patch(`/admin/products/${product_id}/restock`, { quantity: qty });
      setMessage(`✅ ${name} restocked by ${qty} units. New stock: ${res.data.stock}`);
      fetchProducts();
      setRestockQty((prev) => ({ ...prev, [product_id]: 0 }));
      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setMessage(`❌ ${e.response?.data?.detail || "Restock failed"}`);
      setTimeout(() => setMessage(""), 3000);
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
              Product Stock Management
            </h2>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/admin/orders")}
              style={{ background: "var(--finery-card)", border: "1px solid var(--finery-border)", color: "var(--finery-ink)", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 14, boxShadow: "0 1px 2px rgba(26,26,46,0.04)" }}
            >
              View Orders
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

        <p style={{ color: "var(--finery-ink-soft)", fontFamily: "var(--finery-body)", fontSize: 14, marginBottom: 20 }}>
          Total products <strong style={{ color: "var(--finery-ink)", fontWeight: 700 }}>{total}</strong> — showing {skip + 1}–{Math.min(skip + limit, total)}
        </p>

        <div style={{
          background: "var(--finery-card)",
          borderRadius: 18,
          border: "1px solid var(--finery-border)",
          boxShadow: "0 4px 20px rgba(26,26,46,0.05)",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--finery-ink)" }}>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Image</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Product</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Category</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Price</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Stock</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: "#fff", fontFamily: "var(--finery-body)", fontWeight: 600, fontSize: 13, letterSpacing: "0.3px" }}>Restock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? "var(--finery-card)" : "#FFFCFA", borderTop: "1px solid var(--finery-border)" }}>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)", verticalAlign: "middle" }}>
                    <img src={p.image_url} alt={p.name} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 10, border: "1px solid var(--finery-border)" }} />
                  </td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)", verticalAlign: "middle" }}>
                    <div style={{ fontFamily: "var(--finery-display)", fontWeight: 600, fontSize: 14, color: "var(--finery-ink)" }}>{p.name}</div>
                    <div style={{ color: "#B8B0C8", fontFamily: "var(--finery-body)", fontSize: 12, marginTop: 2 }}>{p.brand}</div>
                  </td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)", verticalAlign: "middle" }}>
                    <span style={{ background: "#F1EEFF", color: "var(--finery-violet)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "var(--finery-body)" }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, fontWeight: 600, color: "var(--finery-ink)", verticalAlign: "middle" }}>₹{p.price}</td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)", verticalAlign: "middle" }}>
                    <span style={{
                      fontWeight: 700,
                      fontFamily: "var(--finery-body)",
                      fontSize: 13,
                      color: p.stock === 0 ? "var(--finery-danger)" : p.stock < 5 ? "var(--finery-warning)" : "var(--finery-success)",
                      background: p.stock === 0 ? "var(--finery-danger-bg)" : p.stock < 5 ? "var(--finery-warning-bg)" : "var(--finery-success-bg)",
                      padding: "5px 12px",
                      borderRadius: 20,
                      display: "inline-block",
                    }}>
                      {p.stock === 0 ? "Out of stock" : p.stock < 5 ? `⚠ ${p.stock} left` : p.stock}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--finery-body)", fontSize: 13, color: "var(--finery-ink-soft)", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        min={1}
                        value={restockQty[p.id] || ""}
                        onChange={(e) => setRestockQty((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                        placeholder="Qty"
                        style={{ width: 64, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--finery-border)", fontFamily: "var(--finery-body)", fontSize: 13, background: "var(--finery-cream)" }}
                      />
                      <button
                        onClick={() => handleRestock(p.id, p.name)}
                        style={{ padding: "8px 16px", background: "var(--finery-gradient)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--finery-body)", boxShadow: "0 2px 8px rgba(124,111,255,0.3)" }}
                      >
                        Add
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 28 }}>
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

// const btnStyle = { padding: "8px 16px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
// const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontWeight: "600" };
// const tdStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #f0f0f0" };