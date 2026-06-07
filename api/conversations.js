import { handleListConversations } from "../lib/handlers.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { status, body } = await handleListConversations();
    res.status(status).json(body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}
