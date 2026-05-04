import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../services/api"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default function Reports() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiFetch("/api/reports");
        setReportData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const downloadCombinedPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0a0a0f" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);

      const HistoryData = await apiFetch("/api/history", { // <--- Just the path!
          method: "GET",
          headers: {
              "ngrok-skip-browser-warning": "true" 
          }
      });

      const tableRows = historyData.map(scan => {
        const hasIssues = scan.without_alt > 0;
        return [
          new Date(scan.timestamp).toLocaleDateString(),
          scan.url,
          scan.total_img.toString(),
          scan.without_alt.toString(),
          hasIssues ? "Needs Work" : "Perfect"
        ];
      });

      let tableStartY = imgHeight + 10;
      if (tableStartY > pdfHeight - 20) {
        pdf.addPage();
        tableStartY = 20; 
      }

      autoTable(pdf, {
        startY: tableStartY,
        head: [['Date', 'URL', 'Total Images', 'Missing Alt', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [167, 139, 250] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          1: { cellWidth: 80 }
        }
      });

      pdf.save("full_accessibility_audit.pdf");
      
    } catch (err) {
      console.error("Failed to generate combined PDF", err);
      alert("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
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
        {loading && <div style={styles.loading}>Loading reports...</div>}
        {error && <div style={styles.error}>{error}</div>}
        {!loading && !error && reportData && (
          <div ref={reportRef} style={{ background: "#0a0a0f", paddingBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
              <div style={styles.header}>
                <h1 style={styles.title}>Analytics & Reports</h1>
                <p style={styles.subtitle}>Track your accessibility impact across all scanned domains.</p>
              </div>
              
              <button 
                onClick={downloadCombinedPDF}
                disabled={isDownloading}
                style={{ 
                  padding: "10px 20px", 
                  background: isDownloading ? "#4a4a6a" : "#a78bfa", 
                  color: "#111118", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: isDownloading ? "not-allowed" : "pointer", 
                  fontWeight: "700" 
                }}
              >
                {isDownloading ? "Generating PDF..." : "↓ Download Full Report"}
              </button>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Lifetime URLs Scanned</div>
                <div style={styles.statValue}>{reportData.stats.total_urls}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Images Analyzed</div>
                <div style={styles.statValue}>{reportData.stats.total_images.toLocaleString()}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Overall Pass Rate</div>
                <div style={{ ...styles.statValue, color: reportData.stats.overall_pass_rate >= 80 ? "#34d399" : "#a78bfa" }}>
                  {reportData.stats.overall_pass_rate}%
                </div>
              </div>
            </div>

            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top 5 Worst Offenders (Missing Alt Tags by Domain)</h3>
              
              {reportData.leaderboard.length === 0 ? (
                <div style={styles.emptyState}>No missing alt tags found yet! Excellent job.</div>
              ) : (
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={reportData.leaderboard} layout="vertical" margin={{ left: 30, right: 30, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
                      <XAxis type="number" stroke="#5a5a7a" fontSize={12} hide />
                      <YAxis dataKey="domain" type="category" stroke="#a78bfa" fontSize={13} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: "8px", color: "#e8e6f0" }} 
                        cursor={{ fill: "rgba(30, 30, 46, 0.5)" }} 
                      />
                      <Bar dataKey="missingTags" name="Missing Alt Tags" fill="#f87171" radius={[0, 6, 6, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
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
  statsRow: { display: "flex", gap: "20px", marginBottom: "40px" },
  statCard: { flex: 1, background: "#111118", border: "1px solid #1e1e2e", padding: "24px", borderRadius: "12px" },
  statLabel: { fontSize: "12px", color: "#4a4a6a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "600" },
  statValue: { fontSize: "36px", fontWeight: "700", color: "#f0eeff", letterSpacing: "-0.03em" },
  chartCard: { background: "#111118", border: "1px solid #1e1e2e", padding: "28px", borderRadius: "12px", maxWidth: "900px" },
  chartTitle: { marginBottom: "24px", color: "#c4c2d8", fontSize: "16px", fontWeight: "600" },
  emptyState: { padding: "40px", textAlign: "center", color: "#5a5a7a" },
  loading: { padding: "40px", color: "#a78bfa" },
  error: { padding: "40px", color: "#f87171" }
};