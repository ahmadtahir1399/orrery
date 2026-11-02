<div align="center">

# Orrery

### The project tracker built for teams and their agents

Orrery is an issue tracker for teams that want Linear-style speed, Jira-style
depth, and optional AI assistance without giving up control of their data.
Bring your own OpenAI or Anthropic key, or keep AI disabled and use the
built-in native planner.

[Quick start](#quick-start) ·
[Mobile app](#mobile-app-coming-soon) ·
[Features](#features) ·
[Deployment](#deployment) ·
[Docs](#docs)

</div>

---

## Quick Start

On a Linux server with Docker Compose (at least 4 GB of memory, or swap, for
the first build):

```bash
git clone <your-repository-url> orrery
cd orrery
cp .env.example .env
docker compose up -d
```

Fill in `APP_URL` and the secrets in `.env` before the first `up`. Compose
builds the web image from this checkout, applies the database migrations, and
serves the app on `127.0.0.1:3000`. Put a TLS reverse proxy in front (the
`nginx/tasknebula.conf` template works), open your domain, and finish the
first-run admin wizard.

### Update

```bash
./scripts/tasknebula-backup.sh
git pull
docker compose up -d
```

For production hardening, reverse proxy setup, Supabase, LiveKit, email,
OAuth, and backups, use [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Features

| Area                   | Highlights                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Project management** | Kanban, backlog, sprints, epics, subtasks, custom fields, issue links, attachments, imports       |
| **Collaboration**      | Comments, reactions, docs, project chat, presence, realtime updates, collaborative editing        |
| **AI assistance**      | Draft/issue assist, cited workspace Ask, native planner, agent activity, fail-closed previews     |
| **Admin & governance** | Multi-org roles, audit logs, registration controls, webhooks, API-key and policy scaffolding      |
| **Analytics**          | Burndown, velocity, cycle time, throughput, project health, time-in-status, dashboard cards       |
| **Self-hosting**       | Docker-first deploy, Postgres, Redis, health checks, durable work reconciler, optional voice/cron |

Importers currently cover **Jira**, **Linear**, **GitHub**, and **CSV**.

---

## AI, Privacy, And Languages

- **AI is opt-in.** Configure workspace or platform keys from the admin UI.
  OpenAI and Anthropic are supported, and the native planner works without an
  external LLM.
- **Self-hosted by default.** Your app, database, Redis, uploads, and optional
  voice server run in your own environment.
- **30 locale catalogs included.** Browser/device auto-detection, persisted
  language choice, native-name switching, and RTL support for Arabic and Hebrew
  are built in. Catalog/ICU parity is automated; linguistic review continues
  for legacy copy.

---

## Mobile App Coming Soon

Native mobile apps are on the way. Availability details will be shared when
they are ready.

---

## Runtime

| Item              | Value                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Image             | Built from this repository by `docker compose up` (local tag `orrery-web:latest`)                 |
| Runtime port      | `3000`                                                                                            |
| Health endpoint   | `GET /api/health`                                                                                 |
| Required services | PostgreSQL 16 + `pgvector` (bundled container or Supabase), Redis 7                               |
| Optional services | LiveKit voice profile, scheduled-product cron, email, experimental OAuth, OpenAI / Anthropic keys |

---

## Deployment

Orrery is designed around a small production surface:

- `web`: Next.js standalone runtime
- `postgres`: PostgreSQL 16 with pgvector
- `redis`: cache, realtime fan-out, and background coordination
- `approval-reconciler`: durable approval-effect delivery and project-agent run recovery
- optional `livekit` (`voice` profile): voice rooms
- optional `cron` profile: standup, janitor, embeddings, rollover, and version checks

First generate an ignored `.env` with unique database, Redis, auth, and LiveKit
credentials (`bash scripts/setup.sh` does this interactively). Compose refuses to
start when required secrets are absent. Voice remains disabled unless the
`voice` profile and its URLs are configured. Then use:

```bash
docker compose up -d
docker compose ps
curl -fsS http://localhost:3000/api/health
docker compose logs -f web
```

To use Supabase instead of the bundled Postgres, set `DATABASE_URL` and
`DATABASE_MIGRATION_URL` and add `docker-compose.supabase.yml`; see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#hosted-postgres-supabase).

---

## Docs

| Need                   | Link                                           |
| ---------------------- | ---------------------------------------------- |
| Full release history   | [CHANGELOG.md](CHANGELOG.md)                   |
| Documentation index    | [docs/README.md](docs/README.md)               |
| Current status         | [docs/STATUS.md](docs/STATUS.md)               |
| Deployment guide       | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)       |
| Architecture           | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   |
| Agent runtime contract | [docs/AGENT_RUNTIME.md](docs/AGENT_RUNTIME.md) |
| Roadmap                | [docs/ROADMAP_2026.md](docs/ROADMAP_2026.md)   |
| Release process        | [docs/RELEASE.md](docs/RELEASE.md)             |
| Contributing           | [CONTRIBUTING.md](CONTRIBUTING.md)             |
| AI agent/project guide | [CLAUDE.md](CLAUDE.md)                         |

---

## Development

For an interactive fresh-clone setup, run `bash scripts/setup.sh`. It installs
dependencies, provisions ignored environment files, generates local secrets,
and can start PostgreSQL/Redis and apply migrations.

The equivalent manual flow is:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
# Populate AUTH_SECRET/NEXTAUTH_SECRET, POSTGRES_PASSWORD, REDIS_PASSWORD,
# LIVEKIT_API_KEY, and LIVEKIT_API_SECRET with unique random values. The setup
# script performs this wiring automatically and is the recommended path.
# DATABASE_URL in apps/web/.env.local must use the same generated Postgres
# credentials; setup.sh also performs this URL-safe wiring.
pnpm install
docker compose up -d --wait postgres redis
pnpm db:migrate
pnpm --filter @tasknebula/web dev
```

For bundled voice, set `LIVEKIT_URL` and `NEXT_PUBLIC_LIVEKIT_URL`, then run
`docker compose --profile voice up -d`. The base stack does not open LiveKit's
host-network listeners.

The root `pnpm dev` starts every workspace, including the optional Hocuspocus
collaboration service; use its documented environment contract before choosing
that command.

Before pushing code, run:

```bash
pnpm --filter @tasknebula/mcp-server build
pnpm i18n:check
pnpm hygiene:check
pnpm ui:check
pnpm docs:check
pnpm type-check
pnpm lint
pnpm test
pnpm --filter @tasknebula/web openapi:check
git diff --check
```

---

## License

MIT. See [LICENSE](LICENSE).

Orrery is built on [TaskNebula](https://github.com/neuraparse/tasknebula) by Neura Parse, also MIT licensed. The original copyright notice is kept in the license file.
