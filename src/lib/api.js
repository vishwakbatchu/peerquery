const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : '';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  getConcepts: () => apiCall('/api/concepts'),
  saveConcepts: (concepts) => apiCall('/api/concepts', { method: 'PUT', body: JSON.stringify({ concepts }) }),
  getChatHistory: () => apiCall('/api/chat'),
  saveChatHistory: (messages) => apiCall('/api/chat', { method: 'PUT', body: JSON.stringify({ messages }) }),
  diagnose: (inputText) => apiCall('/api/ai/diagnose', { method: 'POST', body: JSON.stringify({ inputText }) }),
  explain: (diagnosis) => apiCall('/api/ai/explain', { method: 'POST', body: JSON.stringify({ diagnosis }) }),
  generateQuestions: (conceptLabel, misconception) => apiCall('/api/ai/questions', { method: 'POST', body: JSON.stringify({ conceptLabel, misconception }) }),
  chatReply: (message, context) => apiCall('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
};
