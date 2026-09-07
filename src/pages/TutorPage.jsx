import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { COLORS, nextReviewOffset } from "../lib/theme";
import Layout from "../components/Layout";
import { PrimaryButton, GhostButton, Spinner, Stepper } from "../components/UI";
import PracticeQuestion from "../components/PracticeQuestion";
import ChatPanel from "../components/ChatPanel";
import VisualExplanation from "../components/VisualExplanation";

export default function TutorPage() {
  const { conceptKey } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [concepts, setConcepts] = useState({});
  const [reviewTarget, setReviewTarget] = useState(null);
  const [ready, setReady] = useState(false);

  const [stage, setStage] = useState("input");
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [summary, setSummary] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const simulatedDay = 0;

  useEffect(() => {
    api.getConcepts(token).then(({ concepts: c }) => {
      setConcepts(c || {});
      if (conceptKey && c?.[conceptKey]) {
        const target = c[conceptKey];
        setReviewTarget(target);
        setDiagnosis({
          concept_key: target.key,
          concept_label: target.conceptLabel,
          misconception: target.misconception,
          level: "review",
        });
        setStage("practice");
      }
      setReady(true);
    });
  }, [token, conceptKey]);

  const conceptKeyResolved = reviewTarget?.key || diagnosis?.concept_key;

  const runDiagnosis = useCallback(async () => {
    setStage("diagnosing");
    setError("");
    try {
      const parsed = await api.diagnose(token, inputText);
      setDiagnosis(parsed);
      setStage("learn");
    } catch {
      setError("Couldn't diagnose that — try rephrasing or adding more detail.");
      setStage("input");
    }
  }, [token, inputText]);

  useEffect(() => {
    if (stage === "learn" && diagnosis && !explanation) {
      (async () => {
        try {
          const parsed = await api.explain(token, diagnosis);
          setExplanation(parsed);
        } catch {
          setExplanation({
            brief: "Here's a concise take on this concept.",
            analogy: "Think of it step by step from what you already know.",
            formal: "The precise idea, stated carefully.",
            worked_example: "Let's walk through one concrete case.",
            visual: null,
          });
        }
      })();
    }
  }, [stage, diagnosis, explanation, token]);

  const generateQuestions = useCallback(async () => {
    setStage("loading-questions");
    try {
      const label = reviewTarget ? reviewTarget.conceptLabel : diagnosis.concept_label;
      const misc = reviewTarget ? reviewTarget.misconception : diagnosis.misconception;
      const { questions: parsed } = await api.questions(token, label, misc);
      setQuestions(parsed);
      setQIndex(0);
      setCorrectCount(0);
      setSelected(null);
      setRevealed(false);
      setStage("practice");
    } catch {
      setError("Couldn't generate practice questions — try again.");
      setStage(reviewTarget ? "practice" : "learn");
    }
  }, [diagnosis, reviewTarget, token]);

  useEffect(() => {
    if (reviewTarget && stage === "practice" && !questions) {
      generateQuestions();
    }
  }, [reviewTarget, stage, questions, generateQuestions]);

  async function saveConcept(record) {
    const next = { ...concepts, [record.key]: record };
    setConcepts(next);
    await api.saveConcepts(token, next);
  }

  function submitAnswer() {
    setRevealed(true);
    if (selected === questions[qIndex].correct_index) {
      setCorrectCount((c) => c + 1);
    }
  }

  function finishSession(finalCorrect) {
    const total = questions.length;
    const pct = finalCorrect / total;
    const prevStreak = reviewTarget ? reviewTarget.streak : 0;
    const passed = pct >= 0.6;
    const newStreak = passed ? prevStreak + 1 : 0;
    const offset = nextReviewOffset(newStreak);
    const record = {
      key: conceptKeyResolved,
      conceptLabel: reviewTarget ? reviewTarget.conceptLabel : diagnosis.concept_label,
      misconception: reviewTarget ? reviewTarget.misconception : diagnosis.misconception,
      mastery: Math.round(pct * 100),
      streak: newStreak,
      lastReviewDay: simulatedDay,
      nextReviewDay: simulatedDay + offset,
      lastScore: `${finalCorrect}/${total}`,
      history: [
        ...(reviewTarget?.history || []),
        { day: simulatedDay, score: `${finalCorrect}/${total}` },
      ],
    };
    setSummary(record);
    saveConcept(record);
    setStage("summary");
  }

  function nextQuestion() {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      finishSession(correctCount);
    }
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { role: "user", text };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);
    try {
      const context = diagnosis
        ? { conceptLabel: diagnosis.concept_label, misconception: diagnosis.misconception }
        : null;
      const { reply, visual } = await api.chat(token, text, context);
      setChatMessages([...next, { role: "assistant", text: reply, visual }]);
    } catch {
      setChatMessages([
        ...next,
        { role: "assistant", text: "Sorry, I couldn't answer that right now. Try again in a moment." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  if (!ready) {
    return (
      <Layout>
        <Spinner label="Loading…" />
      </Layout>
    );
  }

  return (
    <Layout title={reviewTarget ? `Review: ${reviewTarget.conceptLabel}` : "New study session"}>
      {!reviewTarget && (
        <Stepper
          stage={
            stage === "loading-questions" ? "practice" : stage === "diagnosing" ? "input" : stage
          }
        />
      )}

      {stage === "input" && (
        <div>
          <p style={{ color: COLORS.textMuted, lineHeight: 1.6, marginTop: 0 }}>
            Paste a concept you don't get, or a question you got wrong. We'll find the gap, explain briefly, and
            practise it.
          </p>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            What are you stuck on?
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. I don't get why entropy always increases…"
            rows={5}
            style={{
              width: "100%",
              padding: 16,
              fontSize: 15,
              borderRadius: 10,
              border: `1.5px solid ${COLORS.line}`,
              background: "#fff",
              resize: "vertical",
              lineHeight: 1.5,
              outline: "none",
            }}
          />
          {error && <div style={{ color: COLORS.wine, fontSize: 13.5, marginTop: 8 }}>{error}</div>}
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <PrimaryButton disabled={!inputText.trim()} onClick={runDiagnosis}>
              Diagnose this
            </PrimaryButton>
            <Link to="/" style={{ textDecoration: "none" }}>
              <GhostButton>Cancel</GhostButton>
            </Link>
          </div>
        </div>
      )}

      {stage === "diagnosing" && <Spinner label="Finding exactly where this breaks down…" />}

      {stage === "learn" && diagnosis && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.goldDeep, marginBottom: 6 }}>
              {diagnosis.concept_label}
            </div>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${COLORS.line}`,
                borderLeft: `3px solid ${COLORS.wine}`,
                borderRadius: 8,
                padding: "14px 18px",
                marginBottom: 20,
                fontSize: 14.5,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: COLORS.wine }}>The specific gap:</strong> {diagnosis.misconception}
            </div>

            {!explanation ? (
              <Spinner label="Writing a brief explanation for exactly that gap…" />
            ) : (
              <>
                <p style={{ fontSize: 16, lineHeight: 1.65, marginTop: 0 }}>{explanation.brief}</p>
                <Block title="Think of it like this">{explanation.analogy}</Block>
                <Block title="More precisely">{explanation.formal}</Block>
                <Block title="Worked example">{explanation.worked_example}</Block>
                <VisualExplanation visual={explanation.visual} />

                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <PrimaryButton onClick={generateQuestions}>Practice questions</PrimaryButton>
                  <GhostButton onClick={() => setStage("chat")}>Ask a follow-up</GhostButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "chat" && diagnosis && (
        <div>
          <p style={{ color: COLORS.textMuted, marginTop: 0 }}>
            Ask anything about <strong>{diagnosis.concept_label}</strong>.
          </p>
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            setInput={setChatInput}
            onSend={sendChat}
            loading={chatLoading}
          />
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <PrimaryButton onClick={generateQuestions}>Ready to practise</PrimaryButton>
            <GhostButton onClick={() => setStage("learn")}>Back to explanation</GhostButton>
          </div>
        </div>
      )}

      {stage === "loading-questions" && <Spinner label="Building targeted practice questions…" />}

      {stage === "practice" && questions && (
        <PracticeQuestion
          question={questions[qIndex]}
          index={qIndex}
          total={questions.length}
          selected={selected}
          revealed={revealed}
          onSelect={(i) => !revealed && setSelected(i)}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
        />
      )}

      {stage === "practice" && !questions && <Spinner label="Loading questions…" />}

      {stage === "summary" && summary && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 12,
            padding: 28,
            maxWidth: 480,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.teal, marginBottom: 8 }}>Session complete</div>
          <h2
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 24,
              margin: "0 0 8px",
              color: COLORS.ink,
            }}
          >
            {summary.conceptLabel}
          </h2>
          <p style={{ color: COLORS.textMuted, margin: "0 0 20px" }}>
            Score: <strong>{summary.lastScore}</strong> · Mastery {summary.mastery}% · Next review day{" "}
            {summary.nextReviewDay}
          </p>
          <div style={{ height: 8, background: COLORS.paperDeep, borderRadius: 4, overflow: "hidden", marginBottom: 24 }}>
            <div
              style={{
                width: `${summary.mastery}%`,
                height: "100%",
                background: summary.mastery >= 60 ? COLORS.teal : COLORS.wine,
              }}
            />
          </div>
          <PrimaryButton onClick={() => navigate("/")}>Back to dashboard</PrimaryButton>
        </div>
      )}
    </Layout>
  );
}

function Block({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}
