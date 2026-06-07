// Local dev/prod server. Serves the same handlers as the Vercel functions, plus
// (in production) the built React client. Run with: npm run dev  (API only)
// or after `npm run build`: npm start  (serves API + built client on one port).

import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import "dotenv/config";

import { handleChat, handleLead, handleListConversations } from "./lib/handlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function route(handler) {
  return async (req, res) => {
    try {
      const { status, body } = await handler(req.body || {});
      res.status(status).json(body);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  };
}

app.post("/api/chat", route(handleChat));
app.post("/api/lead", route(handleLead));
app.get("/api/conversations", route(() => handleListConversations()));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Serve the built client if it exists (production single-port mode).
const dist = path.join(__dirname, "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`\n  Nimbus chatbot API running on http://localhost:${PORT}`);
  console.log(`  Client dev server (Vite): http://localhost:5173\n`);
});
