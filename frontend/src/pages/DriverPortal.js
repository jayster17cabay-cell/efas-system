import React, { useState } from "react";

const API = "https://efas-system.onrender.com";

function Input({ label, type = "text", value, onChange, placeholder, required, onKeyDown }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#e53e3e" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        onKeyDown={onKeyDown}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          border: "1.5px solid #d1d5db", fontSize: 15, outline: "none",
          boxSizing: "border-box", color: "#111",
          transition: "border-color .2s",
        }}
        onFocus={e  => (e.target.style.borderColor = "#1a2a4a")}
        onBlur={e   => (e.target.style.borderColor = "#d1d5db")}
      />
    </div>
  );
}

function Btn({ children, onClick, loading, color = "#1a2a4a", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%", padding: "14px", borderRadius: 10, border: "none",
        background: loading || disabled ? "#9ca3af" : color,
        color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading || disabled ? "not-allowed" : "pointer",
        marginTop: 8, transition: "background .2s",
      }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    success: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    error:   { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    info:    { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
  };
  return (
    <div style={{ ...styles[type], borderRadius: 10, padding: "12px 16px", fontSize: 14, marginBottom: 16 }}>
      {message}
    </div>
  );
}

export default function DriverPortal() {
  const [screen, setScreen]   = useState("login");
  const [driver, setDriver]   = useState(null);
  const [token, setToken]     = useState("");

  const [loginEmail, setLoginEmail]         = useState("");
  const [loginPass, setLoginPass]           = useState("");
  const [loginLoading, setLoginLoading]     = useState(false);
  const [loginError, setLoginError]         = useState("");

  const [concern, setConcern]               = useState("");
  const [category, setCategory]             = useState("general");
  const [submitLoading, setSubmitLoading]   = useState(false);
  const [submitMsg, setSubmitMsg]           = useState({ type: "", text: "" });

  const [concerns, setConcerns]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────
  async function handleLogin() {
    setLoginError("");
    if (!loginEmail || !loginPass) { setLoginError("Enter your email and password."); return; }
    setLoginLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed.");

      // Check kung driver ang nag-login
      if (data.user?.role !== "driver") {
        throw new Error("Ang portal na ito ay para sa mga driver lamang.");
      }

      setDriver({
        name:       data.user.full_name,
        license_no: data.user.driver?.ltfrb_license ?? "",
        driver_id:  data.user.driver?.id ?? "",
        ...data.user.driver,
      });
      setToken(data.token);
      setScreen("portal");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Submit concern ─────────────────────────────────────────────────────
  async function handleSubmitConcern() {
    setSubmitMsg({ type: "", text: "" });
    if (!concern.trim()) { setSubmitMsg({ type: "error", text: "Please describe your concern." }); return; }
    setSubmitLoading(true);
    try {
      const res  = await fetch(`${API}/api/concerns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ concern_type: category, description: concern }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");
      setSubmitMsg({ type: "success", text: "Concern submitted successfully! Tatanggap ng response ang admin." });
      setConcern("");
      setCategory("general");
    } catch (err) {
      setSubmitMsg({ type: "error", text: err.message });
    } finally {
      setSubmitLoading(false);
    }
  }

  // ── Fetch concern history ──────────────────────────────────────────────
  async function loadHistory() {
    try {
      const res  = await fetch(`${API}/api/concerns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConcerns(Array.isArray(data) ? data : data.data ?? []);
      setShowHistory(true);
    } catch {
      setConcerns([]);
      setShowHistory(true);
    }
  }

  // ── Shell ──────────────────────────────────────────────────────────────
  const Shell = ({ children }) => (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#0f1e38 0%,#1a2a4a 60%,#243b6e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      padding: "0 0 40px",
    }}>
      <div style={{
        width: "100%", background: "rgba(255,255,255,.05)", backdropFilter: "blur(6px)",
        padding: "16px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)",
        boxSizing: "border-box",
      }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>⚖️ E.F.A.S.</span>
        {driver && (
          <button
            type="button"
            onClick={() => { setScreen("login"); setDriver(null); setToken(""); }}
            style={{ background: "rgba(255,255,255,.12)", border: "none", color: "#f87171",
              padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{
        width: "100%", maxWidth: 420, margin: "32px 16px 0",
        background: "#fff", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <Shell>
        <div style={{ padding: "32px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🚗</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a2a4a" }}>Driver Portal</h2>
            <p style={{ margin: "6px 0 0", color: "#666", fontSize: 14 }}>
              Log in to submit or track your concerns
            </p>
          </div>

          <Alert type="error" message={loginError} />

          <Input
            label="Email Address"
            type="email"
            value={loginEmail}
            onChange={setLoginEmail}
            placeholder="roberto@efas.gov.ph"
            required
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />
          <Input
            label="Password"
            type="password"
            value={loginPass}
            onChange={setLoginPass}
            placeholder="Enter your password"
            required
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />

          <Btn onClick={handleLogin} loading={loginLoading}>Sign In</Btn>

          <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 20 }}>
            Having trouble logging in? Contact your Admin.
          </p>
        </div>
      </Shell>
    );
  }

  // ── PORTAL SCREEN ──────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ padding: "28px 28px 32px" }}>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Logged in as</p>
          <h3 style={{ margin: "4px 0 0", fontSize: 20, color: "#1a2a4a", fontWeight: 800 }}>
            {driver?.full_name ?? driver?.name ?? "Driver"}
          </h3>
          {driver?.ltfrb_license && (
            <span style={{
              display: "inline-block", marginTop: 6, background: "#eef2ff",
              color: "#4338ca", fontSize: 12, fontWeight: 600,
              padding: "3px 10px", borderRadius: 20,
            }}>
              {driver.ltfrb_license}
            </span>
          )}
        </div>

        <h4 style={{ margin: "0 0 16px", color: "#1a2a4a", fontSize: 16 }}>📝 Submit a Concern</h4>

        {submitMsg.text && <Alert type={submitMsg.type} message={submitMsg.text} />}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334", marginBottom: 6 }}>
            Category <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1.5px solid #d1d5db", fontSize: 15, outline: "none",
              boxSizing: "border-box", background: "#fff", color: "#111",
            }}
          >
            <option value="general">General</option>
            <option value="payment">Payment / Salary</option>
            <option value="schedule">Schedule / Route</option>
            <option value="vehicle">Vehicle / Equipment</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334", marginBottom: 6 }}>
            Concern Details <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <textarea
            value={concern}
            onChange={e => setConcern(e.target.value)}
            placeholder="Describe your concern clearly…"
            rows={5}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1.5px solid #d1d5db", fontSize: 15, outline: "none",
              boxSizing: "border-box", resize: "vertical", color: "#111", fontFamily: "inherit",
            }}
            onFocus={e  => (e.target.style.borderColor = "#1a2a4a")}
            onBlur={e   => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        <Btn onClick={handleSubmitConcern} loading={submitLoading} color="#1a2a4a">
          Submit Concern
        </Btn>

        <button
          type="button"
          onClick={() => showHistory ? setShowHistory(false) : loadHistory()}
          style={{
            width: "100%", marginTop: 16, padding: "12px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", background: "#f9fafb",
            color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          {showHistory ? "Hide History ▲" : "View My Concerns ▼"}
        </button>

        {showHistory && (
          <div style={{ marginTop: 16 }}>
            {concerns.length === 0
              ? <p style={{ color: "#888", fontSize: 14, textAlign: "center" }}>No concerns submitted yet.</p>
              : concerns.map((c, i) => (
                <div key={i} style={{
                  background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 10,
                  border: "1px solid #e5e7eb",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                      {c.concern_type || c.category || "general"}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: c.status === "resolved" ? "#d1fae5" : c.status === "rejected" ? "#fee2e2" : "#fef3c7",
                      color:      c.status === "resolved" ? "#065f46" : c.status === "rejected" ? "#991b1b" : "#92400e",
                    }}>
                      {c.status ?? "pending"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>{c.description || c.message}</p>
                  {c.admin_response && (
                    <div style={{ marginTop: 8, padding: "8px 10px", background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e40af" }}>
                      💬 {c.admin_response}
                    </div>
                  )}
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  </p>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </Shell>
  );
}