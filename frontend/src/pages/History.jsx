import React, { useState, useEffect, useContext } from "react";
import { apiFetch } from "../services/api"; 
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function History() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiFetch("/api/history");
        setHistory(data);
      } catch (err) {
        setError("Failed to load history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const downloadCSV = () => {
    let csvContent = "Date,URL,Total Images,Missing Alt Tags,Status\n";

    history.forEach(scan => {
      const date = new Date(scan.timestamp).toLocaleDateString();
      const status = scan.without_alt > 0 ? "Needs Work" : "Perfect";
      const row = `"${date}","${scan.url}",${scan.total_img},${scan.without_alt},"${status}"`;
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "scan_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoText}>ImgScan</div>
          <div style={styles.logoSub}>Accessibility Auditor</div>
        </div>

        <nav>
          {[
            { icon: "⬡", label: "Scanner", path: "/dashboard" },
            { icon: "◫", label: "Reports", path: "/reports" },
            { icon: "◈", label: "History", path: "/history" },
          ].map((item) => {
            const isActive = location.pathname === item.path; 
            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{ 
                  ...styles.navItem, 
                  ...(isActive ? styles.navItemActive : {}) 
                }}
              >
                <span style={{ fontSize: "14px", opacity: 0.8 }}>{item.icon}</span>
                {item.label}
              </div>
            );
          })}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.userName}>{user?.username || "User"}</div>
              <div style={styles.userRole}>Member</div>
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        {loading && <div style={styles.loading}>Loading history...</div>}
        {error && <div style={styles.error}>{error}</div>}
        
        {!loading && !error && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
              <div style={styles.header}>
                <h1 style={styles.title}>Scan History</h1>
                <p style={styles.subtitle}>Review your previous accessibility audits and data.</p>
              </div>
              
              {history.length > 0 && (
                <button 
                  onClick={downloadCSV}
                  style={{ 
                    padding: "10px 20px", 
                    background: "#a78bfa", 
                    color: "#111118", 
                    border: "none", 
                    borderRadius: "8px", 
                    cursor: "pointer", 
                    fontWeight: "700" 
                  }}
                >
                  ↓ Download CSV
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={styles.emptyState}>No scans found. Go to the dashboard to scan your first URL!</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>URL</th>
                      <th style={styles.th}>Total Images</th>
                      <th style={styles.th}>Missing Alt Tags</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((scan) => {
                      const hasIssues = scan.without_alt > 0;
                      return (
                        <tr key={scan.id} style={styles.tr}>
                          <td style={styles.td}>
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </td>
                          <td style={{ ...styles.td, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span 
                              onClick={() => navigate("/dashboard", { state: { autoScanUrl: scan.url } })} 
                              style={styles.link}
                              title="Click to run a new scan on this URL"
                            >
                              {scan.url}
                            </span>
                          </td>
                          <td style={styles.td}>{scan.total_img}</td>
                          <td style={{ ...styles.td, color: hasIssues ? "#f87171" : "#34d399", fontWeight: "700" }}>
                            {scan.without_alt}
                          </td>
                          <td style={styles.td}>
                            {hasIssues ? "Needs Work ⚠️" : "Perfect ✅"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0a0a0f", color: "#e8e6f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "0", display: "flex" },
  sidebar: { position: "fixed", top: 0, left: 0, width: "220px", height: "100vh", background: "#111118", borderRight: "1px solid #1e1e2e", display: "flex", flexDirection: "column", padding: "28px 0", zIndex: 100 },
  logo: { padding: "0 24px 32px", borderBottom: "1px solid #1e1e2e", marginBottom: "24px" },
  logoText: { fontSize: "15px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#a78bfa" },
  logoSub: { fontSize: "11px", color: "#4a4a6a", marginTop: "2px", letterSpacing: "0.04em" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 24px", fontSize: "13px", fontWeight: "500", color: "#6b6b8a", cursor: "pointer", borderLeft: "2px solid transparent", transition: "all 0.15s" },
  navItemActive: { color: "#a78bfa", borderLeft: "2px solid #a78bfa", background: "rgba(167,139,250,0.06)" },
  sidebarBottom: { marginTop: "auto", padding: "16px 24px", borderTop: "1px solid #1e1e2e" },
  userChip: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 },
  userName: { fontSize: "13px", fontWeight: "600", color: "#c4c2d8" },
  userRole: { fontSize: "11px", color: "#4a4a6a" },
  logoutBtn: { marginTop: "12px", width: "100%", padding: "8px", background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.15s" },
  main: { marginLeft: "220px", padding: "36px 40px", flex: 1, width: "calc(100% - 220px)" },
  header: { marginBottom: "0" },
  title: { fontSize: "24px", fontWeight: "700", color: "#f0eeff", margin: "0 0 4px" },
  subtitle: { fontSize: "14px", color: "#5a5a7a", margin: 0 },
  tableWrapper: { overflowX: "auto", background: "#111118", border: "1px solid #1e1e2e", borderRadius: "12px" },
  table: { width: "100%", borderCollapse: "collapse", color: "#e8e6f0" },
  th: { background: "rgba(167,139,250,0.06)", color: "#a78bfa", padding: "16px", textAlign: "left", fontWeight: "600", fontSize: "13px", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid #1e1e2e" },
  tr: { borderBottom: "1px solid #1e1e2e", transition: "background 0.15s" },
  td: { padding: "16px", fontSize: "14px", color: "#c4c2d8" },
  link: { color: "#a78bfa", textDecoration: "none", cursor: "pointer" },
  emptyState: { padding: "40px", textAlign: "center", color: "#5a5a7a", background: "#111118", border: "1px solid #1e1e2e", borderRadius: "12px" },
  loading: { padding: "40px", color: "#a78bfa" },
  error: { padding: "40px", color: "#f87171" }
};