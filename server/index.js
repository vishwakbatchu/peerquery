import fs from "fs";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getUsers, saveUsers, getConcepts, saveConcepts, getChatHistory, saveChatHistory } from "./store.js";
import { diagnose, explain, generateQuestions, chatReply, hasAI } from "./ai.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiEnabled: hasAI(API_KEY) });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: "Email and password (6+ chars) required" });
  }

  const users = getUsers();
  const key = email.trim().toLowerCase();
  if (users[key]) {
    return res.status(409).json({ error: "Account already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  users[key] = {
    id: key,
    email: key,
    name: name?.trim() || key.split("@")[0],
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  saveUsers(users);

  const token = jwt.sign({ id: key, email: key, name: users[key].name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: key, email: key, name: users[key].name } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const key = email?.trim().toLowerCase();
  const users = getUsers();
  const user = users[key];

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get("/api/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/concepts", authMiddleware, (req, res) => {
  res.json({ concepts: getConcepts(req.user.id) });
});

app.put("/api/concepts", authMiddleware, (req, res) => {
  saveConcepts(req.user.id, req.body.concepts || {});
  res.json({ ok: true });
});

app.get("/api/chat", authMiddleware, (req, res) => {
  res.json({ messages: getChatHistory(req.user.id) });
});

app.put("/api/chat", authMiddleware, (req, res) => {
  saveChatHistory(req.user.id, req.body.messages || []);
  res.json({ ok: true });
});

app.post("/api/ai/diagnose", authMiddleware, async (req, res) => {
  try {
    const result = await diagnose(API_KEY, req.body.inputText || "");
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || "Diagnosis failed" });
  }
});

app.post("/api/ai/explain", authMiddleware, async (req, res) => {
  try {
    const result = await explain(API_KEY, req.body.diagnosis);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || "Explanation failed" });
  }
});

app.post("/api/ai/questions", authMiddleware, async (req, res) => {
  try {
    const { conceptLabel, misconception } = req.body;
    const result = await generateQuestions(API_KEY, conceptLabel, misconception);
    res.json({ questions: result });
  } catch (e) {
    res.status(500).json({ error: e.message || "Question generation failed" });
  }
});

app.post("/api/ai/chat", authMiddleware, async (req, res) => {
  try {
    const result = await chatReply(API_KEY, req.body.message, req.body.context);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message || "Chat failed" });
  }
});

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`StudyCopilot API on http://localhost:${PORT}`);
  if (!hasAI(API_KEY)) {
    console.log("No ANTHROPIC_API_KEY — running in demo mode with sample responses");
  }
});
