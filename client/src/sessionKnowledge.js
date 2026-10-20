// Answers the owner adds from the owner view. They live in this browser tab's session storage
// only, so they answer questions in this tab and nowhere else. Storage can be blocked, so every
// access is wrapped.
const KEY = "nimbus-session-knowledge";
const MAX = 20;

export function readSessionKnowledge() {
  try {
    const list = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addSessionKnowledge(question, answer) {
  const list = [...readSessionKnowledge(), { question, answer }].slice(-MAX);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage blocked: nothing is saved, and the owner view says so.
  }
  return list;
}

export function clearSessionKnowledge() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage is blocked.
  }
  return [];
}
