# OpenService Zero

**An independently designed, open-source, full-stack service management MVP.** It includes an admin/agent/requester web portal, persistent multi-tenant data, a service catalog, department workspaces, approvals, ticket comments, a knowledge base, asset tracking, simple automations, dashboards, reports, notifications, and audit logs.

It is **not** enterprise-complete or production security certified. The application and local development require **zero paid accounts**. An optional remote deployment targets Cloudflare's Workers/D1 free plan, subject to current provider limits and account eligibility.

## Start locally — zero payment, no dependencies to install

Requires **Node.js 22.13 or newer**, which provides the built-in `node:sqlite` module.

```bash
# Unzip this project, then:
cd openservice-zero
node scripts/dev.mjs
```

Open **http://localhost:8787** in a browser. Click **Create workspace**, enter your organization, email, name and a password of 12 or more characters. Your local data persists at `.local/openservice.sqlite`. You can stop/restart the app without losing data.

The local server binds **only to 127.0.0.1** by default and should not be exposed directly to the internet. To reset local data, stop the server and remove `.local/openservice.sqlite` (this permanently erases your local app data). There are no default admin passwords.

To verify the application:

```bash
npm run check
```

Tests require Node.js 22.13+; they use in-memory SQLite and do not require a Cloudflare account or install packages.

## Deploy online — Cloudflare's free tier

According to the Cloudflare documentation checked 2026-10-30, Workers Free advertises **100,000 requests per day**. D1 Free advertises **5 GB storage, 5 million rows read/day, 100,000 rows written/day**. Cloudflare advertises that Workers Free registration does not require a payment card. Plans, conditions, quotas, and signup details can change. **Do not upgrade to a paid plan** if your requirement is a hard €0 budget. On the Free plan, usage over daily quotas may fail rather than incur usage charges.

Official Cloudflare pages:

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/d1/get-started/

1. Create a free Cloudflare account. No domain purchase is needed for a `workers.dev` address.
2. Install dependencies for the **cloud deployment tooling only** (not required for local development):

   ```bash
   npm install
   npx wrangler login
   ```

3. Create your cloud D1 database:

   ```bash
   npx wrangler d1 create openservice-db
   ```

4. Copy the **database_id** shown in the command output into `wrangler.jsonc`, replacing `00000000-0000-4000-8000-000000000001`.
5. Create tables remotely:

   ```bash
   npx wrangler d1 migrations apply openservice-db --remote
   ```

6. Deploy the app and its static assets:

   ```bash
   npx wrangler deploy
   ```

7. Wrangler should print a URL ending in `.workers.dev`. Visit it, then create your organization account.

The remote database starts fresh; it does **not** automatically copy your local `.local` data. This environment could not fetch npm dependencies or connect to your Cloudflare account, so the exact remote deployment sequence is **documented but not verified against a live account**. The Worker API, database schema, and static client were independently exercised locally through integration tests and the dependency-free local HTTP server.

For a *Cloudflare-style local test* after npm install and after applying migrations locally:

```bash
npm run db:local
npm run dev:cloudflare
```

The local standalone server (`node scripts/dev.mjs`) uses a **different** local SQLite file from Wrangler's D1 simulator.

## What is actually implemented

| Capability | Implementation |
|---|---|
| Multiple organizations | Each user belongs to a tenant, tenant-scoped queries, sessions and per-tenant data |
| Authentication | Organization + email + password; PBKDF2 password hashes; server-side session records and HttpOnly cookies |
| Admin/agent/requester | Three roles, per-resource permission checks; restricted workspace membership for sensitive departments |
| Department workspaces | IT, HR, Finance, Legal, Facilities seeded at registration; custom workspaces |
| Ticketing | Create/list/search/filter/open/update tickets, status, priority, assignment, requester, due time |
| Conversations | Public replies and internal-only agent notes |
| Service catalog | Request items, optional structured custom fields, optional admin approval |
| Approvals | Pending/approved/rejected decisions, requester notification, status transitions |
| Knowledge base | Create/read articles, basic text search and visibility rules |
| Asset register | Create/view assets, categories, serials, ownership, statuses |
| Workflow rules | On create/update, a matching condition can set priority, status or assignee |
| Analytics | Dashboard summary, overdue counts, per-department totals, status distributions and 14-day trend |
| Notifications | In-app notifications stored in D1, mark-as-read |
| Auditing | User/actions, ticket/approval/change events |
| Smart suggestions | **Free, deterministic keyword classification**; not an LLM or AI API |
| API | JSON endpoints in `src/index.js`, `/api/health` health check |
| Tests | Core utility tests and end-to-end backend tests including tenant isolation |
| Hosting | Standalone local Node HTTP server; Cloudflare Workers + D1 deployment configuration |

## Important limitations — not implemented

This is a **working functional MVP**, not the entire mature Freshservice product. It does not contain SSO/SAML/SCIM, 2FA, email delivery or inbound email conversion, external integrations, attachment file storage, advanced SLAs/business calendars, visual workflow editing, background timers, full-text search, employee lifecycle orchestration, password-reset emails, analytics exports, rate limits, anti-abuse mechanisms, backups/restore automation, billing, mobile apps, SOC 2/ISO certifications, GDPR consent/retention/export tooling, or an actual LLM-based copilot. Agent workflows and permission granularity are simplified. Default approval always routes to the first organization admin. Workflows execute synchronously and are not durable multi-day background orchestrations.

### Security warning

This application is a **prototype**. Do not upload real customer confidential data, medical information, actual HR/finance records, or production credentials until the system has been professionally hardened and independently reviewed. Priorities include verified email/account activation, password reset, MFA, secure session management and lifecycle, brute-force/rate controls, CSRF review, CSP, sensitive-workspace permission tests, field-level permissions, transactional integrity checks, secure audit retention, legal/privacy controls, continuous backups, anti-spam and monitoring. `node scripts/dev.mjs` is a development server, not a public production server.

## Repository structure

```text
openservice-zero/
├── public/
│   ├── index.html         Single-page dashboard and authentication shell
│   ├── styles.css         Responsive UI and theme
│   └── app.js             Browser application, views, forms and API client
├── src/
│   ├── index.js           Cloudflare Worker: auth + REST backend
│   └── core.js            Shared pure utilities, triage and validation
├── migrations/
│   └── 0001_schema.sql    Database schema for D1 / SQLite
├── scripts/
│   └── dev.mjs            No-dependency Node + SQLite local HTTP server
├── tests/
│   ├── core.test.js       Validation and triage tests
│   └── worker.integration.test.js    Integration and tenant-isolation tests
├── wrangler.jsonc         Cloudflare Worker config (replace database ID)
├── package.json           Wrangler dev dependency and scripts
└── LICENSE                MIT
```

## Roles / demo flow

**Admin:** Create your organization, create a requester and agent in Team members, optionally grant the agent access to HR or Legal through Workspaces → Manage access, add a knowledge article and a custom catalog item, view approval requests.

**Requester:** Sign in with the same organization and the account assigned by the admin, submit a ticket through Service catalog, then track it under My requests.

**Agent:** View permitted tickets, assign tickets, change status, and add a comment. Restricted departments are hidden unless the agent was added to that workspace.

## API endpoints

```text
POST /api/auth/register, /api/auth/login, /api/auth/logout
GET  /api/auth/me, /api/health, /api/dashboard
GET/POST /api/workspaces, /api/users, /api/catalog, /api/tickets
GET/PATCH /api/tickets/:id
POST /api/tickets/:id/comments
GET /api/approvals
POST /api/approvals/:id/decision
GET/POST /api/knowledge, /api/assets, /api/automations
PATCH /api/automations/:id/toggle
POST /api/workspaces/:id/members
GET /api/notifications, /api/reports, /api/audit
PATCH /api/notifications/:id/read
POST /api/assist
```

Every endpoint except registration, login, and health requires the session cookie. All database reads/writes use parameterized SQL. Tenant-scoped checks are implemented in application code. A number of operations that perform several dependent SQL statements outside D1 `batch` are not yet fully transactional and need further review for high-reliability production use.

## Copyright and licence

MIT. This is independently developed original code. No Freshworks source code, customer data, trademarks, logos or proprietary artwork are included. Do not use the application in a way that misrepresents it as an official Freshworks product.
