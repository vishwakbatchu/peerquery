import { COLORS } from "../lib/theme";
import VisualExplanation from "./VisualExplanation";

export default function ChatPanel({ messages, input, setInput, onSend, loading }) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.line}`,
        borderRadius: 12,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        height: 420,
      }}
    >
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${COLORS.line}`, fontWeight: 600, fontSize: 14 }}>
        Ask your tutor
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>
            Ask anything about this concept — follow-ups, examples, or “explain like I’m 12”.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              background: m.role === "user" ? COLORS.ink : COLORS.paperDeep,
              color: m.role === "user" ? "#fff" : COLORS.text,
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {m.text}
            {m.visual && <VisualExplanation visual={m.visual} />}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textMuted, fontSize: 13 }}>
            <div className="spinner" /> Thinking…
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) onSend();
        }}
        style={{ padding: 12, borderTop: `1px solid ${COLORS.line}`, display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1.5px solid ${COLORS.line}`,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: COLORS.gold,
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            opacity: !input.trim() || loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
