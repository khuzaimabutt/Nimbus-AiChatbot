// Storage layer for conversations, messages, and captured leads.
//
// Production: Supabase (set SUPABASE_URL + SUPABASE_SERVICE_KEY). Run supabase-schema.sql first.
// Local/dev:  if no Supabase env vars, falls back to an in-memory store so the demo runs
//             instantly with zero accounts. (In-memory resets when the server restarts.)

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
export const USING_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

// ---- In-memory fallback ----------------------------------------------------
const mem = {
  conversations: new Map(), // id -> { id, created_at, messages: [], lead: null }
  seq: 0,
};

// ---- Supabase REST helpers -------------------------------------------------
async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---- Public API ------------------------------------------------------------

export async function createConversation() {
  if (USING_SUPABASE) {
    const [row] = await sb("conversations", {
      method: "POST",
      body: JSON.stringify({}),
    });
    return row.id;
  }
  const id = `conv_${++mem.seq}`;
  mem.conversations.set(id, {
    id,
    created_at: new Date().toISOString(),
    messages: [],
    lead: null,
  });
  return id;
}

export async function saveMessage(conversationId, role, content) {
  if (USING_SUPABASE) {
    await sb("messages", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, role, content }),
    });
    return;
  }
  const conv = mem.conversations.get(conversationId);
  if (conv) conv.messages.push({ role, content, created_at: new Date().toISOString() });
}

export async function getHistory(conversationId) {
  if (USING_SUPABASE) {
    const rows = await sb(
      `messages?conversation_id=eq.${conversationId}&order=created_at.asc&select=role,content`
    );
    return rows.map((r) => ({ role: r.role, content: r.content }));
  }
  const conv = mem.conversations.get(conversationId);
  return conv ? conv.messages.map((m) => ({ role: m.role, content: m.content })) : [];
}

export async function saveLead(conversationId, { name, email, note }) {
  if (USING_SUPABASE) {
    const [row] = await sb("leads", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, name, email, note }),
    });
    return row;
  }
  const conv = mem.conversations.get(conversationId);
  const lead = { name, email, note, created_at: new Date().toISOString() };
  if (conv) conv.lead = lead;
  return lead;
}

// Admin view: list conversations with message counts + any captured lead.
export async function listConversations() {
  if (USING_SUPABASE) {
    const convos = await sb("conversations?order=created_at.desc&select=id,created_at");
    const result = [];
    for (const c of convos) {
      const msgs = await sb(
        `messages?conversation_id=eq.${c.id}&order=created_at.asc&select=role,content,created_at`
      );
      const [lead] = await sb(`leads?conversation_id=eq.${c.id}&select=name,email,note`);
      result.push({ id: c.id, created_at: c.created_at, messages: msgs, lead: lead || null });
    }
    return result;
  }
  return [...mem.conversations.values()].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}
