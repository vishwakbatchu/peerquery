import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { COLORS } from "../lib/theme";

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, padding: "0 20px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0 80px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 36,
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.ink,
              textDecoration: "none",
            }}
          >
            StudyCopilot
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13.5, color: COLORS.textMuted }}>{user?.name}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                background: "none",
                border: "none",
                color: COLORS.goldDeep,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </div>
        </header>
        {title && (
          <h1
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 30,
              fontWeight: 600,
              margin: "0 0 24px",
              color: COLORS.ink,
            }}
          >
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
