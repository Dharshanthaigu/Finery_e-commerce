import { useLocation, useNavigate } from "react-router-dom";

export default function OrderComplete() {
  const { state } = useLocation();
  const order = state?.order;
  const navigate = useNavigate();

 return (
  <div
    style={{
      maxWidth: "650px",
      margin: "80px auto",
      padding: "40px",
      background: "#ffffff",
      borderRadius: "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      textAlign: "center",
      fontFamily: "Inter, sans-serif",
    }}
  >
    {/* Success Icon */}
    <div
      style={{
        width: "90px",
        height: "90px",
        margin: "0 auto 20px",
        borderRadius: "50%",
        background: "#dcfce7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
      }}
    >
      ✅
    </div>

    {/* Header */}
    <h1
      style={{
        margin: 0,
        color: "#111827",
        fontSize: "32px",
        fontWeight: 700,
      }}
    >
      Order Placed Successfully!
    </h1>

    <p
      style={{
        marginTop: "12px",
        color: "#6b7280",
        fontSize: "16px",
      }}
    >
      Thank you for your purchase. Your payment has been received.
    </p>

    {/* Order Details */}
    {order && (
      <div
        style={{
          marginTop: "32px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span style={{ color: "#6b7280" }}>Order ID</span>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
                wordBreak: "break-all",
              }}
            >
              {order.id}
            </div>
          </div>

          <div>
            <span style={{ color: "#6b7280" }}>Total Paid</span>
            <div
              style={{
                fontWeight: 700,
                color: "#16a34a",
                fontSize: "22px",
              }}
            >
              ₹{order.total}
            </div>
          </div>

          <div>
            <span style={{ color: "#6b7280" }}>Payment Status</span>
            <div
              style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "6px 12px",
                background: "#dcfce7",
                color: "#15803d",
                borderRadius: "999px",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {order.status}
            </div>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: "1px solid #e5e7eb",
            margin: "20px 0",
          }}
        />

        <h3
          style={{
            marginBottom: "16px",
            color: "#111827",
          }}
        >
          Purchased Items
        </h3>

        {order.items.map((item: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom:
                i !== order.items.length - 1
                  ? "1px solid #e5e7eb"
                  : "none",
            }}
          >
            <span style={{ color: "#374151" }}>
              {item.name} × {item.quantity}
            </span>

            <span
              style={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              ₹{item.price}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Buttons */}
    <div
      style={{
        display: "flex",
        gap: "16px",
        justifyContent: "center",
        marginTop: "32px",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "14px 28px",
          borderRadius: "12px",
          border: "none",
          background:
            "linear-gradient(135deg, #3395FF, #2563EB)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "15px",
          cursor: "pointer",
          boxShadow: "0 6px 15px rgba(51,149,255,0.3)",
        }}
      >
        Continue Shopping
      </button>

      <button
        onClick={() => navigate("/orders")}
        style={{
          padding: "14px 28px",
          borderRadius: "12px",
          border: "1px solid #d1d5db",
          background: "#fff",
          color: "#374151",
          fontWeight: 600,
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        View Orders
      </button>
    </div>
  </div>
);
}