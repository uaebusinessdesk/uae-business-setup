export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>UBD Admin</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Admin dashboard (work in progress).
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a
          href="/"
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Home
        </a>
        <a
          href="/login"
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Login (next)
        </a>
      </div>
    </main>
  );
}
