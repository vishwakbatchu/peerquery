import { COLORS } from "../lib/theme";

export default function ConceptDiagram({ visual }) {
  if (!visual || visual.type !== "diagram" || !visual.nodes?.length) return null;

  const nodes = visual.nodes;
  const edges = visual.edges || [];
  const cols = Math.min(3, nodes.length);
  const nodeW = 120;
  const nodeH = 44;
  const gapX = 40;
  const gapY = 56;
  const width = cols * nodeW + (cols - 1) * gapX + 40;
  const rows = Math.ceil(nodes.length / cols);
  const height = rows * nodeH + (rows - 1) * gapY + 60;

  const positions = {};
  nodes.forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[n.id] = { x: 20 + col * (nodeW + gapX), y: 20 + row * (nodeH + gapY) };
  });

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        padding: 16,
        marginTop: 16,
        overflowX: "auto",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 12 }}>{visual.title}</div>
      <svg width={width} height={height} style={{ display: "block" }}>
        {edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          const x1 = from.x + nodeW / 2;
          const y1 = from.y + nodeH;
          const x2 = to.x + nodeW / 2;
          const y2 = to.y;
          const midY = (y1 + y2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke={COLORS.line}
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
              {e.label && (
                <text x={(x1 + x2) / 2} y={midY - 4} textAnchor="middle" fontSize={11} fill={COLORS.textMuted}>
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.textMuted} />
          </marker>
        </defs>
        {nodes.map((n) => {
          const p = positions[n.id];
          return (
            <g key={n.id}>
              <rect
                x={p.x}
                y={p.y}
                width={nodeW}
                height={nodeH}
                rx={8}
                fill={COLORS.paperDeep}
                stroke={COLORS.gold}
                strokeWidth={1.5}
              />
              <text
                x={p.x + nodeW / 2}
                y={p.y + nodeH / 2 + 4}
                textAnchor="middle"
                fontSize={12}
                fill={COLORS.ink}
                fontWeight={600}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
