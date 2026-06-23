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
  <div
    style={{
      maxWidth: "520px",
      margin: "60px auto",
      padding: "32px",
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      fontFamily: "Inter, sans-serif",
    }}
  >
    {/* Header */}
    <h2
      style={{
        marginBottom: "24px",
        color: "#1f2937",
        textAlign: "center",
        fontSize: "28px",
        fontWeight: 700,
      }}
    >
      Checkout
    </h2>

    {error && (
      <div
        style={{
          background: "#fef2f2",
          color: "#dc2626",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        {error}
      </div>
    )}

    {/* Order Summary */}
    {order ? (
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "14px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "16px",
            color: "#111827",
          }}
        >
          Order Summary
        </h3>

        {order.items?.map((item: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              color: "#374151",
            }}
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₹{item.price}</span>
          </div>
        ))}

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e5e7eb",
            margin: "16px 0",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: "20px",
            color: "#111827",
          }}
        >
          <span>Total</span>
          <span style={{ color: "#3395FF" }}>₹{order.total}</span>
        </div>
      </div>
    ) : (
      <p style={{ textAlign: "center", color: "#6b7280" }}>
        Loading order...
      </p>
    )}

    {/* Razorpay Notice */}
    <div
      style={{
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "14px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #bfdbfe",
        fontSize: "14px",
      }}
    >
      💳 Razorpay Test Mode — No real payment will be made.
    </div>

    {/* Buttons */}
    <div
      style={{
        display: "flex",
        gap: "12px",
      }}
    >
      <button
        onClick={() => navigate("/cart")}
        style={{
          flex: 1,
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          background: "#ffffff",
          color: "#374151",
          fontWeight: 600,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        ← Back to Cart
      </button>

      <button
        onClick={handlePayment}
        disabled={loading || !order}
        style={{
          flex: 1,
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background:
            loading || !order
              ? "#93c5fd"
              : "linear-gradient(135deg, #3395FF, #2563eb)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 6px 15px rgba(51,149,255,0.3)",
        }}
      >
        {loading ? "Processing..." : "Pay with Razorpay"}
      </button>
    </div>
  </div>
);
}