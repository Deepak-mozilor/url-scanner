import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0f; }
    .login-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); outline: none; }
    .login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .signup-link:hover { color: #c4b5fd !important; }
  `;
  document.head.appendChild(styleTag);
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            fontSize: "15px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a78bfa",
            marginBottom: "4px",
          }}>
            ImgScan
          </div>
          <div style={{ fontSize: "11px", color: "#4a4a6a", letterSpacing: "0.04em" }}>
            Accessibility Auditor
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111118",
          border: "1px solid #1e1e2e",
          borderRadius: "16px",
          padding: "36px",
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#f0eeff",
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: "13px", color: "#5a5a7a", marginBottom: "28px" }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              padding: "11px 14px",
              fontSize: "13px",
              color: "#f87171",
              marginBottom: "20px",
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#5a5a7a",
                marginBottom: "8px",
              }}>
                Username
              </label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="your_username"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: "8px",
                  padding: "11px 14px",
                  fontSize: "14px",
                  color: "#e8e6f0",
                  fontFamily: "'DM Mono', 'Courier New', monospace",
                  transition: "border-color 0.15s",
                }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#5a5a7a",
                marginBottom: "8px",
              }}>
                Password
              </label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: "8px",
                  padding: "11px 14px",
                  fontSize: "14px",
                  color: "#e8e6f0",
                  fontFamily: "'DM Mono', 'Courier New', monospace",
                  transition: "border-color 0.15s",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{
                marginTop: "8px",
                padding: "12px",
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
                transition: "opacity 0.15s, transform 0.1s",
                boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#4a4a6a" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="signup-link"
            style={{ color: "#a78bfa", textDecoration: "none", fontWeight: "600", transition: "color 0.15s" }}
          >
            Sign up here
          </Link>
        </p>

      </div>
    </div>
  );
}