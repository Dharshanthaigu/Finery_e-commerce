import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCart } from "../hooks/useCart"

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const { data: cart } = useCart();
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <nav style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 64,
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        onClick={() => navigate("/")}>
        <span style={{ fontSize: 24 }}>✨</span>
        <span style={{ fontFamily: "var(--finery-display)", color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>
          Finery
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--finery-body)", fontSize: 13, marginRight: 8 }}>{email}</span>

        <button
          onClick={() => navigate("/admin/products")}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "var(--finery-body)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ⚙️ Admin
        </button>

        <button
          onClick={() => navigate("/orders")}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "var(--finery-body)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          📦 Orders
        </button>

        <button
          onClick={() => navigate("/cart")}
          style={{
            position: "relative",
            background: "rgba(124,111,255,0.2)",
            border: "1px solid rgba(124,111,255,0.4)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "var(--finery-body)",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🛒 Cart
          {cartCount > 0 && (
            <span style={{
              background: "var(--finery-pink)",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </button>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          style={{
            background: "rgba(225,85,84,0.2)",
            border: "1px solid rgba(225,85,84,0.4)",
            color: "var(--finery-danger)",
            padding: "8px 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "var(--finery-body)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// function NavBtn({ onClick, emoji, label }: { onClick: () => void; emoji: string; label: string }) {
//   return (
//     <button onClick={onClick} style={{
//       background: "rgba(255,255,255,0.08)",
//       border: "1px solid rgba(255,255,255,0.15)",
//       color: "#fff",
//       padding: "8px 16px",
//       borderRadius: 10,
//       cursor: "pointer",
//       fontSize: 14,
//       fontWeight: 500,
//       display: "flex",
//       alignItems: "center",
//       gap: 6,
//     }}>
//       {emoji} {label}
//     </button>
//   );
// }