# Kiln Tracker

Kiln Tracker is a web app for pottery studios to coordinate kiln firings, glaze projects, and shared reference libraries. The current scope targets a single studio with ~10 users while keeping the data model ready for multi-studio growth.

## Core entities and relationships
- **Studio**: workspace container for all data. Has many Users, Kilns, Glazes, Clay Bodies, Projects, and Firings.
- **User**: belongs to one Studio. Owns setups/projects but, within a studio, everyone can view/edit everything except locked firings.
- **Kiln**: belongs to a Studio. Has many Firing records and Maintenance entries.
- **KilnMaintenanceEntry**: belongs to a Kiln. Tracks dated maintenance events.
- **Firing**: belongs to a Kiln and is started by a User. Holds setup details (firing type, target cone, fill level, outside temp) and lifecycle status (ongoing, completed, aborted, test). Locking after completion prevents edits.
- **FiringEvent**: belongs to a Firing. Chronological log of switch/dial changes, lid actions, temperature readings, and free-text notes. Deleted when a firing is removed.
- **Glaze** and **ClayBody**: studio-level libraries for reference and search.
- **Project**: one physical piece. Belongs to a Studio and User, references a ClayBody, and contains ordered **ProjectSteps**.
  - **ProjectStep**: ordered steps of type `glaze` or `firing` with metadata and notes.
  - **ProjectStepGlaze**: one glaze application per step (glaze, coats, method, pattern).
  - **ProjectStepFiring**: records linking to an existing Firing or standalone firing info (cone, peak temp, date).
- **Photo**: attached to a ProjectStep and optionally flagged as the project cover image.

## Proposed architecture
- **Frontend**: Next.js (App Router) with React + TypeScript. Server Components for data fetching; Client Components for interactive logging forms and step editors.
- **API layer**: tRPC running inside Next.js app routes for end-to-end type safety. Routers grouped by domain (auth, kilns, firings, projects, libraries).
- **Database/ORM**: PostgreSQL with Prisma. Prisma client used inside server routes and shared service helpers.
- **Auth**: email/password flow (stubbed for now). User/session utilities live under `src/server/auth`.
- **Business logic**: domain services in `src/server/services` (e.g., firing lifecycle, project step orchestration). tRPC routers call services rather than hitting Prisma directly.
- **Validation/schemas**: Zod schemas colocated with routers (`src/server/schemas`) and re-used on the client.
- **Prediction hook (phase 2)**: placeholder service under `src/server/services/prediction` that can consume firing event histories.

## Initial repository structure
```
prisma/
  schema.prisma           # Database models
src/
  app/                    # Next.js app router pages/api handlers
  server/
    trpc/                 # Routers and context
    services/             # Business logic per domain
    auth/                 # Auth utilities (stubbed)
    schemas/              # Zod schemas for validation
  db/
    client.ts             # Prisma client helper (lazy singleton)
  types/
    entities.ts           # Shared TypeScript entity mirrors
```

## Features (planned)
- Kiln setup and maintenance logging per kiln.
- Firing setup, live event logging (switch/dial, lid, temperature, notes), completion locking, and deletion for mistakes.
- Firing history with filters (kiln, type, cone, date range, status, max temp, keyword search).
- Studio glaze and clay body libraries with searchable metadata.
- Project tracking per piece with ordered glaze/firing steps, photos, and linkage to firing records.
- Glaze search combining glaze names, clay bodies, and note keywords.

## Tech stack
- Next.js (App Router) + React + TypeScript
- tRPC for typed server-client communication
- Prisma ORM with PostgreSQL
- Auth: email/password (stub; replaceable with NextAuth or custom handler)

## Getting started (draft)
1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` (or `.env.local`) and set a real `DATABASE_URL`, admin credentials, and a strong `SESSION_SECRET`. The app will fall back to the example values in development, but production **must** set its own secrets.
3. Run migrations once the schema stabilizes: `npx prisma migrate dev`.
4. Start the dev server: `npm run dev` (or `npm run tracker` if you prefer that shortcut).

### npm install troubleshooting
- A `403 Forbidden` from the proxy for packages such as `@prisma/client` means the MITM proxy is blocking the request; ask your
  network admin to allow `https://registry.npmjs.org/` (and the `@prisma` scope) through the proxy.
- Keep the provided MITM CA at `/usr/local/share/ca-certificates/envoy-mitmproxy-ca-cert.crt` and `strict-ssl=false` in `.npmrc`
  so TLS handshakes succeed when the proxy forwards requests.
- If your environment bypasses the proxy entirely, remove `proxy`/`https-proxy` entries from `.npmrc` so npm talks to the registry
  directly instead of hitting the blocked proxy.

## Previewing the draft dashboard
Until the Next.js tooling is wired up in this repo, you can view a static preview of the draft dashboard layout at
`preview/dashboard.html`. From the repo root run `python -m http.server 8000` and open
`http://localhost:8000/preview/dashboard.html` in your browser.

