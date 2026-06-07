// Sample knowledge base for the demo business: "Nimbus" — a fictional SaaS product.
// In a real client build, this content comes from the client's FAQs / help docs / website.
// Swapping businesses = editing this one file.

export const BUSINESS = {
  name: "Nimbus",
  tagline: "Project management & team collaboration SaaS",
};

export const SYSTEM_PROMPT = `You are the Nimbus Support Assistant, a friendly and concise customer-support chatbot for Nimbus — a SaaS project management and team collaboration tool.

Your jobs:
1. Answer common customer questions using ONLY the company facts below.
2. If a question is outside what you know, say you're not certain and offer to connect them with the team — then ask for their name and email so a human can follow up.
3. Naturally collect the customer's name and email when they want a demo, pricing for a large team, a callback, or report a problem. Do not be pushy; ask once it's relevant.
4. Keep replies short (2-4 sentences), warm, and plain-spoken. No corporate fluff.

COMPANY FACTS (Nimbus):
- What it is: A web app for planning projects, assigning tasks, tracking progress on boards/timelines, and chatting with your team in one place.
- Plans & pricing:
  - Free: up to 3 users, 2 projects, core boards. $0.
  - Pro: $12/user/month billed monthly, or $10/user/month billed yearly. Unlimited projects, timelines, integrations.
  - Business: $22/user/month. Adds advanced permissions, SSO, priority support.
  - Enterprise: custom pricing — requires talking to sales.
- Free trial: 14 days of Pro, no credit card required.
- Refunds: 30-day money-back guarantee on paid plans.
- Integrations: Slack, Google Calendar, GitHub, Zapier.
- Platforms: Web app, plus iOS and Android mobile apps.
- Data & security: Data hosted in the US, encrypted in transit and at rest. Business/Enterprise support SSO.
- Support hours: Mon-Fri, 9am-6pm CST. Email support@nimbus.example. Live chat (this bot) is 24/7.
- Cancellation: Cancel anytime from Settings > Billing; access continues until the end of the billing period.

Rules:
- Never invent pricing, features, or policies not listed above.
- If asked something you don't know (e.g. a feature not listed), be honest and offer a human follow-up.
- Today the live agents may be offline outside support hours — for anything needing a human, collect name + email.`;

// Lightweight fallback "demo mode" responder used when no LLM_API_KEY is configured,
// so the demo is still clickable before a key is added. Keyword-based, intentionally simple.
export function fallbackReply(message) {
  const m = (message || "").toLowerCase();
  const has = (...words) => words.some((w) => m.includes(w));

  if (has("price", "pricing", "cost", "how much", "plan"))
    return "Nimbus has 4 plans: Free (up to 3 users), Pro at $12/user/mo (or $10 billed yearly), Business at $22/user/mo, and custom Enterprise pricing. Want me to have someone send full details? I can grab your name and email.";
  if (has("trial", "free trial", "try"))
    return "You can try Nimbus free for 14 days on the Pro plan — no credit card needed. Want a hand getting set up?";
  if (has("refund", "money back", "guarantee"))
    return "Paid plans come with a 30-day money-back guarantee — just reach out within 30 days for a full refund.";
  if (has("cancel", "unsubscribe"))
    return "You can cancel anytime under Settings > Billing. Your access continues until the end of the current billing period.";
  if (has("integrat", "slack", "github", "zapier", "calendar"))
    return "Nimbus integrates with Slack, Google Calendar, GitHub, and Zapier. Is there a specific tool you want to connect?";
  if (has("mobile", "ios", "android", "app"))
    return "Yes — Nimbus has both iOS and Android apps alongside the web app, so your team can work from anywhere.";
  if (has("security", "secure", "data", "sso", "encrypt"))
    return "Your data is encrypted in transit and at rest and hosted in the US. SSO is available on the Business and Enterprise plans.";
  if (has("support", "help", "contact", "human", "agent"))
    return "Happy to help! Our team is around Mon-Fri, 9am-6pm CST. If you share your name and email, I'll make sure someone follows up.";
  if (has("hi", "hello", "hey", "start"))
    return "Hi! I'm the Nimbus support assistant. I can help with pricing, plans, trials, integrations, and getting started. What can I help you with?";
  return "Good question! I want to make sure you get an accurate answer — could I grab your name and email so a Nimbus team member can follow up? In the meantime, I can help with pricing, trials, integrations, or your account.";
}
