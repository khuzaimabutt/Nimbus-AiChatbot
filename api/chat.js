import { handleChat } from "../lib/handlers.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { status, body } = await handleChat(req.body || {});
    res.status(status).json(body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
