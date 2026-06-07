// Core request handlers, shared by the Vercel serverless functions (api/*.js)
// and the local Express dev server (server.js). Pure-ish functions: take parsed
// input, return { status, body }.

import { chatComplete, LLM_ENABLED } from "./llm.js";
import { SYSTEM_PROMPT } from "./knowledge.js";
import {
  createConversation,
  saveMessage,
  getHistory,
  saveLead,
  listConversations,
} from "./db.js";

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

// Best-effort lead capture: if the user message contains an email, record it
// (with a guessed name) so leads are never lost even when typed mid-chat.
async function maybeCaptureLead(conversationId, message) {
  const email = message.match(EMAIL_RE)?.[0];
  if (!email) return null;
  // Try to pull a name from "I'm Jane", "my name is Jane", or "Jane (email)".
  const name =
    message.match(/(?:i['’]?m|i am|name is|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i)?.[1] ||
    null;
  return saveLead(conversationId, { name, email, note: "Captured from chat message" });
}

// POST /api/chat  { message, conversationId? }
export async function handleChat({ message, conversationId }) {
  if (!message || typeof message !== "string" || !message.trim()) {
    return { status: 400, body: { error: "message is required" } };
  }

  let convId = conversationId;
  if (!convId) convId = await createConversation();

  await saveMessage(convId, "user", message);
  const capturedLead = await maybeCaptureLead(convId, message);

  const history = await getHistory(convId);
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

  let reply;
  try {
    reply = await chatComplete(messages);
  } catch (err) {
    console.error("chatComplete error:", err.message);
    reply =
      "Sorry — I'm having trouble reaching the assistant right now. Please try again in a moment, or leave your email and we'll follow up.";
  }

  await saveMessage(convId, "assistant", reply);

  return {
    status: 200,
    body: {
      conversationId: convId,
      reply,
      leadCaptured: Boolean(capturedLead),
      mode: LLM_ENABLED ? "live" : "demo",
    },
  };
}

// POST /api/lead  { conversationId, name, email, note? }
export async function handleLead({ conversationId, name, email, note }) {
  if (!email || !EMAIL_RE.test(email)) {
    return { status: 400, body: { error: "a valid email is required" } };
  }
  let convId = conversationId;
  if (!convId) convId = await createConversation();
  const lead = await saveLead(convId, { name: name || null, email, note: note || null });
  return { status: 200, body: { ok: true, lead, conversationId: convId } };
}

// GET /api/conversations  (admin view — proves storage)
export async function handleListConversations() {
  const conversations = await listConversations();
  return { status: 200, body: { conversations } };
}
