import { useEffect, useRef, useState } from "react";
import ChatBot from "./components/ChatBot.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import * as Icon from "./components/Icons.jsx";
import { prefersReduced, useInView } from "./motion.js";

const openChat = () => window.dispatchEvent(new Event("nimbus:open"));

const STEPS = [
  { n: "01", t: "Write down what you know", d: "Prices, policies, hours, integrations. One file holds the facts your assistant is allowed to use." },
  { n: "02", t: "The assistant answers from it", d: "Replies stay short and grounded. When it does not know, it says so and offers a human follow-up." },
  { n: "03", t: "Leads land in your inbox", d: "Emails shared in chat, or through the lead form, are stored with the full conversation." },
];

const FEATURES = [
  { i: Icon.Shield, t: "Grounded answers", d: "The prompt restricts the model to your facts, so it does not invent prices or policies.", wide: true },
  { i: Icon.Mail, t: "Lead capture", d: "Detects emails mid-chat and offers a form when a person is needed." },
  { i: Icon.Database, t: "Every chat stored", d: "Conversations and leads are saved to Supabase, or kept in memory for local runs." },
  { i: Icon.Plug, t: "Bring your own model", d: "Any OpenAI-compatible endpoint. Change provider and model with environment variables only.", wide: true },
  { i: Icon.Window, t: "Three sizes", d: "Corner bubble, side panel, or full screen, with keyboard and screen reader support." },
  { i: Icon.Layers, t: "Plain stack", d: "React, Node and Postgres. Nothing exotic to host or maintain." },
];

// Script for the hero card: [stage to show, ms to wait before showing it]. The last step resets the card.
const PV_STEPS = [[1, 900], [2, 1000], [3, 1400], [4, 1200], [5, 900], [6, 1400], [7, 700], [0, 4200]];

function Preview() {
  const reduced = prefersReduced();
  const [stage, setStage] = useState(reduced ? 7 : 0);
  const [k, setK] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const [next, ms] = PV_STEPS[k % PV_STEPS.length];
    const t = setTimeout(() => {
      setStage(next);
      setK(k + 1);
    }, ms);
    return () => clearTimeout(t);
  }, [k, visible, reduced]);

  // stage: 1 user, 2 typing, 3 reply, 4 user, 5 typing, 6 reply, 7 chips
  const on = (n) => (stage >= n ? " on" : "");
  return (
    <figure className="preview" aria-label="Illustration of a conversation with the assistant">
      <div className="pv-head">
        <Icon.Logo size={32} />
        <div>
          <b>Nimbus Support</b>
          <span><i aria-hidden="true" /> AI assistant</span>
        </div>
      </div>
      <div className={`pv-body${stage === 0 ? " reset" : ""}`}>
        <div className={`pv-slot u${on(1)}`}><p className="pv-u">How much is Pro for a team of 8?</p></div>
        <div className="pv-slot a">
          <span className={`pv-typing${stage === 2 ? " on" : ""}`} aria-hidden="true"><b /><b /><b /></span>
          <p className={`pv-a${on(3)}`}>Pro is $12 per user per month, or $10 billed yearly. For 8 people that is $96 monthly, or $80 on the yearly plan.</p>
          <span className={`pv-src${on(3)}`}>Source: Plans · How much is the Pro plan? <b>100% match</b></span>
        </div>
        <div className={`pv-slot u${on(4)}`}><p className="pv-u">Can I try it first?</p></div>
        <div className="pv-slot a">
          <span className={`pv-typing${stage === 5 ? " on" : ""}`} aria-hidden="true"><b /><b /><b /></span>
          <p className={`pv-a${on(6)}`}>Yes, 14 days of Pro, no credit card needed.</p>
          <span className={`pv-src${on(6)}`}>Source: Plans · Is there a free trial? <b>100% match</b></span>
        </div>
        <div className={`pv-chips${on(7)}`}><span style={{ "--i": 0 }}>Which integrations?</span><span style={{ "--i": 1 }}>Refund policy</span></div>
      </div>
      <figcaption>Illustration, sample business facts</figcaption>
    </figure>
  );
}

function Landing() {
  const [stepsRef, stepsIn] = useInView(0.2);
  const [bentoRef, bentoIn] = useInView(0.15);
  const [sizesRef, sizesIn] = useInView(0.4);
  return (
    <main id="main">
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="pill"><span aria-hidden="true" /> Demo product</p>
            <h1>Customer support that answers from <em>your</em> facts.</h1>
            <p className="lede">
              Nimbus is an embeddable AI chat assistant. It handles the routine questions, collects the
              leads, and stores every conversation, with a widget that stays out of the way until it is needed.
            </p>
            <div className="cta-row">
              <button className="btn primary" onClick={openChat}>
                <Icon.Chat width={18} height={18} /> Try the assistant
              </button>
              <a className="btn ghost" href="#how">How it works</a>
            </div>
            <p className="stack-note">React, Node, Supabase, any OpenAI-compatible model.</p>
          </div>
          <Preview />
        </div>
      </section>

      <section className="section" id="how" aria-labelledby="how-h">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h2 id="how-h">Three steps, one source of truth</h2>
          <ol className={`steps reveal${stepsIn ? " in" : ""}`} ref={stepsRef}>
            {STEPS.map((s, n) => (
              <li key={s.n} style={{ "--i": n }}>
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section tint" id="features" aria-labelledby="feat-h">
        <div className="wrap">
          <p className="eyebrow">What is in it</p>
          <h2 id="feat-h">Built for the unglamorous parts of support</h2>
          <ul className={`bento reveal${bentoIn ? " in" : ""}`} ref={bentoRef}>
            {FEATURES.map(({ i: Ico, t, d, wide }, n) => (
              <li key={t} className={wide ? "wide" : ""} style={{ "--i": n }}>
                <span className="b-ico"><Ico width={20} height={20} /></span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="widget" aria-labelledby="w-h">
        <div className="wrap sizes">
          <div>
            <p className="eyebrow">The widget</p>
            <h2 id="w-h">One widget, three sizes</h2>
            <p className="lede-sm">
              Visitors can park it as a bubble, work in a side panel, or open it full screen. Focus moves
              into the chat when it opens and returns to the bubble when it closes. Escape closes it.
            </p>
            <button className="btn primary" onClick={openChat}>Open it now</button>
          </div>
          <div className={`size-demo${sizesIn ? " in" : ""}`} ref={sizesRef} aria-hidden="true">
            <div className="sd-col"><div className="sd s1"><i /></div><span>Bubble</span></div>
            <div className="sd-col"><div className="sd s2"><i /><i /><i /></div><span>Panel</span></div>
            <div className="sd-col grow"><div className="sd s3"><i /><i /><i /><i /><i /></div><span>Full screen</span></div>
          </div>
        </div>
      </section>

      <section className="section closing" aria-labelledby="c-h">
        <div className="wrap">
          <h2 id="c-h">Ask it something.</h2>
          <p className="lede-sm">
            The demo assistant is loaded with facts about a fictional project management company, so you
            can see grounded answers. Swap one file for your own business.
          </p>
          <button className="btn primary" onClick={openChat}>Start a conversation</button>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState(() => (location.hash === "#admin" ? "admin" : "site"));

  useEffect(() => {
    const sync = () => setView(location.hash === "#admin" ? "admin" : "site");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function go(v) {
    setView(v);
    if (v === "admin") history.replaceState(null, "", "#admin");
    else history.replaceState(null, "", location.pathname);
    window.scrollTo(0, 0);
  }

  return (
    <div className="page">
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="/" onClick={(e) => { e.preventDefault(); go("site"); }} aria-label="Nimbus home">
            <Icon.Logo /> <span>Nimbus</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {view === "site" && (
              <>
                <a href="#how">How it works</a>
                <a href="#features">Features</a>
                <a href="#widget">Widget</a>
              </>
            )}
            <button
              className={`admin-toggle ${view === "admin" ? "on" : ""}`}
              onClick={() => go(view === "admin" ? "site" : "admin")}
            >
              {view === "admin" ? "Back to site" : "Admin view"}
            </button>
          </nav>
        </div>
      </header>

      {view === "admin" ? <AdminPanel /> : <Landing />}

      <footer className="foot">
        <div className="wrap">
          <span>Nimbus is a portfolio demo. The sample company and its prices are fictional.</span>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
