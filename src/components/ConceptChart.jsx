import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { COLORS } from "../lib/theme";

export default function ConceptChart({ visual }) {
  if (!visual || visual.type !== "chart") return null;

  const data = (visual.labels || []).map((label, i) => ({
    name: label,
    value: visual.values?.[i] ?? 0,
  }));

  const Chart = visual.chartType === "line" ? LineChart : BarChart;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        padding: "16px 12px 8px",
        marginTop: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 12, paddingLeft: 8 }}>
        {visual.title}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <Chart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {visual.chartType === "line" ? (
            <Line type="monotone" dataKey="value" stroke={COLORS.teal} strokeWidth={2} dot={{ r: 4 }} />
          ) : (
            <Bar dataKey="value" fill={COLORS.gold} radius={[6, 6, 0, 0]} />
          )}
        </Chart>
      </ResponsiveContainer>
      {visual.unit && (
        <div style={{ fontSize: 12, color: COLORS.textMuted, paddingLeft: 8, marginTop: 4 }}>{visual.unit}</div>
      )}
    </div>
  );
}
