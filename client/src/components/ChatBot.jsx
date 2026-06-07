import { useEffect, useMemo, useRef, useState } from "react";

const WELCOME = {
  role: "assistant",
  content:
    "Hi there! 👋 I'm the Nimbus support assistant. I can help with pricing, plans, the free trial, integrations, and getting set up. What can I help you with?",
};

const SUGGESTIONS = [
  "What's your pricing?",
  "How does the free trial work?",
  "Which integrations do you support?",
  "Do you offer refunds?",
  "Is my data secure?",
];

const EMOJIS = ["😀", "🙂", "👍", "🙏", "🎉", "❤️", "🚀", "💡", "✅", "🤔", "😅", "🔥"];

// Icons
const IconMax = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" />
  </svg>
);
const IconRestore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m13-5h-3a2 2 0 0 0-2 2v3" />
  </svg>
);

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open, maximized]);

  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
    []
  );

  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  async function sendText(text) {
    const clean = text.trim();
    if (!clean || sending) return;
    setShowEmoji(false);
    setAttachment(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: clean }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, conversationId }),
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Sorry, something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    sendText(input);
  }

  function resetChat() {
    setMessages([WELCOME]);
    setConversationId(null);
    setInput("");
    setAttachment(null);
    setShowEmoji(false);
  }

  function insertEmoji(emoji) {
    setInput((v) => v + emoji);
    inputRef.current?.focus();
  }

  // Closed → floating bubble only
  if (!open) {
    return (
      <button className="cb-fab" onClick={() => setOpen(true)} aria-label="Open support chat">
        💬
      </button>
    );
  }

  return (
    <>
      {maximized && <div className="cb-backdrop" onClick={() => setMaximized(false)} />}
      <div className={`cb-panel ${maximized ? "full" : "widget"}`} role="dialog" aria-label="Support chat">
        {/* Header */}
        <header className="cb-header">
          <div className="cb-id">
            <div className="cb-avatar">◆</div>
            <div>
              <div className="cb-name">Nimbus Support</div>
              <div className="cb-status">
                <span className="cb-dot" />
                We're online
              </div>
            </div>
          </div>
          <div className="cb-actions">
            <button className="cb-icon-btn" title="Restart chat" onClick={resetChat} aria-label="Restart chat">↻</button>
            <button
              className="cb-icon-btn"
              title={maximized ? "Restore to corner" : "Maximize to fullscreen"}
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? "Restore" : "Maximize"}
            >
              {maximized ? <IconRestore /> : <IconMax />}
            </button>
            <button className="cb-icon-btn" title="Minimize" onClick={() => setOpen(false)} aria-label="Minimize">–</button>
          </div>
        </header>

        {/* Body */}
        <div className="cb-body" ref={scrollRef}>
          <div className="cb-thread">
            <div className="cb-date"><span>{today}</span></div>
            {messages.map((m, i) => (
              <div key={i} className={`cb-row ${m.role}`}>
                {m.role === "assistant" && <div className="cb-mini-avatar">◆</div>}
                <div className={`cb-bubble ${m.role}`}>{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="cb-row assistant">
                <div className="cb-mini-avatar">◆</div>
                <div className="cb-bubble assistant cb-typing"><span></span><span></span><span></span></div>
              </div>
            )}
            {lastIsAssistant && !sending && (
              <div className="cb-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="cb-chip" onClick={() => sendText(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <form className="cb-input-bar" onSubmit={onSubmit}>
          {attachment && (
            <div className="cb-attachment">
              📎 {attachment}
              <button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment">×</button>
            </div>
          )}
          {showEmoji && (
            <div className="cb-emoji-pop">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => insertEmoji(e)}>{e}</button>
              ))}
            </div>
          )}
          <div className="cb-input-row">
            <div className="cb-input-tools">
              <button type="button" className="cb-tool" title="Emoji" onClick={() => setShowEmoji((s) => !s)} aria-label="Emoji">😊</button>
              <button type="button" className="cb-tool" title="Attach a file" onClick={() => fileRef.current?.click()} aria-label="Attach a file">📎</button>
              <input ref={fileRef} type="file" hidden onChange={(e) => setAttachment(e.target.files?.[0]?.name || null)} />
            </div>
            <input
              ref={inputRef}
              className="cb-text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message"
              aria-label="Message"
            />
            <button className="cb-send" type="submit" disabled={sending || !input.trim()} aria-label="Send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
