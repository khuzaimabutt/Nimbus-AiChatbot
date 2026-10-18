import { useCallback, useEffect, useMemo, useState } from "react";
import * as Icon from "./Icons.jsx";

function timeLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function titleOf(c) {
  const first = (c.messages || []).find((m) => m.role === "user");
  return first ? first.content : "No messages yet";
}

// Reads every stored conversation and captured lead back from the backend.
export default function AdminPanel() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all"); // all | leads
  const [selected, setSelected] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      const list = [...(data.conversations || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setConversations(list);
      setError(null);
    } catch {
      setError("Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const leads = useMemo(() => conversations.filter((c) => c.lead), [conversations]);
  const messageCount = useMemo(
    () => conversations.reduce((n, c) => n + (c.messages || []).length, 0),
    [conversations]
  );
  const rows = tab === "leads" ? leads : conversations;
  const current = rows.find((c) => c.id === selected) || (mobileDetail ? null : rows[0]) || null;

  function pick(id) {
    setSelected(id);
    setMobileDetail(true);
  }

  return (
    <main className="admin" id="main">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-title">Inbox</h1>
        </div>
        <button className="btn ghost small" onClick={load} disabled={loading}>
          <Icon.Refresh width={15} height={15} /> {loading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <dl className="stat-row">
        <div className="stat"><dt>Conversations</dt><dd>{conversations.length}</dd></div>
        <div className="stat"><dt>Leads captured</dt><dd>{leads.length}</dd></div>
        <div className="stat"><dt>Messages stored</dt><dd>{messageCount}</dd></div>
      </dl>

      {error ? (
        <div className="empty" role="alert">
          <span className="empty-ico err"><Icon.Alert width={26} height={26} /></span>
          <h2>{error}</h2>
          <p>The API did not answer. Check that the server is running, then try again.</p>
          <button className="btn primary small" onClick={load}>Try again</button>
        </div>
      ) : (
        <div className={`inbox ${mobileDetail ? "show-detail" : ""}`}>
          <section className="inbox-list" aria-label="Conversations">
            <div className="tabs" role="tablist" aria-label="Filter">
              {[
                ["all", `All (${conversations.length})`],
                ["leads", `Leads (${leads.length})`],
              ].map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  className={tab === k ? "on" : ""}
                  onClick={() => { setTab(k); setSelected(null); }}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading && conversations.length === 0 ? (
              <ul className="skeleton" aria-label="Loading conversations">
                {[0, 1, 2, 3].map((i) => <li key={i}><i /><i /></li>)}
              </ul>
            ) : rows.length === 0 ? (
              <div className="empty small">
                <span className="empty-ico"><Icon.Inbox width={26} height={26} /></span>
                <h2>{tab === "leads" ? "No leads yet" : "No conversations yet"}</h2>
                <p>
                  {tab === "leads"
                    ? "Leads appear when a visitor shares an email in chat or fills the lead form."
                    : "Open the chat widget on the site and send a message. It will show up here."}
                </p>
              </div>
            ) : (
              <ul className="rows">
                {rows.map((c) => (
                  <li key={c.id}>
                    <button
                      className={`row ${current?.id === c.id ? "on" : ""}`}
                      onClick={() => pick(c.id)}
                      aria-current={current?.id === c.id ? "true" : undefined}
                    >
                      <span className="row-top">
                        <span className="row-title">{titleOf(c)}</span>
                        <time className="row-time" dateTime={c.created_at}>{timeLabel(c.created_at)}</time>
                      </span>
                      <span className="row-bot">
                        <span className="row-count">{(c.messages || []).length} messages</span>
                        {c.lead && <span className="badge">Lead</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="inbox-detail" aria-label="Transcript">
            {current ? (
              <>
                <div className="detail-head">
                  <button className="back" onClick={() => setMobileDetail(false)}>
                    <Icon.Back width={18} height={18} /> All conversations
                  </button>
                  <div>
                    <h2 className="detail-title">{titleOf(current)}</h2>
                    <p className="detail-meta">
                      <span className="mono">{current.id}</span> · {new Date(current.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {current.lead && (
                  <div className="lead-card">
                    <span className="lead-ico"><Icon.Mail width={18} height={18} /></span>
                    <div>
                      <strong>{current.lead.name || "Name not given"}</strong>
                      <a href={`mailto:${current.lead.email}`}>{current.lead.email}</a>
                      {current.lead.note && <small>{current.lead.note}</small>}
                    </div>
                  </div>
                )}
                <ol className="transcript">
                  {(current.messages || []).map((m, i) => (
                    <li key={i} className={`t-msg ${m.role}`}>
                      <span className="t-who">{m.role === "user" ? "Customer" : "Nimbus assistant"}</span>
                      <p>{m.content}</p>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <div className="empty">
                <span className="empty-ico"><Icon.Chat width={26} height={26} /></span>
                <h2>Select a conversation</h2>
                <p>The full transcript and any captured lead show here.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
