import { COLORS } from "../lib/theme";

export function PrimaryButton({ children, onClick, disabled, style, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontWeight: 600,
        fontSize: 14.5,
        padding: "12px 22px",
        borderRadius: 8,
        border: "none",
        background: disabled ? COLORS.line : COLORS.ink,
        color: disabled ? COLORS.textMuted : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        fontWeight: 600,
        fontSize: 14.5,
        padding: "12px 20px",
        borderRadius: 8,
        border: `1.5px solid ${COLORS.line}`,
        background: "transparent",
        color: COLORS.ink,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Spinner({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color: COLORS.textMuted, fontSize: 14 }}>
      <div className="spinner" />
      {label}
    </div>
  );
}

export function Stepper({ stage }) {
  const stages = ["Diagnose", "Learn", "Practice", "Retain"];
  const activeIdx = { input: 0, diagnosing: 0, learn: 1, practice: 2, summary: 3, chat: 1 }[stage] ?? 0;

  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
      {stages.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < stages.length - 1 ? 1 : "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: i <= activeIdx ? COLORS.ink : COLORS.textMuted,
              fontSize: 13,
              fontWeight: i === activeIdx ? 600 : 500,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                border: `1.5px solid ${i <= activeIdx ? COLORS.gold : COLORS.line}`,
                background: i < activeIdx ? COLORS.gold : "transparent",
                color: i < activeIdx ? "#fff" : i === activeIdx ? COLORS.goldDeep : COLORS.textMuted,
              }}
            >
              {i < activeIdx ? "✓" : i + 1}
            </span>
            {s}
          </div>
          {i < stages.length - 1 && <div style={{ flex: 1, height: 1, background: COLORS.line, margin: "0 12px" }} />}
        </div>
      ))}
    </div>
  );
}
