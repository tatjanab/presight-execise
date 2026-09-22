import express from "express";
import { getDatabasePath, getDb } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.get("/api/health", (_req, res) => {
  getDb();
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
