# MProfit white-label replica (frontend)

Exact-feel Classic + Analytics SPAs with a local mock API. No live MProfit credentials belong in this tree.

## Run

From `C:\Users\shiba\OneDrive\Desktop\MProfit\replica\`:

```bash
npm install
npm run dev
```

| App | URL | Role |
|-----|-----|------|
| Classic | http://localhost:5173 | Login + portfolio chrome |
| Analytics | http://localhost:5174 | Dashboard / Portfolio / Exposure |
| Mock API | http://localhost:3001 | Cookie session + fixtures |

Individual scripts: `npm run dev:classic`, `npm run dev:analytics`, `npm run dev:api`.

## Local demo login (mock only)

| Email | Password |
|-------|----------|
| `sahilshahani@rathi.com` | `Sahil@123` |
| `shibayanbiswas@rathi.com` | `Shibayan@123` |
| `hasyapatel@rathi.com` | `Hasya@123` |
| `ferozeazeez@rathi.com` | `Feroze@123` |

Analytics has no login screen. An unauthenticated hit on `:5174` bounces to Classic `/login`. After Classic login, open Analytics via the top-nav **Analytics** control (same db / family / portfolio token).

## Layout

```
replica/
  apps/classic/      Vite React SPA :5173
  apps/analytics/    Vite React SPA :5174
  apps/mock-api/     Node cookie API :3001
  packages/shared/   Types, HTTP client, white-label constants
  scripts/dev.mjs    Starts all three together
```

Product bible (screens, IA, exclusions): `../mprofit-replica/`.

End-to-end map + live click audit (2026-09-21): `../mprofit-replica/notes/FRONTEND-CODEBASE-AND-LIVE-AUDIT-2026-09-21.md`.
