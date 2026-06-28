import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://efas-system.onrender.com";

const NAV_SUPERADMIN = [
  { key: "overview",   label: "Overview",       icon: "📊" },
  { key: "drivers",    label: "Manage Drivers", icon: "🚗" },
  { key: "complaints", label: "Complaints",     icon: "📋" },
  { key: "concerns",   label: "Concerns",       icon: "💬" },
];

const NAV_ADMIN = [
  { key: "overview",   label: "Overview",       icon: "📊" },
  { key: "drivers",    label: "Manage Drivers", icon: "🚗" },
  { key: "complaints", label: "Complaints",     icon: "📋" },
  { key: "concerns",   label: "Concerns",       icon: "💬" },
];

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "24px 28px",
      boxShadow: "0 2px 8px rgba(0,0,0,.07)", borderLeft: `5px solid ${color}`,
      minWidth: 160, flex: 1,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
function DataTable({ columns, rows, emptyText = "Walang records." }) {
  if (!rows || rows.length === 0)
    return <p style={{ color: "#888", padding: 16 }}>{emptyText}</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f0f4ff" }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#334" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: "10px 14px", color: "#333" }}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    new:        { bg: "#dbeafe", color: "#1e40af" },
    pending:    { bg: "#fff3cd", color: "#856404" },
    resolved:   { bg: "#d1e7dd", color: "#0a5c36" },
    rejected:   { bg: "#f8d7da", color: "#842029" },
    active:     { bg: "#d1e7dd", color: "#0a5c36" },
    inactive:   { bg: "#e2e3e5", color: "#41464b" },
  };
  const s = map[status?.toLowerCase()] || { bg: "#e9ecef", color: "#495057" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
    }}>
      {status ?? "—"}
    </span>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 360, width: "90%" }}>
        <p style={{ marginBottom: 24, color: "#333" }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onCancel}  style={btn("#e9ecef","#333")}>Kanselahin</button>
          <button onClick={onConfirm} style={btn("#dc3545","#fff")}>Kumpirmahin</button>
        </div>
      </div>
    </div>
  );
}

// ── Respond Modal (para sa Concerns) ─────────────────────────────────────────
function RespondModal({ concern, onClose, onSave }) {
  const [response, setResponse] = useState(concern.admin_response || "");
  const [status,   setStatus]   = useState(concern.status || "new");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 440, width: "90%" }}>
        <h3 style={{ margin: "0 0 8px", color: "#1a2a4a" }}>Sagutin ang Concern</h3>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
          <strong>{concern.driver_name}</strong> — {concern.concern_type}
        </p>
        <p style={{ fontSize: 14, color: "#333", background: "#f8fafc", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {concern.description}
        </p>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#334", display: "block", marginBottom: 6 }}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", marginBottom: 14, fontSize: 14 }}>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#334", display: "block", marginBottom: 6 }}>Sagot</label>
        <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4}
          placeholder="Isulat ang iyong sagot sa driver..."
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db",
            fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", marginBottom: 20 }} />
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onClose}                          style={btn("#e9ecef","#333")}>Kanselahin</button>
          <button onClick={() => onSave(concern.id, status, response)} style={btn("#1a2a4a","#fff")}>I-save</button>
        </div>
      </div>
    </div>
  );
}

const btn = (bg, color) => ({
  background: bg, color, border: "none", borderRadius: 8,
  padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14,
});

// ════════════════════════════════════════════════════════════════════════════
//  Main Component
// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user,      setUser]      = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats,     setStats]     = useState({});
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [confirm,   setConfirm]   = useState(null);
  const [respond,   setRespond]   = useState(null); // concern being responded to
  const [toast,     setToast]     = useState("");

  // ── Auth ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("efas_user");
    if (!stored) { navigate("/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "superadmin" && u.role !== "admin") { navigate("/login"); return; }
    setUser(u);
  }, [navigate]);

  const isSuperAdmin = user?.role === "superadmin";
  const navItems     = isSuperAdmin ? NAV_SUPERADMIN : NAV_ADMIN;
  const token        = localStorage.getItem("efas_token");
  const authHeaders  = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // ── Fetch stats ────────────────────────────────────────────────────────
  async function fetchStats() {
    try {
      const res = await fetch(`${API}/api/stats`, { headers: authHeaders });
      const d   = await res.json();
      // Backend returns { success, data: { total_drivers, active_drivers, ... } }
      const s   = d.data || d;
      setStats({
        drivers:    s.total_drivers    ?? s.drivers    ?? "—",
        complaints: s.total_complaints ?? s.complaints ?? "—",
        concerns:   s.new_concerns     ?? s.concerns   ?? "—",
        pending:    s.new_complaints   ?? s.pending    ?? "—",
        scans:      s.scans_today      ?? "—",
      });
    } catch { /* silent */ }
  }

  // ── Fetch tab data ─────────────────────────────────────────────────────
  async function fetchTab(tab) {
    setLoading(true);
    setData([]);
    const eps = {
      drivers:    "/api/drivers",
      complaints: "/api/complaints",
      concerns:   "/api/concerns",
    };
    const ep = eps[tab];
    if (!ep) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}${ep}`, { headers: authHeaders });
      const d   = await res.json();
      // Backend returns { success, data: [...] } OR plain array
      setData(Array.isArray(d) ? d : (d.data ?? []));
    } catch { setData([]); }
    finally  { setLoading(false); }
  }

  useEffect(() => {
    if (!user) return;
    fetchStats();
    if (activeTab !== "overview") fetchTab(activeTab);
  }, [activeTab, user]); // eslint-disable-line

  // ── Helpers ────────────────────────────────────────────────────────────
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function askConfirm(message, onConfirm) { setConfirm({ message, onConfirm }); }

  // Update driver status — backend uses /api/drivers/:id/status
  async function updateDriverStatus(id, status) {
    try {
      const res = await fetch(`${API}/api/drivers/${id}/status`, {
        method: "PATCH", headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast(`Driver ${status === "active" ? "na-activate" : "na-deactivate"}!`);
      fetchTab("drivers");
    } catch { showToast("Hindi na-update. Subukan ulit."); }
  }

  // Update complaint status — backend uses /api/complaints/:id with { status }
  async function updateComplaintStatus(id, status) {
    try {
      const res = await fetch(`${API}/api/complaints/${id}`, {
        method: "PATCH", headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast("Complaint na-update!");
      fetchTab("complaints");
    } catch { showToast("Hindi na-update. Subukan ulit."); }
  }

  // Respond to concern — backend uses /api/concerns/:id with { status, admin_response }
  async function saveConcernResponse(id, status, admin_response) {
    try {
      const res = await fetch(`${API}/api/concerns/${id}`, {
        method: "PATCH", headers: authHeaders,
        body: JSON.stringify({ status, admin_response }),
      });
      if (!res.ok) throw new Error();
      showToast("Concern na-update!");
      setRespond(null);
      fetchTab("concerns");
    } catch { showToast("Hindi na-update. Subukan ulit."); }
  }

  function handleLogout() {
    localStorage.removeItem("efas_user");
    localStorage.removeItem("efas_token");
    navigate("/login");
  }

  // ── Table configs (matching actual backend field names) ────────────────
  const tableConfig = {
    drivers: {
      columns: [
        { key: "id",            label: "ID" },
        { key: "full_name",     label: "Pangalan",    render: r => r.full_name || r.name || "—" },
        { key: "driver_code",   label: "Driver Code", render: r => r.driver_code || r.license_no || "—" },
        { key: "plate_number",  label: "Plate No.",   render: r => r.plate_number || r.plate || "—" },
        { key: "assigned_route",label: "Route",       render: r => r.assigned_route || r.route || "—" },
        { key: "status",        label: "Status",      render: r => <Badge status={r.status} /> },
        {
          key: "actions", label: "Aksyon",
          render: row => (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn("#198754","#fff")}
                onClick={() => askConfirm(`I-activate si ${row.full_name || row.name}?`, () => {
                  setConfirm(null); updateDriverStatus(row.id, "active");
                })}>
                Activate
              </button>
              <button style={btn("#6c757d","#fff")}
                onClick={() => askConfirm(`I-deactivate si ${row.full_name || row.name}?`, () => {
                  setConfirm(null); updateDriverStatus(row.id, "inactive");
                })}>
                Deactivate
              </button>
            </div>
          ),
        },
      ],
    },
    complaints: {
      columns: [
        { key: "id",          label: "ID" },
        { key: "driver_code", label: "Driver Code", render: r => r.driver_code || "—" },
        { key: "complaint",   label: "Reklamo",     render: r => r.complaint || r.description || r.message || "—" },
        { key: "status",      label: "Status",      render: r => <Badge status={r.status} /> },
        { key: "created_at",  label: "Petsa",       render: r => r.created_at?.slice(0,10) || "—" },
        {
          key: "actions", label: "Aksyon",
          render: row => (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btn("#0d6efd","#fff")}
                onClick={() => updateComplaintStatus(row.id, "resolved")}>
                Resolve
              </button>
              <button style={btn("#dc3545","#fff")}
                onClick={() => updateComplaintStatus(row.id, "rejected")}>
                Reject
              </button>
            </div>
          ),
        },
      ],
    },
    concerns: {
      columns: [
        { key: "id",           label: "ID" },
        { key: "driver_name",  label: "Driver" },
        { key: "concern_type", label: "Uri" },
        { key: "description",  label: "Detalye", render: r => (
          <span title={r.description} style={{ maxWidth: 220, display: "inline-block",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r.description}
          </span>
        )},
        { key: "status",      label: "Status",  render: r => <Badge status={r.status} /> },
        { key: "created_at",  label: "Petsa",   render: r => r.created_at?.slice(0,10) || "—" },
        {
          key: "actions", label: "Aksyon",
          render: row => (
            <button style={btn("#1a2a4a","#fff")} onClick={() => setRespond(row)}>
              Sagutin
            </button>
          ),
        },
      ],
    },
  };

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f5f7fb" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 230, background: "#1a2a4a", color: "#fff",
        display: "flex", flexDirection: "column", padding: "0 0 24px",
        position: "fixed", top: 0, left: 0, bottom: 0, overflowY: "auto",
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>⚖️ E.F.A.S.</div>
          <div style={{ fontSize: 11, color: "#8fa3c7", marginTop: 4 }}>
            {isSuperAdmin ? "Super Administrator" : "Administrator"}
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)} style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "11px 14px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 14,
              fontWeight: activeTab === item.key ? 700 : 400,
              background: activeTab === item.key ? "rgba(255,255,255,.12)" : "transparent",
              color: activeTab === item.key ? "#fff" : "#8fa3c7",
              marginBottom: 4, textAlign: "left", transition: "all .15s",
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "0 12px" }}>
          <div style={{ fontSize: 12, color: "#8fa3c7", padding: "0 14px 8px", wordBreak: "break-all" }}>
            {user.email}
          </div>
          <button onClick={handleLogout} style={{
            ...btn("rgba(255,255,255,.08)","#f87171"),
            width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 8,
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 230, flex: 1, padding: "32px 36px" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a2a4a", margin: 0 }}>
            {navItems.find(n => n.key === activeTab)?.label || "Dashboard"}
          </h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            E.F.A.S. — Electronic Filing and Adjudication System · Solano, Nueva Vizcaya
          </p>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard label="Kabuuang Drivers"  value={stats.drivers}    color="#0ea5e9" />
              <StatCard label="Mga Reklamo"        value={stats.complaints} color="#f59e0b" />
              <StatCard label="Bagong Concerns"    value={stats.concerns}   color="#10b981" />
              <StatCard label="Pending Complaints" value={stats.pending}    color="#ef4444" />
              <StatCard label="QR Scans Ngayon"    value={stats.scans}      color="#6366f1" />
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              {isSuperAdmin ? (
                <>
                  <h3 style={{ margin: "0 0 8px", color: "#1a2a4a" }}>🛡️ Super Admin</h3>
                  <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
                    May buong access ka: drivers, complaints, at concerns.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ margin: "0 0 8px", color: "#1a2a4a" }}>👤 Admin</h3>
                  <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
                    Maaari kang mag-manage ng drivers, complaints, at concerns.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Data Tabs */}
        {activeTab !== "overview" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            {loading
              ? <p style={{ color: "#888" }}>Naglo-load…</p>
              : <DataTable columns={tableConfig[activeTab]?.columns ?? []} rows={data} />
            }
          </div>
        )}
      </main>

      {/* Modals */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {respond && (
        <RespondModal
          concern={respond}
          onClose={() => setRespond(null)}
          onSave={saveConcernResponse}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28,
          background: "#1a2a4a", color: "#fff",
          padding: "12px 24px", borderRadius: 8,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,.2)", zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}