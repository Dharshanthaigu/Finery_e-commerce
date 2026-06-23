export default function SkeletonCard() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <div className="skeleton" style={{ height: 220, width: "100%" }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 16 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="skeleton" style={{ height: 28, width: "30%" }} />
          <div className="skeleton" style={{ height: 36, width: "45%" }} />
        </div>
      </div>
    </div>
  );
}