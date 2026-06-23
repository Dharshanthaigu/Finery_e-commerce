import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
        setOrder(res.data);
      } catch (e: any) {
        const detail = e.response?.data?.detail || "";
        if (detail.toLowerCase().includes("empty")) {
          navigate("/cart");  // redirect back to cart if empty
        } else {
          setError(detail || "Failed to create order.");
        }
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
      const createRes = await api.post("/payments/create", { order_id: order.id });

      if (createRes.data.mock) {
        const verifyRes = await api.post("/payments/verify", {
          order_id: order.id,
          razorpay_order_id: "MOCK_ORDER_ID",
          razorpay_payment_id: "MOCK_PAYMENT_ID",
          razorpay_signature: "MOCK_SIGNATURE",
        });
        navigate("/order-complete", { state: { order: { ...order, status: verifyRes.data.status } } });
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load Razorpay checkout. Check your connection and try again.");
        setLoading(false);
        return;
      }

      const options = {
        key: createRes.data.key_id,
        amount: createRes.data.amount,
        currency: createRes.data.currency,
        name: "Finery",
        description: `Order #${order.id}`,
        order_id: createRes.data.razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post("/payments/verify", {
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate("/order-complete", { state: { order: { ...order, status: verifyRes.data.status } } });
          } catch (e: any) {
            setError(e.response?.data?.detail || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: "#2c3e50",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Payment failed. Please try again.");
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
              <span>₹{item.price}</span>
            </div>
          ))}
          <hr />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      ) : (
        <p style={{ color: "#999" }}>Loading order...</p>
      )}

      <div style={{ background: "#fff3cd", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#856404" }}>
        💳 Razorpay test mode — no real payment will be made
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => navigate("/cart")}
          style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid #2c3e50", borderRadius: 6, cursor: "pointer" }}>
          Back to Cart
        </button>
        <button onClick={handlePayment} disabled={loading || !order}
          style={{ flex: 1, padding: 12, background: "#3395FF", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}