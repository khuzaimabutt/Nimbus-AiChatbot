import { useState } from "react";
import ChatBot from "./components/ChatBot.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

// The page behind the bot is a mock SaaS site, so the chat bubble floats over a
// real-looking website — exactly how it would embed on the client's site. The bot
// minimizes to a corner bubble, opens as a corner widget, or maximizes to fullscreen.
export default function App() {
  const [view, setView] = useState("site"); // "site" | "admin"

  return (
    <div className="page">
      <header className="nav">
        <div className="brand"><span className="logo">◆</span> Nimbus</div>
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setView("site"); }}>Product</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
          <button className="admin-toggle" onClick={() => setView((v) => (v === "admin" ? "site" : "admin"))}>
            {view === "admin" ? "← Back to site" : "Admin view"}
          </button>
        </nav>
      </header>

      {view === "admin" ? (
        <AdminPanel />
      ) : (
        <main className="hero">
          <div className="hero-inner">
            <p className="eyebrow">Project management, simplified</p>
            <h1>Run every project in one calm place.</h1>
            <p className="sub">
              Boards, timelines, and team chat in one workspace — so your team spends
              less time managing work and more time doing it.
            </p>
            <div className="cta-row">
              <button className="btn primary">Start free trial</button>
              <button className="btn ghost">See pricing</button>
            </div>
            <div className="hint">
              <strong>Have a question?</strong> Our support assistant is online in the
              bottom-right corner — ask about pricing, plans, the free trial, or integrations.
            </div>
          </div>
        </main>
      )}

      <ChatBot />
    </div>
  );
}
