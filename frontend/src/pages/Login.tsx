import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setAuth(res.data.access_token, email);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✨</div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>Finery</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Premium Shopping Experience</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: 40,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32, fontSize: 14 }}>Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "rgba(108,99,255,0.5)" : "linear-gradient(135deg, #6c63ff, #00d4aa)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#6c63ff", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}