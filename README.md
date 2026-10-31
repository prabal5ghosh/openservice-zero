# OpenService Zero

**An open-source, full-stack service management platform built for learning, prototyping, and small-scale experimentation.**

OpenService Zero brings common IT service management (ITSM) workflows into a single browser-based application: ticketing, service requests, departmental workspaces, approvals, a knowledge base, asset tracking, simple automation, and reporting.

[**🌐 Open Live Application**](https://openservice-zero.openservice-prabal.workers.dev) · [**💻 GitHub Source Code**](https://github.com/prabal5ghosh/openservice-zero) · [**📄 MIT License**](LICENSE)

> **Project status: Functional MVP / public prototype.** The application is deployed on Cloudflare Workers with a Cloudflare D1 database, but it is **not enterprise-complete, production security certified, or suitable for sensitive real-world customer data** without additional work and independent review.

---

## Live application

| Resource | Link |
|---|---|
| **Live website** | **https://openservice-zero.openservice-prabal.workers.dev** |
| Source repository | https://github.com/prabal5ghosh/openservice-zero |
| Health-check endpoint | https://openservice-zero.openservice-prabal.workers.dev/api/health |
| Hosting | Cloudflare Workers + static assets |
| Cloud database | Cloudflare D1 (SQLite-compatible) |
| License | MIT |

The hosted application supports creating an organization workspace and signing in through the browser. Accounts and tickets created on the hosted website are stored in the remote D1 database; they are **separate from local development data**. The public site is a prototype, not a managed support service. **Use fictional test data only.**

### What you can explore

1. **Create a workspace**: Enter an organization name, your name, email, and a password of at least 12 characters. The first account becomes that organization's administrator.
2. **Explore the dashboard**: View tickets, statuses, workspace activity, and summary metrics.
3. **Create team accounts**: As an administrator, add agent and requester accounts through the Team members area.
4. **Submit a service request**: Select an item from the service catalog or create a ticket.
5. **Handle a ticket**: As an agent, assign it, update its status, and add public comments or internal notes.
6. **Test approvals**: Submit a catalog item requiring approval and review it as an administrator.
7. **Explore supporting modules**: Knowledge articles, asset register, automation rules, in-app notifications, audit events, and reports.

> **No shared demo credentials are provided.** Avoid using real workplace, financial, HR, medical, or customer information during testing.

---

## Key features

| Area | Implemented functionality |
|---|---|
| **Multi-tenant organizations** | Tenant-scoped users, records, sessions, and department data |
| **Authentication** | Organization + email + password, PBKDF2 password hashes, server-side sessions, HttpOnly cookies |
| **Role-based access** | Administrator, agent, and requester roles with resource-level permission checks |
| **Department workspaces** | IT, HR, Finance, Legal, and Facilities created at registration; custom workspaces supported |
| **Ticket management** | Create, list, search, filter, open, update, prioritize, assign, and track tickets |
| **Ticket conversations** | Public replies and internal-only agent notes |
| **Service catalog** | Request templates, configurable form fields, optional approval requirements |
| **Approval workflow** | Pending, approved, and rejected decisions with ticket status changes and notifications |
| **Knowledge base** | Create and read articles, basic keyword search, visibility settings |
| **Asset management** | Inventory records, categories, serial numbers, assignees, and status |
| **Automation rules** | On ticket creation/update, apply conditional priority, status, or assignment changes |
| **Dashboard and reports** | Overview metrics, overdue counts, department totals, ticket statuses, 14-day trends |
| **Notifications** | In-app updates with read/unread tracking |
| **Audit log** | Records of selected user actions and ticket/approval changes |
| **Smart suggestions** | Local, deterministic keyword-based classification; **not an LLM** |
| **Tests** | Core utility and backend integration tests, including tenant-isolation scenarios |

### User roles

| Role | Typical actions |
|---|---|
| **Administrator** | Manage users and workspaces, configure service catalog, review approvals, view reports and audit logs |
| **Agent** | Manage tickets they are permitted to access, change status and assignment, add comments and internal notes |
| **Requester** | Create requests, follow their own tickets, view public replies, browse accessible knowledge articles |

Sensitive workspaces such as HR and Legal have additional access rules; access behavior still requires further security review before production use.

---

## Architecture

```text
                      Browser (HTML / CSS / JavaScript)
                                     |
                      HTTPS / Cloudflare Workers
                                     |
                  +------------------+-------------------+
                  |                                      |
           Static assets                           Worker API
           /public/*                              /api/*
                                                         |
                                              Authentication and
                                              authorization logic
                                                         |
                                               Cloudflare D1
                                              (remote database)
```

The project is intentionally lightweight. It uses a vanilla JavaScript frontend and a JavaScript Worker backend rather than a large frontend framework. Local development can run without downloading npm packages by using Node.js's built-in SQLite support.

**Technology stack**

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** JavaScript, Cloudflare Workers API
- **Cloud database:** Cloudflare D1 (SQLite-compatible SQL)
- **Local development:** Node.js 22.13+ using built-in `node:sqlite`
- **Cloud deployment:** Wrangler CLI, Workers static assets, and D1 migrations
- **Source control:** Git and GitHub
- **Testing:** Node.js built-in test runner and project integration tests

### Local vs hosted environments

| Environment | Run command | Database | URL |
|---|---|---|---|
| Standalone local | `node scripts/dev.mjs` | `.local/openservice.sqlite` | `http://localhost:8787` |
| Cloudflare local simulator | `npm run dev:cloudflare` | Wrangler local D1 data | Wrangler-provided local URL |
| Public cloud | `npx wrangler deploy` | Remote Cloudflare D1 | [Live website](https://openservice-zero.openservice-prabal.workers.dev) |

**Data is not synchronized between these environments.**

---

## Getting started locally

### Requirements

- Node.js **22.13 or newer** (required for built-in `node:sqlite`)
- Git (if cloning from GitHub)
- A modern browser

### 1. Clone and start

```bash
git clone https://github.com/prabal5ghosh/openservice-zero.git
cd openservice-zero
node scripts/dev.mjs
```

Open **http://localhost:8787** and select **Create workspace**. Enter an organization, name, email, and password (at least 12 characters). There are no preset admin passwords.

The standalone local server binds to **127.0.0.1 only** and should **not** be exposed directly to the internet. Its database is stored at `.local/openservice.sqlite` and persists between restarts.

### 2. Run tests

```bash
npm run check
```

The core local workflow and tests do not require a Cloudflare account. Running the standalone development server does not require `npm install`.

### 3. Reset local data (optional)

Stop the local server before deleting its database:

```bash
rm .local/openservice.sqlite
```

**Warning:** This permanently deletes the data stored by the standalone local application. It does not clear the remote Cloudflare D1 database.

---

## Deploy to Cloudflare Workers and D1

The project is already deployed at **https://openservice-zero.openservice-prabal.workers.dev**. The instructions below are for deploying **your own copy**.

Cloudflare offers free-tier Workers and D1 services, subject to plan eligibility and usage limits. A free-tier deployment can require no paid subscription, but **free availability and quotas can change**. Check the official pages before relying on a fixed €0 operating budget:

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [D1 getting started](https://developers.cloudflare.com/d1/get-started/)

### 1. Install cloud tooling and authenticate

```bash
npm install
npx wrangler login
```

### 2. Create your own D1 database

```bash
npx wrangler d1 create openservice-db
```

Open `wrangler.jsonc` and set `d1_databases[0].database_id` to the **new database ID returned by your command**. Set a unique Worker `name` if you are deploying under a different Cloudflare account or naming convention.

**Do not assume the database ID committed to the original repository belongs to your account.**

### 3. Apply the database migration

```bash
npx wrangler d1 migrations apply openservice-db --remote
```

### 4. Deploy

```bash
npx wrangler deploy
```

Wrangler prints your `workers.dev` URL. Visit the URL and create an organization account. The remote database starts empty and does not inherit local users or tickets.

### 5. Validate the deployment

```bash
curl https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/health
```

A successful health-check response contains `"status":"ok"` and the application name. This checks the API route and database binding presence, but does **not** replace full end-to-end or security testing.

### Cloudflare-style local development

After installing dependencies:

```bash
npm run db:local
npm run dev:cloudflare
```

Wrangler's local D1 simulator uses data separate from `.local/openservice.sqlite`.

### Troubleshooting

- **Registration returns a server error:** Check the Worker logs with `npx wrangler tail openservice-zero --format pretty` (substitute your Worker name). Ensure `pwHash()` uses a PBKDF2 iteration count supported by the Cloudflare runtime; this project uses **100,000** iterations for new password hashes.
- **Database errors:** Confirm the D1 binding in `wrangler.jsonc` matches the configured Worker and that remote migrations were applied.
- **New code not appearing online:** Pushing to GitHub alone does not deploy changes unless a GitHub-to-Cloudflare build integration has been configured. Otherwise run `npx wrangler deploy`.
- **Local Node.js errors:** Confirm `node --version` is at least 22.13.

---

## Project structure

```text
openservice-zero/
├── public/
│   ├── index.html               Authentication and app shell
│   ├── styles.css               Responsive styles
│   └── app.js                   Browser UI, forms, and API client
├── src/
│   ├── index.js                 Worker API, authentication, and backend
│   └── core.js                  Shared utilities, validation, and triage
├── migrations/
│   └── 0001_schema.sql          D1 / SQLite schema
├── scripts/
│   └── dev.mjs                  Dependency-free local Node HTTP server
├── tests/
│   ├── core.test.js             Utility tests
│   └── worker.integration.test.js  Backend and tenant-isolation tests
├── wrangler.jsonc               Cloudflare configuration and D1 binding
├── package.json                 Scripts and tooling dependency
├── package-lock.json            Dependency lockfile
├── README.md                    Project documentation
└── LICENSE                      MIT license
```

---

## Example end-to-end workflow

1. **Admin:** Create an organization and add an agent and requester in **Team members**.
2. **Admin:** Optionally add the agent to a restricted HR or Legal workspace using **Workspaces → Manage access**.
3. **Admin:** Configure a catalog item; enable approval if desired.
4. **Requester:** Log in with the same organization and submit the service request.
5. **Admin:** Approve or reject the pending request if approval was required.
6. **Agent:** Open the ticket, update priority or status, and post a public reply or internal note.
7. **Requester:** Track progress and view public replies in **My requests**.
8. **Admin:** Review dashboards, notifications, and audit events.

This sequence exercises several modules but is not a substitute for a complete automated system test.

---

## API overview

```text
POST        /api/auth/register
POST        /api/auth/login
POST        /api/auth/logout
GET         /api/auth/me
GET         /api/health
GET         /api/dashboard
GET/POST    /api/workspaces
POST        /api/workspaces/:id/members
GET/POST    /api/users
GET/POST    /api/catalog
GET/POST    /api/tickets
GET/PATCH   /api/tickets/:id
POST        /api/tickets/:id/comments
GET         /api/approvals
POST        /api/approvals/:id/decision
GET/POST    /api/knowledge
GET/POST    /api/assets
GET/POST    /api/automations
PATCH       /api/automations/:id/toggle
GET         /api/notifications
PATCH       /api/notifications/:id/read
GET         /api/reports
GET         /api/audit
POST        /api/assist
```

All endpoints except registration, login, and the health check require a valid session cookie. Database access uses parameterized SQL, and application code implements tenant-scoped access checks. Some multi-step operations still need stronger transactional guarantees before high-reliability production use.

---

## Current limitations and roadmap

**Not yet implemented:** SSO/SAML/SCIM, MFA, email verification, email-based password reset, outbound/inbound email ticket processing, attachments, external integrations, advanced SLA calendars, drag-and-drop workflow design, durable background tasks, advanced search, lifecycle orchestration, exports, API rate limiting, anti-abuse measures, automatic database backups and restore, mobile apps, billing, and compliance certification. The smart-assistance feature uses keyword rules, not a hosted or local language model.

**Potential future improvements** (not commitments or existing capabilities):

- **Security first:** Account verification, safe password recovery, MFA, login throttling, CSP and CSRF assessment, richer permission and tenant-isolation tests.
- **Reliability:** Improved transaction handling, monitoring, backup/restore workflows, operational alerts, and scheduled jobs.
- **Product workflow:** File attachments, ticket SLAs, email-to-ticket processing, custom statuses, and a more flexible approval engine.
- **Integrations and reporting:** Webhooks, external identity providers, CSV exports, and richer analytics.
- **Developer experience:** CI tests, versioned release notes, structured API documentation, and optional GitHub-to-Cloudflare continuous deployment.

### Security and privacy warning

**OpenService Zero is a prototype. Do not store real customer confidential data, credentials, medical information, or actual HR/finance records on the public instance.** Before real-world deployment, obtain an independent security review and implement appropriate account protection, access controls, monitoring, retention/export policies, compliance measures, and backups. Local development mode is not a production web server.

---

## Contributing

Contributions, bug reports, and suggestions can be proposed through the [GitHub repository](https://github.com/prabal5ghosh/openservice-zero). Before submitting changes:

```bash
npm run check
```

For changes intended for Cloudflare, also verify the Worker deployment and migrations in a **separate development environment**. Do not commit secrets, `.env` files, local databases, or real personal data. GitHub source changes are separate from deployment until an automatic build integration is configured.

## License and independence

Released under the [MIT License](LICENSE). OpenService Zero is an independently developed project; it does not include Freshworks source code, customer data, logos, or proprietary artwork, and it is not affiliated with or endorsed by Freshworks.
