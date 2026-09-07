import { COLORS } from "../lib/theme";
import { PrimaryButton, GhostButton } from "./UI";

export default function PracticeQuestion({ question, index, total, selected, revealed, onSelect, onSubmit, onNext }) {
  const isCorrect = revealed && selected === question.correct_index;

  return (
    <div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 10 }}>
        Question {index + 1} of {total}
      </div>
      <div
        style={{
          fontSize: 17,
          lineHeight: 1.5,
          fontWeight: 600,
          marginBottom: 18,
          fontFamily: "'Source Serif 4', serif",
        }}
      >
        {question.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {question.options.map((opt, i) => {
          let bg = "#fff";
          let border = COLORS.line;
          if (revealed) {
            if (i === question.correct_index) {
              bg = "#2F7D5C14";
              border = COLORS.teal;
            } else if (i === selected) {
              bg = "#7A324714";
              border = COLORS.wine;
            }
          } else if (i === selected) {
            border = COLORS.gold;
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              disabled={revealed}
              style={{
                textAlign: "left",
                padding: "13px 16px",
                borderRadius: 8,
                border: `1.5px solid ${border}`,
                background: bg,
                fontSize: 14.5,
                cursor: revealed ? "default" : "pointer",
                lineHeight: 1.45,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: isCorrect ? COLORS.teal : COLORS.wine,
            marginBottom: 18,
            fontWeight: 500,
          }}
        >
          {isCorrect ? "Right — " : "Not quite — "}
          {question.why}
        </div>
      )}

      {!revealed ? (
        <PrimaryButton disabled={selected === null} onClick={onSubmit}>
          Check answer
        </PrimaryButton>
      ) : (
        <PrimaryButton onClick={onNext}>{index + 1 < total ? "Next question" : "Finish session"}</PrimaryButton>
      )}
    </div>
  );
}
