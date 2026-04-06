import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../services/api";

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#e8e6f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "0",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "220px",
    height: "100vh",
    background: "#111118",
    borderRight: "1px solid #1e1e2e",
    display: "flex",
    flexDirection: "column",
    padding: "28px 0",
    zIndex: 100,
  },
  logo: {
    padding: "0 24px 32px",
    borderBottom: "1px solid #1e1e2e",
    marginBottom: "24px",
  },
  logoText: {
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#a78bfa",
  },
  logoSub: {
    fontSize: "11px",
    color: "#4a4a6a",
    marginTop: "2px",
    letterSpacing: "0.04em",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b6b8a",
    cursor: "pointer",
    borderLeft: "2px solid transparent",
    transition: "all 0.15s",
  },
  navItemActive: {
    color: "#a78bfa",
    borderLeft: "2px solid #a78bfa",
    background: "rgba(167,139,250,0.06)",
  },
  sidebarBottom: {
    marginTop: "auto",
    padding: "16px 24px",
    borderTop: "1px solid #1e1e2e",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a78bfa, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "white",
    flexShrink: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#c4c2d8",
  },
  userRole: {
    fontSize: "11px",
    color: "#4a4a6a",
  },
  logoutBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "8px",
    background: "rgba(239,68,68,0.08)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "all 0.15s",
  },
  main: {
    marginLeft: "220px",
    padding: "36px 40px",
  },
  pageHeader: {
    marginBottom: "36px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f0eeff",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#5a5a7a",
    margin: 0,
  },
  scanCard: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "28px",
  },
  scanLabel: {
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5a5a7a",
    marginBottom: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    background: "#0a0a0f",
    border: "1px solid #2a2a3e",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#e8e6f0",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "'DM Mono', 'Courier New', monospace",
  },
  scanBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    letterSpacing: "0.02em",
    transition: "opacity 0.15s, transform 0.1s",
    boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
  },
  errorBanner: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "20px",
  },
  // Stats row + chart side by side
  resultsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "20px",
    marginBottom: "28px",
    alignItems: "start",
  },
  statsCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  statCard: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "12px",
    padding: "20px 24px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4a4a6a",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "-0.03em",
    color: "#f0eeff",
  },
  statValueBad: { color: "#f87171" },
  statValueGood: { color: "#34d399" },
  // Pie chart card
  chartCard: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "12px",
    padding: "20px 24px",
  },
  chartTitle: {
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#4a4a6a",
    marginBottom: "12px",
  },
  sectionLabel: {
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5a5a7a",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  imgCard: {
    background: "#111118",
    border: "1px solid #1e1e2e",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "border-color 0.15s, transform 0.15s",
  },
  imgCardBad: {
    borderColor: "rgba(248,113,113,0.3)",
  },
  imgPreview: {
    width: "100%",
    height: "140px",
    objectFit: "contain",
    background: "#0a0a0f",
    display: "block",
    borderBottom: "1px solid #1e1e2e",
  },
  imgMeta: { padding: "12px" },
  altBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    letterSpacing: "0.02em",
  },
  altBadgeGood: {
    background: "rgba(52,211,153,0.1)",
    color: "#34d399",
    border: "1px solid rgba(52,211,153,0.2)",
  },
  altBadgeBad: {
    background: "rgba(248,113,113,0.1)",
    color: "#f87171",
    border: "1px solid rgba(248,113,113,0.2)",
  },
  altText: {
    fontSize: "12px",
    color: "#5a5a7a",
    marginTop: "6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#3a3a5a",
  },
  emptyIcon: { fontSize: "36px", marginBottom: "12px" },
  emptyText: { fontSize: "15px", fontWeight: "600", color: "#4a4a6a" },
  emptySubtext: { fontSize: "13px", color: "#3a3a5a", marginTop: "4px" },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#5a5a7a",
    fontSize: "14px",
    padding: "20px 0",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #2a2a3e",
    borderTop: "2px solid #a78bfa",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0f; }
    input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
    .img-card:hover { transform: translateY(-2px); border-color: #2e2e4e !important; }
    .scan-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .logout-btn:hover { background: rgba(239,68,68,0.15) !important; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
  `;
  document.head.appendChild(styleTag);
}

// Pure SVG donut chart — no dependencies
function DonutChart({ withAlt, missing }) {
  const total = withAlt + missing;
  const [hovered, setHovered] = useState(null);

  if (total === 0) return (
    <div style={{ textAlign: "center", color: "#4a4a6a", fontSize: "13px", padding: "40px 0" }}>No data</div>
  );

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 68;
  const strokeW = 22;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { label: "Has Alt", value: withAlt, color: "#34d399" },
    { label: "Missing Alt", value: missing, color: "#f87171" },
  ];

  let cumulativeDash = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / total) * circumference;
    const arc = { ...seg, dash, offset: cumulativeDash };
    cumulativeDash += dash;
    return arc;
  });

  const active = hovered !== null ? segments[hovered] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e2e" strokeWidth={strokeW} />
        {/* Segments */}
        {arcs.map((arc, i) => {
          // 1. Calculate the exact dash and gap to equal the circumference
          const dashLength = Math.max(arc.dash - 3, 0); // -3 creates the gap between slices
          const gapLength = circumference - dashLength;

          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeW}
              
              /* 2. The dash and gap now form a perfect loop */
              strokeDasharray={`${dashLength} ${gapLength}`}
              
              /* 3. Shifts the pattern backwards to start at the right spot */
              strokeDashoffset={circumference - arc.offset}
              
              /* 4. Rotates the whole circle so the first slice starts at 12 o'clock */
              transform={`rotate(-90 ${cx} ${cy})`}
              
              style={{ 
                cursor: "pointer", 
                opacity: hovered === null || hovered === i ? 1 : 0.3, 
                transition: "opacity 0.2s" 
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Centre text */}
        <text x={cx} y={cy - 7} textAnchor="middle" fill={active ? active.color : "#f0eeff"} fontSize="22" fontWeight="700" fontFamily="DM Sans,sans-serif">
          {active ? active.value : total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#5a5a7a" fontSize="11" fontFamily="DM Sans,sans-serif">
          {active ? active.label : "total"}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", opacity: hovered === null || hovered === i ? 1 : 0.35, transition: "opacity 0.2s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "11px", color: "#5a5a7a", marginBottom: "1px" }}>{seg.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: seg.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {seg.value}
                <span style={{ fontSize: "11px", fontWeight: "400", color: "#4a4a6a", marginLeft: "4px" }}>
                  {Math.round((seg.value / total) * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [targetUrl, setTargetUrl] = useState("");
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missingAltCount, setMissingAltCount] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTotalImages(0);
    setImages([]);
    setMissingAltCount(0);
    setHasScanned(false);

    try {
      const data = await apiFetch("/scan", {
        method: "POST",
        body: JSON.stringify({ url: targetUrl }),
      });
      setImages(data.images);
      setTotalImages(data.total_images);
      setMissingAltCount(data.missing_alt_count);
      setHasScanned(true);
    } catch (err) {
      setError("Failed to scan that URL. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const withAlt = totalImages - missingAltCount;
  const passRate = totalImages > 0 ? Math.round((withAlt / totalImages) * 100) : 0;
  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoText}>ImgScan</div>
          <div style={styles.logoSub}>Accessibility Auditor</div>
        </div>

        <nav>
          {[
            { icon: "⬡", label: "Scanner", active: true },
            { icon: "◫", label: "Reports" },
            { icon: "◈", label: "History" },
            { icon: "◎", label: "Settings" },
          ].map((item) => (
            <div
              key={item.label}
              style={{ ...styles.navItem, ...(item.active ? styles.navItemActive : {}) }}
            >
              <span style={{ fontSize: "14px", opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.userName}>{user?.username || "User"}</div>
              <div style={styles.userRole}>Member</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Image Accessibility Scanner</h1>
          <p style={styles.pageSubtitle}>
            Audit any webpage for missing alt tags and accessibility gaps
          </p>
        </div>

        {/* Scan Input */}
        <div style={styles.scanCard}>
          <div style={styles.scanLabel}>Target URL</div>
          <form onSubmit={handleScan} style={styles.inputRow}>
            <input
              type="url"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} className="scan-btn" style={styles.scanBtn}>
              {loading ? "Scanning…" : "Run Scan →"}
            </button>
          </form>
        </div>

        {error && <div style={styles.errorBanner}>⚠ {error}</div>}

        {loading && (
          <div style={styles.loadingRow}>
            <div style={styles.spinner} />
            Scanning page for images…
          </div>
        )}

        {/* Stats + Pie Chart */}
        {hasScanned && !loading && (
          <>
            <div style={styles.resultsRow}>
              {/* Stat cards */}
              <div style={styles.statsCol}>
                <div style={styles.statsRow}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Images</div>
                    <div style={styles.statValue}>{totalImages}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Missing Alt</div>
                    <div style={{ ...styles.statValue, ...(missingAltCount > 0 ? styles.statValueBad : styles.statValueGood) }}>
                      {missingAltCount}
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Pass Rate</div>
                    <div style={{ ...styles.statValue, ...(passRate === 100 ? styles.statValueGood : passRate < 50 ? styles.statValueBad : {}) }}>
                      {passRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie chart */}
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>Alt Tag Breakdown</div>
                <DonutChart withAlt={withAlt} missing={missingAltCount} />
              </div>
            </div>

            <div style={styles.sectionLabel}>
              {images.length} image{images.length !== 1 ? "s" : ""} found
            </div>

            <div style={styles.grid}>
              {images.map((img, index) => (
                <div
                  key={index}
                  className="img-card"
                  style={{ ...styles.imgCard, ...(!img.has_alt ? styles.imgCardBad : {}) }}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || ""}
                    style={styles.imgPreview}
                    loading="lazy"
                  />
                  <div style={styles.imgMeta}>
                    <span style={{ ...styles.altBadge, ...(img.has_alt ? styles.altBadgeGood : styles.altBadgeBad) }}>
                      {img.has_alt ? "✓ Alt Present" : "✕ Missing Alt"}
                    </span>
                    {img.has_alt && img.alt_text && (
                      <div style={styles.altText} title={img.alt_text}>
                        "{img.alt_text}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!hasScanned && !loading && !error && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◫</div>
            <div style={styles.emptyText}>No scan results yet</div>
            <div style={styles.emptySubtext}>Enter a URL above and run a scan to get started</div>
          </div>
        )}
      </main>
    </div>
  );
}