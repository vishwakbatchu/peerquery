import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase"; // Make sure your Supabase client file is imported here
import { COLORS } from "../lib/theme";
import { PrimaryButton } from "../components/UI";

export default function LoginPage() {
  const { token, persist } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        // Supabase Direct Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw new Error(error.message);

        // Store session token and navigate
        if (data.session) {
          persist(data.session.access_token);
          navigate("/");
        }
      } else {
        // Supabase Direct Sign-Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw new Error(error.message);

        if (data.session) {
          persist(data.session.access_token);
          navigate("/");
        } else {
          // If email confirmation is enabled in Supabase Dashboard
          setError("Account created! Please check your email to confirm your account.");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: COLORS.paper,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.ink,
            marginBottom: 8,
          }}
        >
          StudyCopilot
        </div>
        <p style={{ color: COLORS.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
          Your adaptive AI tutor — understand tricky concepts, practise with targeted questions, and retain them over
          time.
        </p>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: `1.5px solid ${mode === m ? COLORS.gold : COLORS.line}`,
                  background: mode === m ? "#fff" : COLORS.paperDeep,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: mode === m ? COLORS.goldDeep : COLORS.textMuted,
                }}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </label>
            )}
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                style={inputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={inputStyle}
              />
            </label>

            {error && <div style={{ color: COLORS.wine, fontSize: 13.5 }}>{error}</div>}

            <PrimaryButton type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </PrimaryButton>
          </form>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: COLORS.textMuted, textAlign: "center" }}>
          Demo works without an API key — add <code>ANTHROPIC_API_KEY</code> in <code>.env</code> for live AI.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "11px 12px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.line}`,
  fontSize: 14,
  fontWeight: 400,
};
