# Nimbus — AI Customer-Support Chatbot

A full-stack AI support chatbot. It answers common customer questions, captures
leads (name + email), stores every conversation in a database, and ships with a
clean React chat widget that embeds on any site — minimize to a corner bubble,
open as a corner panel, or maximize to fullscreen.

## Stack
- **Frontend:** React (Vite) — chat widget + admin dashboard
- **Backend:** Node.js (Express locally / serverless functions in production)
- **AI:** OpenAI-compatible Chat Completions API (configurable provider/model)
- **Database:** Supabase (Postgres)

## Features
- **Grounded answers** — the assistant responds only from the business's own facts
  (`lib/knowledge.js`), so it stays accurate and on-topic.
- **Lead capture** — detects a customer's email in chat and stores it with the conversation.
- **Conversation storage** — every message is persisted; the admin dashboard reads them back.
- **Suggested replies, emoji, file attach** — full-featured chat UI.

## Run locally
```bash
npm install
npm --prefix client install

cp .env.example .env       # add your API key + Supabase credentials

npm run dev
#   API -> http://localhost:3001
#   App -> http://localhost:5173
```

## Configuration (`.env`)
```
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=your-key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```
The LLM layer targets any OpenAI-compatible endpoint, so the provider and model
can be changed entirely through these variables — no code changes.

## Deploy (Vercel + Supabase)
1. Create a Supabase project and run `supabase-schema.sql` in its SQL editor.
2. Deploy the repo to Vercel.
3. Set the environment variables above in the Vercel project settings.

## Customizing
Edit `lib/knowledge.js` to set the business's facts and FAQ — that single file
controls what the assistant knows and how it behaves.
