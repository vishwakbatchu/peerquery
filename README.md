# StudyCopilot

An adaptive AI tutor that helps students **understand**, **practise**, and **retain** difficult concepts.

## Features

- **Login & signup** — per-student accounts with JWT auth
- **Dashboard** — tracked concepts, mastery bars, spaced-repetition review schedule
- **Adaptive tutor flow** — diagnose gaps → brief explanation → targeted practice
- **Ask questions** — chat with the tutor for follow-ups
- **Visual explanations** — bar/line charts and flow diagrams when concepts benefit from visuals
- **Demo mode** — works without an API key using sample responses

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file (optional — demo mode works without a key)
cp .env.example .env

# 3. Run frontend + backend
npm run dev
```

Open **http://localhost:5173** — create an account and start a session.

For live AI responses, add your Anthropic key to `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-long-random-secret
```

## Project structure

```
├── index.html
├── package.json
├── vite.config.js
├── server/
│   ├── index.js      # Express API, auth, AI proxy
│   ├── ai.js         # Claude prompts + demo fallbacks
│   └── store.js      # JSON file persistence
└── src/
    ├── App.jsx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   └── TutorPage.jsx
    └── components/
        ├── ConceptChart.jsx    # Recharts bar/line graphs
        ├── ConceptDiagram.jsx  # SVG flow diagrams
        ├── ChatPanel.jsx
        └── PracticeQuestion.jsx
```

## Production build

```bash
npm run build
npm start
```

Serves the built frontend from `dist/` on port 3001.

## Git setup

```bash
git init
git add .
git commit -m "Initial StudyCopilot adaptive tutor app"
git remote add origin <your-repo-url>
git push -u origin main
```

User data and concepts are stored in `server/data/` (gitignored).

## Tech stack

- **Frontend:** React, Vite, React Router, Recharts
- **Backend:** Express, JWT, bcrypt
- **AI:** Anthropic Claude API (optional)

## License

MIT
