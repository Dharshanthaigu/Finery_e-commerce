import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts, useCategories } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import Navbar from "../components/Navbar";
import SkeletonCard from "../components/SkeletonCard";
import { type Product } from "../types";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const { data: products, isLoading } = useProducts({ search, category, skip, limit });
  const { data: categories } = useCategories();
  const addToCart = useAddToCart();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSkip(0);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat === category ? "" : cat);
    setSkip(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "60px 32px",
        textAlign: "center",
        color: "#fff",
      }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: "-1px" }}>
          Discover Premium Products
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32 }}>
          214+ curated products across all categories
        </p>

        {/* Search */}
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "16px 24px 16px 52px",
              borderRadius: 50,
              border: "none",
              fontSize: 16,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "24px 32px 0", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
          <button
            onClick={() => handleCategory("")}
            style={{
              padding: "8px 20px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: "nowrap",
              background: category === "" ? "linear-gradient(135deg, #6c63ff, #00d4aa)" : "#fff",
              color: category === "" ? "#fff" : "#6b7280",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "all 0.2s",
            }}
          >
            All Products
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                padding: "8px 20px",
                borderRadius: 50,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: "nowrap",
                background: category === cat ? "linear-gradient(135deg, #6c63ff, #00d4aa)" : "#fff",
                color: category === cat ? "#fff" : "#6b7280",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ padding: "24px 32px" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {products?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart.mutate({ product_id: product.id, quantity: 1 })}
                  onViewDetails={() => navigate(`/products/${product.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 40 }}>
              <PaginationBtn onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0} label="← Previous" />
              <span style={{ padding: "10px 20px", background: "#fff", borderRadius: 10, fontWeight: 600 }}>
                Page {Math.floor(skip / limit) + 1}
              </span>
              <PaginationBtn onClick={() => setSkip(skip + limit)} disabled={(products?.length ?? 0) < limit} label="Next →" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, onViewDetails }: {
  product: Product;
  onAddToCart: () => void;
  onViewDetails: () => void;
}) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(108,99,255,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ position: "relative" }} onClick={onViewDetails}>
        <img
          src={product.image_url}
          alt={product.name}
          style={{ width: "100%", height: 220, objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x220"; }}
        />
        {isOutOfStock && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#ff6b6b", color: "#fff",
            padding: "4px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700,
          }}>Out of Stock</div>
        )}
        {isLowStock && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "#f39c12", color: "#fff",
            padding: "4px 12px", borderRadius: 50, fontSize: 12, fontWeight: 700,
          }}>Low Stock</div>
        )}
        {product.category && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(108,99,255,0.9)", color: "#fff",
            padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 600,
            textTransform: "capitalize",
          }}>{product.category}</div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#1a1a2e", lineHeight: 1.3 }}
          onClick={onViewDetails}>
          {product.name}
        </h3>
        {product.brand && (
          <p style={{ fontSize: 12, color: "#6c63ff", fontWeight: 600, marginBottom: 6 }}>{product.brand}</p>
        )}
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, lineHeight: 1.4 }}>
          {product.description.slice(0, 80)}...
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            <span style={{ color: "#f39c12", fontSize: 13 }}>{"★".repeat(Math.round(product.rating))}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>({product.rating.toFixed(1)})</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#6c63ff" }}>₹{product.price}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onViewDetails} style={{
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid #6c63ff",
              color: "#6c63ff",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}>Details</button>
            <button
              onClick={onAddToCart}
              disabled={isOutOfStock}
              style={{
                padding: "8px 14px",
                background: isOutOfStock ? "#e5e7eb" : "linear-gradient(135deg, #6c63ff, #00d4aa)",
                color: isOutOfStock ? "#9ca3af" : "#fff",
                border: "none",
                borderRadius: 8,
                cursor: isOutOfStock ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}>
              {isOutOfStock ? "Sold Out" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "10px 20px",
      background: disabled ? "#e5e7eb" : "linear-gradient(135deg, #6c63ff, #00d4aa)",
      color: disabled ? "#9ca3af" : "#fff",
      border: "none",
      borderRadius: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600,
      fontSize: 14,
    }}>{label}</button>
  );
}