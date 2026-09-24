import express from "express";
import { getDatabasePath, getDb } from "./db.js";
import { facetsRouter } from "./routes/facets.js";
import { usersRouter } from "./routes/users.js";
import { BadRequestError } from "./errors.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.get("/api/health", (_req, res) => {
  try {
    getDb().prepare("SELECT 1").get();
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false, error: "Database unavailable" });
  }
});

app.use("/api/users", usersRouter);
app.use("/api/facets", facetsRouter);

// Catches anything thrown in a route; Express 5 also forwards async errors here
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof BadRequestError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(port, () => {
  getDb();
  console.log(`API listening on http://localhost:${port}`);
  console.log(`SQLite database: ${getDatabasePath()}`);
});
