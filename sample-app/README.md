# Sample app — Task API

A deliberately tiny **Express + TypeScript** REST API used by the
[Learn the GitHub Copilot app walkthrough](../README.md). It exists to give the agent real,
reviewable work as you follow along — not to be a production service.

## Run it

```bash
npm install
npm run dev      # starts http://localhost:3000 with hot reload
```

```bash
npm test         # Vitest + Supertest (8 passing)
npm run build    # type-check + compile to dist/
npm start        # run the compiled server
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check → `{ "status": "ok" }` |
| `GET` | `/tasks` | List all tasks; use `?completed=true` or `?completed=false` to filter |
| `POST` | `/tasks` | Create a task from `{ "title": "..." }` |
| `GET` | `/tasks/:id` | Get one task (404 if missing) |
| `PATCH` | `/tasks/:id` | Set `{ "completed": true \| false }` |

State is held **in memory**, so it resets on restart — easy to run an exercise repeatably.

## Intentional gaps (this is on purpose)

These are the hooks for the [exercises](../exercises/README.md). Don't "fix" them in `main`:

1. `POST /tasks` does **no input validation**.
2. There is **no `DELETE /tasks/:id`** (and `TaskStore.remove()` is missing).
3. `setCompleted` never refreshes `updatedAt` — a subtle bug.

## Layout

```
src/
  server.ts          # entry point — starts the HTTP listener
  app.ts             # createApp(): wires middleware + routes (injectable store)
  app.test.ts        # API tests via Supertest
  tasks/
    types.ts         # Task type
    store.ts         # in-memory TaskStore (has the intentional gaps)
    routes.ts        # /tasks router
    store.test.ts    # unit tests for TaskStore
```
