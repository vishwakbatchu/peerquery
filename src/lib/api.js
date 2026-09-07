const API = "/api";

function headers(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  health: () => request("/health"),
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/me", { token }),
  getConcepts: (token) => request("/concepts", { token }),
  saveConcepts: (token, concepts) => request("/concepts", { method: "PUT", token, body: { concepts } }),
  getChat: (token) => request("/chat", { token }),
  saveChat: (token, messages) => request("/chat", { method: "PUT", token, body: { messages } }),
  diagnose: (token, inputText) => request("/ai/diagnose", { method: "POST", token, body: { inputText } }),
  explain: (token, diagnosis) => request("/ai/explain", { method: "POST", token, body: { diagnosis } }),
  questions: (token, conceptLabel, misconception) =>
    request("/ai/questions", { method: "POST", token, body: { conceptLabel, misconception } }),
  chat: (token, message, context) => request("/ai/chat", { method: "POST", token, body: { message, context } }),
};
