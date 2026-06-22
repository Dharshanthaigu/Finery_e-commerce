import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await api.post("/orders/");
        console.log("Created order response:", res.data);
        console.log("Order ID:", res.data.id);
        setOrder(res.data);
      } catch (e: any) {
        setError(e.response?.data?.detail || "Failed to create order. Make sure your cart is not empty.");
      }
    };
    if (!location.state?.order) {
      createOrder();
    } else {
      setOrder(location.state.order);
    }
  }, []);

  
  const handlePayment = async () => {
    if (!order) return;
    setLoading(true);
    setError("");
    try {
      // Step 1: Create PayPal payment
      const createRes = await api.post("/payments/create", { order_id: order.id });

      if (createRes.data.mock) {
        // Mock payment flow
        const captureRes = await api.post("/payments/capture", {
          order_id: order.id,
          paypal_order_id: "MOCK_ORDER_ID",
        });
        navigate("/order-complete", { state: { order: { ...order, status: captureRes.data.status } } });
      } else {
        // Real PayPal — redirect to approval URL
        window.location.href = createRes.data.approval_url;
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "60px auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2>Checkout</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {order ? (
        <div style={{ background: "#f9f9f9", padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          {order.items?.map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>{item.name} × {item.quantity}</span>
              <span>${item.price}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
            <span>Total</span>
            <span>${order.total}</span>
          </div>
        </div>
      ) : (
        <p style={{ color: "#999" }}>Loading order...</p>
      )}

      <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#856404" }}>
        💳 PayPal sandbox — no real payment will be made
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => navigate("/cart")}
          style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid #2c3e50", borderRadius: 6, cursor: "pointer" }}>
          Back to Cart
        </button>
        <button onClick={handlePayment} disabled={loading || !order}
          style={{ flex: 1, padding: 12, background: "#0070ba", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
          {loading ? "Processing..." : "Pay with PayPal"}
        </button>
      </div>
    </div>
  );
}