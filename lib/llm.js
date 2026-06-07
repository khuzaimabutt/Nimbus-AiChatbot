// Provider-agnostic chat completion.
// Works with any OpenAI-compatible Chat Completions endpoint.
//
// Demo default  -> Groq (free):   LLM_BASE_URL=https://api.groq.com/openai/v1
// Switch to real OpenAI later: set LLM_BASE_URL=https://api.openai.com/v1,
//                              LLM_MODEL=gpt-4o-mini, LLM_API_KEY=sk-...
// Nothing else in the codebase changes.

import { fallbackReply } from "./knowledge.js";

const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
const API_KEY = process.env.LLM_API_KEY || "";

export const LLM_ENABLED = Boolean(API_KEY);

/**
 * @param {{role: 'system'|'user'|'assistant', content: string}[]} messages
 * @returns {Promise<string>} assistant reply text
 */
export async function chatComplete(messages) {
  // No key configured -> demo mode: answer the latest user message with the keyword responder.
  if (!API_KEY) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return fallbackReply(lastUser?.content || "");
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("LLM returned an empty response");
  return reply;
}
