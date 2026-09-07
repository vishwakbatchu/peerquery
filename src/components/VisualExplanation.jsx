import ConceptChart from "./ConceptChart";
import ConceptDiagram from "./ConceptDiagram";

export default function VisualExplanation({ visual }) {
  if (!visual) return null;
  if (visual.type === "chart") return <ConceptChart visual={visual} />;
  if (visual.type === "diagram") return <ConceptDiagram visual={visual} />;
  return null;
}
