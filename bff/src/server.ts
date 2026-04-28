import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

type Todo = { id: string; title: string; done: boolean };

const PORT = Number(process.env.PORT ?? 4000);
const ORIGIN = process.env.CORS_ORIGIN ?? "*";

const todos = new Map<string, Todo>();
seed();

const app = express();
app.use(express.json());
app.use(cors({ origin: ORIGIN }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "bff", time: new Date().toISOString() });
});

app.get("/api/todos", (_req, res) => {
  res.json([...todos.values()]);
});

app.post("/api/todos", (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).json({ error: "title is required" });
  const todo: Todo = { id: randomUUID(), title, done: false };
  todos.set(todo.id, todo);
  res.status(201).json(todo);
});

app.patch("/api/todos/:id", (req, res) => {
  const existing = todos.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });
  const next: Todo = {
    ...existing,
    title: typeof req.body?.title === "string" ? req.body.title : existing.title,
    done: typeof req.body?.done === "boolean" ? req.body.done : existing.done,
  };
  todos.set(next.id, next);
  res.json(next);
});

app.delete("/api/todos/:id", (req, res) => {
  if (!todos.delete(req.params.id))
    return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[bff] listening on http://localhost:${PORT} (CORS: ${ORIGIN})`);
});

function seed() {
  for (const title of [
    "Read the README",
    "Run the BFF (npm --prefix bff run dev)",
    "Run the static site (npm --prefix web run dev)",
  ]) {
    const id = randomUUID();
    todos.set(id, { id, title, done: false });
  }
}
