# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Software teams (engineers, product managers, and operators) who plan and ship
work every day and increasingly delegate parts of that work to AI agents. They
evaluate the product as a keyboard-first alternative to Jira and Linear, and
then live in it for hours: triaging issues, running sprints, reviewing agent
output, and shipping releases.

## Product Purpose

Orrery is a project tracker where people and AI agents work the same backlog.
Boards, sprints, docs, and analytics live in one workspace, and a built-in MCP
server lets agents read and update issues beside the team. Success means a team
can run delivery from one workspace without tool-hopping, while keeping human
oversight of anything an agent does.

## Positioning

One accountable work graph for humans and agents, with agent actions routed
through the same issues, reviews, and audit trail as human work rather than a
separate chat console. The public line is "Run the work. See every moving
part." — an orrery shows every body's position at once, and the landing tells
one issue's path (intake → plan → build → ship) that the dashboard then shows
with the viewer's real counts. Orrery is presented as the owner's own hosted product:
the landing carries no open-source, license, self-hosting, or upstream
repository messaging.

## Operating Context

- Evaluated on a public landing page, then adopted by creating a workspace.
- Daily use in the authenticated workbench: dashboard attention queue, boards,
  sprints, issue detail, docs, inbox, command palette (Cmd+K).
- Agents connect through the MCP server with organization-bound API keys.
- Data lives in PostgreSQL (with pgvector). Locally that is the Docker Compose
  database; in production it can be a hosted Postgres such as Supabase through
  `DATABASE_URL` (transaction pooler) and `DATABASE_MIGRATION_URL` (session or
  direct connection). Supabase is used as the database only; sign-in, email,
  and storage stay in the app.

## Capabilities and Constraints

- Core tracker: issues, boards, sprints, docs, search, REST API, and OpenAPI;
  the interface ships in 30 languages, including RTL.
- AI features are optional, configuration-dependent, and partly preview; Ask is
  workspace retrieval, not deep research. Never overstate them.
- The MCP server is preview (organization-bound keys; OAuth and per-call audit
  are not finished).
- OAuth sign-in is incomplete; credentials sign-in is the reliable path.
- Postgres row-level security is not implemented; isolation is application
  level. Never claim RLS.
- Email delivery uses Resend when configured, with SMTP as an alternative or
  fallback.
- Update checks against the upstream project are off unless an operator sets
  `TASKNEBULA_ENABLE_UPDATE_CHECK=true`.
- Internal code identifiers (package scopes, storage keys, environment
  variables, webhook headers such as `X-TaskNebula-*`) keep the original
  TaskNebula naming for compatibility. The repository's MIT `LICENSE` notice
  must stay with the source.

## Brand Commitments

- Product name: **Orrery** (renamed from TaskNebula; the visible name changes
  everywhere, internal identifiers do not).
- Visual language is pinned by the owner to a Supabase-inspired system: white
  and near-black surfaces, one emerald green as the action color, calm neutral
  greys, and the product itself as the hero instead of decoration.
- Product visuals on the landing are the app rendered in code and animated
  like a working workspace, never screenshots or stock imagery.
- No AI-looking palettes (no blue-to-violet gradients or neon). Emerald light
  and glow are allowed only as restrained accents around the product.

## Evidence on Hand

- The real product, rendered in code on the landing with labeled sample data:
  board, issue list, sprint view, activity feed, and agent runs.
- OpenAPI spec (`/openapi.json`) for the REST API.
- Absent, must not be fabricated: customer logos, testimonials, user counts,
  benchmarks, pricing tiers, uptime figures, or certifications.

## Product Principles

1. The work leads; navigation and decoration recede.
2. Prove with the real product, never with invented claims.
3. Humans stay accountable for agent actions; the interface makes that visible.
4. Teams own their data.
5. Keyboard-first and accessible in every supported language.

## Accessibility & Inclusion

WCAG AA contrast in light and dark mode, full keyboard operation, visible focus,
reduced-motion support for every animation, and correct RTL layout for Arabic
and Hebrew.
