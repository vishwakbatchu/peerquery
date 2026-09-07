import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return path.join(DATA_DIR, name);
}

function readJSON(name, fallback) {
  ensureDataDir();
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  ensureDataDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

export function getUsers() {
  return readJSON("users.json", {});
}

export function saveUsers(users) {
  writeJSON("users.json", users);
}

export function getConcepts(userId) {
  return readJSON(`concepts-${userId}.json`, {});
}

export function saveConcepts(userId, concepts) {
  writeJSON(`concepts-${userId}.json`, concepts);
}

export function getChatHistory(userId) {
  return readJSON(`chat-${userId}.json`, []);
}

export function saveChatHistory(userId, messages) {
  writeJSON(`chat-${userId}.json`, messages);
}
