import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data));
  }, [id]);

  const addToCart = async () => {
    await api.post("/cart/", { product_id: id, quantity: qty });
    alert("Added to cart!");
    navigate("/cart");
  };

  if (!product) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "60px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20, background: "none", border: "none", cursor: "pointer", color: "#2c3e50", fontSize: 16 }}>← Back</button>
      <img src={product.image_url} alt={product.name} style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 8 }} />
      <h2 style={{ marginTop: 20 }}>{product.name}</h2>
      <p style={{ color: "#666" }}>{product.description}</p>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>${product.price}</p>
      <p style={{ color: product.stock > 0 ? "green" : "red" }}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20 }}>
        <input type="number" min={1} max={product.stock} value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          style={{ width: 60, padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <button onClick={addToCart} disabled={product.stock === 0}
          style={{ padding: "10px 24px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}