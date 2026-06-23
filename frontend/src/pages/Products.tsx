import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products/").then((r) => setProducts(r.data));
  }, []);

  const addToCart = async (product_id: string) => {
    await api.post("/cart/", { product_id, quantity: 1 });
    alert("Added to cart!");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Finery Store</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#555" }}>{email}</span>
          <button onClick={() => navigate("/admin/products")} style={btnStyle}>⚙️ Admin</button>
          <button onClick={() => navigate("/cart")} style={btnStyle}>🛒 Cart</button>
          <button onClick={() => navigate("/orders")} style={btnStyle}>My Orders</button>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ ...btnStyle, background: "#e74c3c" }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {products.map((p) => (
          <div key={p.id} style={cardStyle}>
            <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8 }} />
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: "8px 0 4px" }}>{p.name}</h3>
              <p style={{ color: "#666", fontSize: 14, margin: "0 0 12px" }}>{p.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", fontSize: 18 }}>${p.price}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/products/${p.id}`)} style={btnOutlineStyle}>Details</button>
                  <button onClick={() => addToCart(p.id)} style={btnStyle}>Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 16px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const btnOutlineStyle = { padding: "8px 16px", background: "transparent", color: "#2c3e50", border: "1px solid #2c3e50", borderRadius: 6, cursor: "pointer" };
const cardStyle = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" };