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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Admin — Product Stock Management</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/admin/orders")}
            style={btnStyle}>View Orders</button>
          <button onClick={() => navigate("/")}
            style={btnStyle}>← Back to Store</button>
        </div>
      </div>

      {message && (
        <div style={{ padding: 12, background: "#f0f9ff", borderRadius: 8, marginBottom: 16, color: "#2c3e50" }}>
          {message}
        </div>
      )}

      <p style={{ color: "#666", marginBottom: 16 }}>
        Total products: <strong>{total}</strong> — Showing {skip + 1}–{Math.min(skip + limit, total)}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#2c3e50", color: "#fff" }}>
            <th style={thStyle}>Image</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Restock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
              <td style={tdStyle}>
                <img src={p.image_url} alt={p.name}
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
              </td>
              <td style={tdStyle}>
                <div style={{ fontWeight: "bold", fontSize: 13 }}>{p.name}</div>
                <div style={{ color: "#999", fontSize: 11 }}>{p.brand}</div>
              </td>
              <td style={tdStyle}>{p.category}</td>
              <td style={tdStyle}>₹{p.price}</td>
              <td style={tdStyle}>
                <span style={{
                  fontWeight: "bold",
                  color: p.stock === 0 ? "#e74c3c" : p.stock < 5 ? "#f39c12" : "#27ae60"
                }}>
                  {p.stock === 0 ? "Out of Stock" : p.stock < 5 ? `⚠️ ${p.stock}` : p.stock}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="number"
                    min={1}
                    value={restockQty[p.id] || ""}
                    onChange={(e) => setRestockQty((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                    placeholder="Qty"
                    style={{ width: 60, padding: "4px 8px", borderRadius: 4, border: "1px solid #ddd" }}
                  />
                  <button onClick={() => handleRestock(p.id, p.name)}
                    style={{ padding: "4px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                    Add
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0}
          style={btnStyle}>← Previous</button>
        <span style={{ padding: "8px 16px" }}>Page {Math.floor(skip / limit) + 1}</span>
        <button onClick={() => setSkip(skip + limit)} disabled={skip + limit >= total}
          style={btnStyle}>Next →</button>
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 16px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontWeight: "600" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #f0f0f0" };