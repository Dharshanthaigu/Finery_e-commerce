import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    outline: "none",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: 500,
    display: "block",
    marginBottom: 8,
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
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✨</div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>Finery</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Join the premium experience</p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          padding: 40,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create account</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32, fontSize: 14 }}>Start shopping today</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters" required style={inputStyle} />
              {password.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: password.length >= i * 3
                        ? i <= 1 ? "#ff6b6b" : i <= 2 ? "#f39c12" : i <= 3 ? "#6c63ff" : "#00d4aa"
                        : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%",
              padding: "14px",
              background: loading ? "rgba(108,99,255,0.5)" : "linear-gradient(135deg, #6c63ff, #00d4aa)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6c63ff", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}