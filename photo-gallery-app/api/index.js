import app, { ensureConnected } from "../backend/server.js";

export default async function handler(req, res) {
  try {
    await ensureConnected();
  } catch (error) {
    console.error("Vercel Serverless DB connection error:", error.message);
  }
  return app(req, res);
}
