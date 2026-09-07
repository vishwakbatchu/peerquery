import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { COLORS } from "../lib/theme";
import Layout from "../components/Layout";
import { PrimaryButton, GhostButton } from "../components/UI";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [concepts, setConcepts] = useState({});
  const [simulatedDay, setSimulatedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    Promise.all([api.getConcepts(token), api.health()])
      .then(([c, h]) => {
        setConcepts(c.concepts || {});
        setAiEnabled(h.aiEnabled);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const list = Object.values(concepts).sort((a, b) => a.nextReviewDay - b.nextReviewDay);
  const due = list.filter((c) => c.nextReviewDay <= simulatedDay);
  const avgMastery =
    list.length > 0 ? Math.round(list.reduce((s, c) => s + (c.mastery || 0), 0) / list.length) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="spinner" />
      </Layout>
    );
  }

  return (
    <Layout title={`Welcome back, ${user?.name}`}>
      {!aiEnabled && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderLeft: `3px solid ${COLORS.gold}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: 13.5,
            color: COLORS.textMuted,
          }}
        >
          Running in <strong>demo mode</strong> — sample AI responses. Set <code>ANTHROPIC_API_KEY</code> in{" "}
          <code>.env</code> for live tutoring.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <StatCard label="Concepts tracked" value={list.length} />
        <StatCard label="Due for review" value={due.length} accent={due.length > 0 ? COLORS.wine : COLORS.teal} />
        <StatCard label="Average mastery" value={`${avgMastery}%`} />
        <StatCard label="Study day" value={simulatedDay} hint="simulated" />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <Link to="/tutor" style={{ textDecoration: "none" }}>
          <PrimaryButton>Start new session</PrimaryButton>
        </Link>
        <GhostButton onClick={() => setSimulatedDay((d) => d + 1)}>Skip ahead a day →</GhostButton>
      </div>

      <h2
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 16px",
          color: COLORS.ink,
        }}
      >
        Your concepts
      </h2>

      {list.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 10,
            padding: 32,
            color: COLORS.textMuted,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          Nothing here yet. Start a session and paste something you're stuck on — we'll diagnose the gap, explain it
          briefly, and schedule review so it sticks.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {list.map((c) => {
            const isDue = c.nextReviewDay <= simulatedDay;
            return (
              <div
                key={c.key}
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{c.conceptLabel}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 10 }}>
                    Last score {c.lastScore} · {isDue ? "due for review" : `next review day ${c.nextReviewDay}`}
                  </div>
                  <div style={{ height: 6, background: COLORS.paperDeep, borderRadius: 3, overflow: "hidden", maxWidth: 240 }}>
                    <div
                      style={{
                        width: `${c.mastery}%`,
                        height: "100%",
                        background: c.mastery >= 60 ? COLORS.teal : COLORS.wine,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
                <Link to={`/tutor/${c.key}`} style={{ textDecoration: "none" }}>
                  <PrimaryButton style={{ padding: "9px 16px", fontSize: 13.5 }}>
                    {isDue ? "Review now" : "Open"}
                  </PrimaryButton>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, value, accent, hint }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || COLORS.ink }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
