import { useEffect, useState } from "react";

// Proves the "database integration for storing conversations" requirement:
// reads back every stored conversation + captured lead from the backend.
export default function AdminPanel() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
      setError(null);
    } catch {
      setError("Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const leads = conversations.filter((c) => c.lead);

  return (
    <main className="admin">
      <div className="admin-head">
        <h2>Stored conversations & leads</h2>
        <button className="btn ghost small" onClick={load}>
          ↻ Refresh
        </button>
      </div>
      <p className="admin-sub">
        Live view of every conversation and captured lead, read from the database.
      </p>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-num">{conversations.length}</div>
          <div className="stat-label">Conversations</div>
        </div>
        <div className="stat">
          <div className="stat-num">{leads.length}</div>
          <div className="stat-label">Leads captured</div>
        </div>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && conversations.length === 0 && (
        <p className="muted">
          No conversations yet — go back to the site and chat with the bot first.
        </p>
      )}

      <div className="convo-list">
        {conversations.map((c) => (
          <div key={c.id} className="convo-card">
            <div className="convo-meta">
              <span className="convo-id">{c.id}</span>
              <span className="muted">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            {c.lead && (
              <div className="lead-tag">
                ★ Lead: {c.lead.name || "—"} · {c.lead.email}
              </div>
            )}
            <div className="convo-msgs">
              {(c.messages || []).map((m, i) => (
                <div key={i} className={`mini-bubble ${m.role}`}>
                  <strong>{m.role === "user" ? "Customer" : "Bot"}:</strong> {m.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
