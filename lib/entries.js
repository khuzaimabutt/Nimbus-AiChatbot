// Knowledge entries for the demo business (Nimbus). Every answer is one entry.
// The matcher picks the best entry for a question. Below the bar, no answer is
// given and the question is handed to the team. Only these facts are ever used.

export const ENTRY_BAR = 0.6;

export const ENTRIES = [
  { id: "what-is", group: "About", question: "What is Nimbus?", answer: "Nimbus is a web app for planning projects, assigning tasks, tracking progress on boards and timelines, and chatting with your team in one place." },
  { id: "plan-free", group: "Plans", question: "What does the Free plan include?", answer: "The Free plan is $0 and covers up to 3 users, 2 projects and the core boards." },
  { id: "plan-pro", group: "Plans", question: "How much is the Pro plan?", answer: "Pro is $12 per user per month billed monthly, or $10 per user per month billed yearly. It includes unlimited projects, timelines and integrations." },
  { id: "plan-business", group: "Plans", question: "What does the Business plan cost?", answer: "Business is $22 per user per month. It adds advanced permissions, SSO and priority support." },
  { id: "plan-enterprise", group: "Plans", question: "Do you offer enterprise pricing?", answer: "Enterprise pricing is custom. It starts with a conversation with our sales team." },
  { id: "trial", group: "Plans", question: "Is there a free trial?", answer: "Yes. You get 14 days of Pro with no credit card required." },
  { id: "refunds", group: "Billing", question: "Do you offer refunds?", answer: "Paid plans come with a 30-day money-back guarantee." },
  { id: "cancel", group: "Billing", question: "How do I cancel my subscription?", answer: "You can cancel anytime from Settings > Billing. Access continues until the end of the billing period." },
  { id: "integrations", group: "Product", question: "Which integrations do you support?", answer: "Nimbus integrates with Slack, Google Calendar, GitHub and Zapier." },
  { id: "platforms", group: "Product", question: "Is there a mobile app?", answer: "Yes. Nimbus has a web app, plus iOS and Android apps." },
  { id: "data-security", group: "Security", question: "Where is my data stored and is it secure?", answer: "Data is hosted in the US and encrypted in transit and at rest." },
  { id: "sso", group: "Security", question: "Do you support single sign-on?", answer: "SSO is available on the Business and Enterprise plans." },
  { id: "support-hours", group: "Support", question: "When is support available?", answer: "Email support is Mon-Fri, 9am-6pm CST at support@nimbus.example. This live chat is available 24/7." },
];

// Other words customers use for the same entry. Indexed with the question and answer.
const ALSO_ASKED = {
  "plan-free": "free plan cost price users",
  "plan-pro": "price pricing cost pro plan monthly yearly",
  "plan-business": "price pricing cost business plan sso",
  "plan-enterprise": "enterprise custom pricing contact sales",
  trial: "try free trial 14 days credit card",
  refunds: "refund money back guarantee",
  cancel: "cancel unsubscribe stop billing",
  integrations: "integration slack github zapier calendar connect",
  platforms: "mobile app iphone android ios phone",
  "data-security": "data security encrypted encryption secure privacy hosted",
  sso: "sso single sign-on login saml",
  "support-hours": "support contact help hours team reach email human",
  "what-is": "nimbus product tool about",
};

const STOP = new Set([
  "a", "an", "the", "is", "are", "am", "do", "does", "did", "you", "your", "i", "my",
  "me", "of", "to", "in", "on", "for", "and", "or", "it", "be", "can", "what", "which",
  "there", "any", "how", "with", "that", "this", "have", "if", "we", "our", "will", "get",
  "give", "work", "use", "tell", "know", "need", "want", "see", "about", "at", "from",
  "by", "as", "up", "so", "not", "all", "whats", "s",
]);

// Light stemming: "plans" -> "plan", "integrations" -> "integration".
function tokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9$ ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

// Each entry is indexed by its question and answer together.
const INDEX = ENTRIES.map((e) => new Set(tokens(`${e.question} ${e.answer} ${ALSO_ASKED[e.id] ?? ""}`)));

// Rare words count for more: a word in one entry weighs more than one in many.
function weight(word) {
  const df = INDEX.reduce((n, set) => n + (set.has(word) ? 1 : 0), 0);
  return Math.log((ENTRIES.length + 1) / (df + 1)) + 1;
}

// Returns { entry, score } for the best entry. entry is null below the bar.
export function matchEntry(question) {
  const words = [...new Set(tokens(question))];
  if (words.length === 0) return { entry: null, score: 0 };

  const total = words.reduce((sum, w) => sum + weight(w), 0);
  let best = { entry: null, score: 0 };
  ENTRIES.forEach((entry, i) => {
    const found = words.reduce((sum, w) => sum + (INDEX[i].has(w) ? weight(w) : 0), 0);
    const score = found / total;
    if (score > best.score) best = { entry, score };
  });

  if (best.score < ENTRY_BAR) return { entry: null, score: best.score };
  return best;
}

// The only context the model sees when it reworded an answer.
export function entrySystemPrompt(entry) {
  return `You are the Nimbus support assistant. Reply in two or three plain sentences.
Use ONLY the entry below. If it does not answer the question, say you are not sure.
Entry (${entry.group}): Q: ${entry.question} A: ${entry.answer}`;
}
