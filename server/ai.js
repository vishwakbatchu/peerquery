const DEMO = {
  diagnose: {
    concept_key: "photosynthesis",
    concept_label: "Photosynthesis",
    misconception: "Confuses the role of light reactions vs the Calvin cycle",
    level: "shaky",
  },
  explain: {
    brief: "Plants use sunlight to split water and make ATP/NADPH, then use those to fix CO₂ into sugar.",
    analogy: "Think of light reactions as charging a battery, and the Calvin cycle as spending that charge to build glucose.",
    formal: "Light-dependent reactions occur in thylakoids; the Calvin cycle in the stroma uses ATP and NADPH to reduce CO₂.",
    worked_example: "In one turn of the Calvin cycle, 3 CO₂ molecules become one G3P, which can form glucose.",
    visual: {
      type: "chart",
      title: "Energy flow in photosynthesis",
      chartType: "bar",
      labels: ["Light reactions", "Calvin cycle"],
      values: [100, 85],
      unit: "relative energy use",
    },
  },
  questions: [
    {
      question: "Where do the light-dependent reactions occur?",
      options: ["Stroma", "Thylakoid membrane", "Mitochondria", "Cytoplasm"],
      correct_index: 1,
      why: "Light reactions need chlorophyll in thylakoid membranes; the Calvin cycle runs in the stroma.",
    },
    {
      question: "What does the Calvin cycle directly produce?",
      options: ["O₂", "ATP only", "G3P / sugars", "NADPH only"],
      correct_index: 2,
      why: "The Calvin cycle fixes carbon into G3P, which becomes glucose and other carbs.",
    },
    {
      question: "What powers the Calvin cycle?",
      options: ["Sunlight directly", "ATP and NADPH from light reactions", "O₂", "Water alone"],
      correct_index: 1,
      why: "Light reactions make ATP/NADPH; the Calvin cycle consumes them to build sugars.",
    },
  ],
  chat: "Great question! In short: light reactions capture energy and make ATP/NADPH; the Calvin cycle uses that energy to build sugar from CO₂. Want a diagram or a practice question on this?",
};

function extractText(data) {
  return (data.content || [])
    .map((b) => (b.type === "text" ? b.text : ""))
    .filter(Boolean)
    .join("\n");
}

function parseJSON(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const startObj = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  let sliceStart = startObj;
  if (startArr !== -1 && (startObj === -1 || startArr < startObj)) sliceStart = startArr;
  const jsonSlice = sliceStart >= 0 ? cleaned.slice(sliceStart) : cleaned;
  return JSON.parse(jsonSlice);
}

async function callClaude(apiKey, prompt, maxTokens = 1200) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "AI request failed");
  }

  const data = await response.json();
  return extractText(data);
}

export function hasAI(apiKey) {
  return Boolean(apiKey && apiKey !== "your_key_here");
}

export async function diagnose(apiKey, inputText) {
  if (!hasAI(apiKey)) return DEMO.diagnose;

  const prompt = `A student shared this (concept or wrong answer):
"""${inputText}"""

Respond ONLY with JSON:
{"concept_key":"snake_case_id","concept_label":"Short name","misconception":"One specific gap","level":"beginner|shaky|almost there"}`;

  const text = await callClaude(apiKey, prompt, 400);
  return parseJSON(text);
}

export async function explain(apiKey, diagnosis) {
  if (!hasAI(apiKey)) return DEMO.explain;

  const prompt = `Concept: ${diagnosis.concept_label}
Misconception: ${diagnosis.misconception}
Level: ${diagnosis.level}

Write a brief adaptive tutor explanation. Include an optional visual when a chart or simple diagram helps (e.g. comparisons, flows, trends).

Respond ONLY with JSON:
{
  "brief": "2-3 sentence summary",
  "analogy": "short analogy",
  "formal": "precise explanation",
  "worked_example": "concrete example",
  "visual": null OR {
    "type": "chart" | "diagram",
    "title": "...",
    "chartType": "bar" | "line" (only if type is chart),
    "labels": ["..."],
    "values": [numbers matching labels],
    "unit": "optional label",
    "nodes": [{"id":"a","label":"..."}] (only if type is diagram),
    "edges": [{"from":"a","to":"b","label":"optional"}] (only if type is diagram)
  }
}`;

  const text = await callClaude(apiKey, prompt, 1400);
  return parseJSON(text);
}

export async function generateQuestions(apiKey, conceptLabel, misconception) {
  if (!hasAI(apiKey)) return DEMO.questions;

  const prompt = `Concept: ${conceptLabel}
Misconception to target: ${misconception}

Write 3 multiple-choice questions (4 options each). Respond ONLY with JSON array:
[{"question":"...","options":["a","b","c","d"],"correct_index":0,"why":"one sentence"}]`;

  const text = await callClaude(apiKey, prompt, 1200);
  return parseJSON(text);
}

export async function chatReply(apiKey, message, context) {
  if (!hasAI(apiKey)) {
    return {
      reply: DEMO.chat,
      visual: DEMO.explain.visual,
    };
  }

  const prompt = `You are StudyCopilot, a concise adaptive tutor. Keep answers brief (under 120 words unless asked for detail).
${context ? `Student is studying: ${context.conceptLabel}. Gap: ${context.misconception}.` : ""}

Student: ${message}

Respond ONLY with JSON:
{
  "reply": "your answer",
  "visual": null OR same visual schema as before (chart or diagram) if it helps
}`;

  const text = await callClaude(apiKey, prompt, 900);
  return parseJSON(text);
}
