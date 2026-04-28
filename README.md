# Static Next.js + BFF demo

A sample web project where:

- **`web/`** is a Next.js (App Router) + React app that is exported to a fully static
  site via `output: "export"`. The build artefact is plain `index.html` /
  `_next/*` files in `web/out/` — no Node.js runtime is needed to serve it.
- **`bff/`** is an Express **Backend-for-Frontend**. It owns the dynamic data
  (a tiny in-memory todo list) and exposes a small JSON API.

The static site calls the BFF over HTTP at runtime, so it keeps working after
being deployed to any static host (S3, Netlify, GitHub Pages, an nginx
container, …).

```
┌────────────────┐         fetch()          ┌──────────────┐
│  web/  (out/)  │ ───────────────────────▶ │   bff/       │
│  static HTML   │   GET/POST /api/todos    │  Express API │
│  + React JS    │ ◀─────────────────────── │              │
└────────────────┘         JSON             └──────────────┘
        ▲                                           ▲
        │ served by any                             │ runs as a normal
        │ static file host                          │ Node service
```

## Why a separate BFF?

When `next build` runs with `output: "export"`, **Next.js API routes are not
emitted** — there is no server to run them on. So the API has to live in its
own process. This repo splits them cleanly:

| concern                    | lives in            |
| -------------------------- | ------------------- |
| UI, routing, React code    | `web/` (static)     |
| Data, business logic, auth | `bff/` (Node)       |

## Prerequisites

- Node.js 18.17+ (Node 20 / 22 recommended), **or** Docker 24+ with Compose v2.

## Run with Docker Compose

```bash
docker compose up --build
```

Open <http://localhost:3000>. The `web` service builds the static export and
serves it via nginx on port 3000; the `bff` service runs the Express API on
port 4000.

To point the static site at a non-default BFF URL (the browser must be able to
reach it), pass `BFF_PUBLIC_URL` at build time:

```bash
BFF_PUBLIC_URL=https://bff.example.com CORS_ORIGIN=https://app.example.com \
  docker compose build --no-cache web bff
docker compose up
```

## Install

From the repo root:

```bash
npm install --workspaces --include-workspace-root
```

## Run in development

In two terminals:

```bash
# terminal 1 — BFF on http://localhost:4000
npm run dev:bff

# terminal 2 — Next.js dev server on http://localhost:3000
npm run dev:web
```

Open <http://localhost:3000>. The page loads the todo list from the BFF.

## Build the static site and serve it

```bash
# 1. Build the BFF and start it
npm run build
npm run start:bff           # listens on :4000

# 2. Serve the exported static site
npm run serve:web           # serves web/out/ on :3000 via `serve`
```

Visit <http://localhost:3000> — exactly the same UI, but now backed by the
**static export**, still calling the BFF over HTTP.

You can also point any static host at `web/out/`. Examples:

```bash
# nginx
cp -r web/out/* /usr/share/nginx/html/

# any one-off static server
npx serve web/out
```

## Configuring the BFF URL

The frontend reads the BFF URL from the `NEXT_PUBLIC_BFF_URL` env var **at
build time** (Next.js inlines `NEXT_PUBLIC_*` into the bundle). Defaults to
`http://localhost:4000`.

```bash
# build the static site against a production BFF
NEXT_PUBLIC_BFF_URL=https://bff.example.com npm run build:web
```

The BFF accepts:

- `PORT` — default `4000`.
- `CORS_ORIGIN` — default `*`. Set to your site origin in production, e.g.
  `CORS_ORIGIN=https://app.example.com`.

## API surface

| Method | Path                | Body                          | Returns           |
| ------ | ------------------- | ----------------------------- | ----------------- |
| GET    | `/api/health`       | —                             | `{ ok, service }` |
| GET    | `/api/todos`        | —                             | `Todo[]`          |
| POST   | `/api/todos`        | `{ title: string }`           | `Todo`            |
| PATCH  | `/api/todos/:id`    | `{ title?, done? }`           | `Todo`            |
| DELETE | `/api/todos/:id`    | —                             | `{ ok: true }`    |

Where `Todo = { id: string; title: string; done: boolean }`.

## Project layout

```
.
├── package.json          # workspace root + convenience scripts
├── web/                  # Next.js + React, output: "export"
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── todos/TodoApp.tsx
│   ├── lib/bff.ts        # tiny fetch wrapper, reads NEXT_PUBLIC_BFF_URL
│   ├── next.config.mjs   # output: "export"
│   └── package.json
└── bff/                  # Express BFF
    ├── src/server.ts
    └── package.json
```
