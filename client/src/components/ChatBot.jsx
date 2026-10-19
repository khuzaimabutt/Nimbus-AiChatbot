import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icon from "./Icons.jsx";

const WELCOME = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm the Nimbus support assistant. I can help with pricing, plans, the free trial, integrations and getting set up. What can I help you with?",
};

const SUGGESTIONS = [
  "What's your pricing?",
  "How does the free trial work?",
  "Which integrations do you support?",
  "Do you offer refunds?",
  "Is my data secure?",
];

const EMOJIS = ["😀", "🙂", "👍", "🙏", "🎉", "❤️", "🚀", "💡", "✅", "🤔", "😅", "🔥"];

// The API answers 200 with this canned text when the model cannot be reached.
// Detect it so the widget can show a proper error state with a retry action.
const FALLBACK_RE = /having trouble reaching the assistant/i;
const ASKS_FOR_EMAIL_RE = /name and email|your email|share your name/i;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let uid = 0;
const nextId = () => `m${++uid}`;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea, a[href], [tabindex]:not([tabindex="-1"])';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [lead, setLead] = useState({ state: "idle", error: "" }); // idle | open | sending | done
  const [leadForm, setLeadForm] = useState({ name: "", email: "" });
  const [announce, setAnnounce] = useState("");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const fabRef = useRef(null);
  const panelRef = useRef(null);
  const lastSent = useRef("");
  const wasOpen = useRef(false);

  // Let any button on the page open the widget without prop drilling.
  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("nimbus:open", openIt);
    return () => window.removeEventListener("nimbus:open", openIt);
  }, []);

  // Focus management: into the panel on open, back to the bubble on close.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      fabRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, sending, open, maximized, lead.state]);

  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
    []
  );

  const last = messages[messages.length - 1];
  const lastIsAssistant = last?.role === "assistant";
  const failed = Boolean(last?.error);
  const showSuggestions = lastIsAssistant && !sending && !failed && messages.length <= 2;

  const request = useCallback(
    async (text) => {
      setSending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, conversationId }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.conversationId) setConversationId(data.conversationId);
        if (!res.ok || !data.reply) throw new Error("bad response");
        const isFallback = FALLBACK_RE.test(data.reply);
        setMessages((m) => [
          ...m,
          { id: nextId(), role: "assistant", content: data.reply, error: isFallback },
        ]);
        setAnnounce(isFallback ? "The assistant could not be reached." : `Nimbus: ${data.reply}`);
        if (!isFallback && (data.leadCaptured || ASKS_FOR_EMAIL_RE.test(data.reply))) {
          setLead((l) => (l.state === "done" ? l : { state: data.leadCaptured ? "done" : "open", error: "" }));
        }
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "assistant",
            error: true,
            content: "I could not send that. Check your connection and try again.",
          },
        ]);
        setAnnounce("Message failed to send.");
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  function sendText(text) {
    const clean = text.trim();
    if (!clean || sending) return;
    setShowEmoji(false);
    setInput("");
    lastSent.current = clean;
    const content = attachment ? `${clean}\n(attached: ${attachment.name})` : clean;
    setAttachment(null);
    setMessages((m) => [...m, { id: nextId(), role: "user", content: clean, file: attachment }]);
    request(clean);
  }

  function retry() {
    if (sending || !lastSent.current) return;
    setMessages((m) => m.filter((x) => !x.error));
    request(lastSent.current);
  }

  function resetChat() {
    setMessages([WELCOME]);
    setConversationId(null);
    setInput("");
    setAttachment(null);
    setShowEmoji(false);
    setLead({ state: "idle", error: "" });
    setLeadForm({ name: "", email: "" });
    setAnnounce("Conversation restarted.");
    inputRef.current?.focus();
  }

  async function submitLead(e) {
    e.preventDefault();
    if (!EMAIL_OK.test(leadForm.email.trim())) {
      setLead({ state: "open", error: "Enter a valid email address." });
      return;
    }
    setLead({ state: "sending", error: "" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          name: leadForm.name.trim() || undefined,
          email: leadForm.email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "failed");
      if (data.conversationId) setConversationId(data.conversationId);
      setLead({ state: "done", error: "" });
      setAnnounce("Thanks, your details were sent to the team.");
    } catch {
      setLead({ state: "open", error: "Could not save your details. Please try again." });
    }
  }

  function onPanelKeyDown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (showEmoji) setShowEmoji(false);
      else setOpen(false);
      return;
    }
    // Full screen behaves like a modal dialog: keep Tab inside it.
    if (e.key === "Tab" && maximized && panelRef.current) {
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open) {
    return (
      <button
        ref={fabRef}
        className="cb-fab"
        onClick={() => setOpen(true)}
        aria-label="Open support chat"
        aria-haspopup="dialog"
      >
        <Icon.Chat width={26} height={26} />
        <span className="cb-fab-dot" aria-hidden="true" />
      </button>
    );
  }

  return (
    <>
      {maximized && <div className="cb-backdrop" onClick={() => setMaximized(false)} />}
      <div
        ref={panelRef}
        className={`cb-panel ${maximized ? "full" : "widget"}`}
        role="dialog"
        aria-modal={maximized ? "true" : undefined}
        aria-label="Nimbus support chat"
        onKeyDown={onPanelKeyDown}
      >
        <header className="cb-header">
          <div className="cb-id">
            <div className="cb-avatar"><Icon.Logo size={36} light /></div>
            <div>
              <div className="cb-name">Nimbus Support</div>
              <div className="cb-status"><span className="cb-dot" aria-hidden="true" />AI assistant, online</div>
            </div>
          </div>
          <div className="cb-actions">
            <button className="cb-icon-btn" title="Restart chat" onClick={resetChat} aria-label="Restart chat">
              <Icon.Restart />
            </button>
            <button
              className="cb-icon-btn cb-hide-sm"
              title={maximized ? "Restore to corner" : "Full screen"}
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? "Restore to corner" : "Expand to full screen"}
            >
              {maximized ? <Icon.Shrink /> : <Icon.Expand />}
            </button>
            <button className="cb-icon-btn" title="Close (Esc)" onClick={() => setOpen(false)} aria-label="Close chat">
              <Icon.Minus />
            </button>
          </div>
        </header>

        <div className="cb-body" ref={scrollRef}>
          <div className="cb-thread" role="log" aria-label="Conversation" aria-relevant="additions">
            <div className="cb-date"><span>{today}</span></div>
            {messages.map((m) => (
              <div key={m.id} className={`cb-row ${m.role}`}>
                {m.role === "assistant" && <div className="cb-mini-avatar"><Icon.Logo size={26} /></div>}
                <div className={`cb-bubble ${m.role}${m.error ? " is-error" : ""}`}>
                  {m.error && (
                    <span className="cb-err-label"><Icon.Alert width={15} height={15} /> Not delivered</span>
                  )}
                  {m.error && FALLBACK_RE.test(m.content)
                    ? "The assistant is not responding right now. Your message was saved. Try again, or leave your email and the team will follow up."
                    : m.content}
                  {m.file && (
                    <span className="cb-file">
                      <Icon.Clip width={14} height={14} /> {m.file.name} <small>{formatSize(m.file.size)}</small>
                    </span>
                  )}
                  {m.error && (
                    <span className="cb-err-actions">
                      <button type="button" className="cb-retry" onClick={retry} disabled={sending}>
                        <Icon.Refresh width={14} height={14} /> Try again
                      </button>
                      {lead.state === "idle" && (
                        <button type="button" className="cb-link" onClick={() => setLead({ state: "open", error: "" })}>
                          Leave my email
                        </button>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="cb-row assistant" aria-hidden="true">
                <div className="cb-mini-avatar"><Icon.Logo size={26} /></div>
                <div className="cb-bubble assistant cb-typing"><span></span><span></span><span></span></div>
              </div>
            )}

            {lead.state !== "idle" && (
              <div className="cb-lead">
                {lead.state === "done" ? (
                  <div className="cb-lead-done">
                    <span className="cb-lead-check"><Icon.Check width={16} height={16} /></span>
                    <div>
                      <strong>Details received</strong>
                      <p>The team will follow up by email.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitLead} noValidate>
                    <div className="cb-lead-title"><Icon.Mail width={16} height={16} /> Leave your details</div>
                    <p className="cb-lead-sub">A person from the team will follow up.</p>
                    <label>
                      <span>Name <em>(optional)</em></span>
                      <input
                        autoComplete="name"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={leadForm.email}
                        aria-invalid={Boolean(lead.error)}
                        aria-describedby={lead.error ? "lead-err" : undefined}
                        onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </label>
                    {lead.error && <p id="lead-err" className="cb-lead-err" role="alert">{lead.error}</p>}
                    <div className="cb-lead-actions">
                      <button className="cb-lead-submit" type="submit" disabled={lead.state === "sending"}>
                        {lead.state === "sending" ? "Sending" : "Send to the team"}
                      </button>
                      <button type="button" className="cb-link" onClick={() => setLead({ state: "idle", error: "" })}>
                        Not now
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {showSuggestions && (
              <div className="cb-suggestions" aria-label="Suggested questions">
                {SUGGESTIONS.map((s, n) => (
                  <button key={s} className="cb-chip" style={{ "--i": n }} onClick={() => { sendText(s); inputRef.current?.focus(); }}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>

        <form className="cb-input-bar" onSubmit={(e) => { e.preventDefault(); sendText(input); }}>
          {attachment && (
            <div className="cb-attachment">
              <Icon.Clip width={15} height={15} />
              <span className="cb-att-name">{attachment.name}</span>
              <span className="cb-att-size">{formatSize(attachment.size)}</span>
              <button type="button" onClick={() => setAttachment(null)} aria-label={`Remove ${attachment.name}`}>
                <Icon.Close width={14} height={14} />
              </button>
            </div>
          )}
          {showEmoji && (
            <div className="cb-emoji-pop" role="group" aria-label="Emoji">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => { setInput((v) => v + e); inputRef.current?.focus(); }} aria-label={`Insert ${e}`}>{e}</button>
              ))}
            </div>
          )}
          <div className="cb-input-row">
            <input
              ref={inputRef}
              className="cb-text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message"
              aria-label="Message"
              autoComplete="off"
              enterKeyHint="send"
            />
            <button type="button" className="cb-tool" title="Emoji" aria-expanded={showEmoji} onClick={() => setShowEmoji((s) => !s)} aria-label="Emoji">
              <Icon.Smile />
            </button>
            <button type="button" className="cb-tool" title="Attach a file" onClick={() => fileRef.current?.click()} aria-label="Attach a file">
              <Icon.Clip />
            </button>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                setAttachment(f ? { name: f.name, size: f.size } : null);
                e.target.value = "";
              }}
            />
            <button className="cb-send" type="submit" disabled={sending || !input.trim()} aria-label="Send message">
              <Icon.Send width={19} height={19} strokeWidth={2.2} />
            </button>
          </div>
          <p className="cb-foot">AI replies can be wrong. Check important details with the team.</p>
        </form>
      </div>
    </>
  );
}
