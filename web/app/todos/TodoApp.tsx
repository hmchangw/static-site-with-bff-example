"use client";

import { useEffect, useState } from "react";
import { bffFetch } from "@/lib/bff";

type Todo = { id: string; title: string; done: boolean };

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const data = await bffFetch<Todo[]>("/api/todos");
      setTodos(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const created = await bffFetch<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    setTodos((t) => [...t, created]);
    setTitle("");
  }

  async function toggle(id: string, done: boolean) {
    const updated = await bffFetch<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done }),
    });
    setTodos((t) => t.map((x) => (x.id === id ? updated : x)));
  }

  async function remove(id: string) {
    await bffFetch<{ ok: true }>(`/api/todos/${id}`, { method: "DELETE" });
    setTodos((t) => t.filter((x) => x.id !== id));
  }

  return (
    <div className="card">
      <h2>Todos (live from BFF)</h2>
      {loading && <p>Loading…</p>}
      {error && (
        <p className="error">
          Could not reach BFF: {error}. Is it running on the configured URL?
        </p>
      )}

      <form onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={(e) => toggle(t.id, e.target.checked)}
              />{" "}
              <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
                {t.title}
              </span>
            </label>{" "}
            <button onClick={() => remove(t.id)} style={{ marginLeft: 8 }}>
              ×
            </button>
          </li>
        ))}
      </ul>

      {!loading && !error && todos.length === 0 && (
        <small>No todos yet — add one above.</small>
      )}
    </div>
  );
}
