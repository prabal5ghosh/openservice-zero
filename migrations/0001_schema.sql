PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','agent','requester')),
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL,
  UNIQUE(tenant_id,email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'general',
  sensitive INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL,
  UNIQUE(tenant_id,name)
);
CREATE INDEX IF NOT EXISTS idx_ws_tenant ON workspaces(tenant_id);
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY(workspace_id,user_id)
);
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  code TEXT NOT NULL, workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  requester_id TEXT NOT NULL REFERENCES users(id),
  assignee_id TEXT REFERENCES users(id),
  catalog_item_id TEXT,
  subject TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'incident' CHECK(type IN ('incident','service_request','task')),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','pending_approval','on_hold','resolved','closed','rejected')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  tags TEXT NOT NULL DEFAULT '[]', custom_fields TEXT NOT NULL DEFAULT '{}',
  due_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE(tenant_id,code)
);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_updated ON tickets(tenant_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_ws_status ON tickets(tenant_id,workspace_id,status);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  ticket_id TEXT NOT NULL REFERENCES tickets(id), author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL, internal INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_ticket ON comments(ticket_id,created_at);
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  ticket_id TEXT NOT NULL REFERENCES tickets(id),
  approver_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  decision_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, decided_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(tenant_id,approver_id,status);
CREATE TABLE IF NOT EXISTS catalog_items (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  requires_approval INTEGER NOT NULL DEFAULT 0,
  form_schema TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_catalog_tenant ON catalog_items(tenant_id,workspace_id);
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  workspace_id TEXT REFERENCES workspaces(id), title TEXT NOT NULL,
  content TEXT NOT NULL, visibility TEXT NOT NULL DEFAULT 'all' CHECK(visibility IN ('all','agents')),
  author_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_tenant ON articles(tenant_id);
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Other',
  serial_number TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'available',
  assigned_user_id TEXT REFERENCES users(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL, event TEXT NOT NULL CHECK(event IN ('ticket_created','ticket_updated')),
  field TEXT NOT NULL CHECK(field IN ('priority','workspace_id','status','type')),
  equals_value TEXT NOT NULL, action TEXT NOT NULL CHECK(action IN ('set_priority','assign_user','set_status')),
  action_value TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id), user_id TEXT NOT NULL REFERENCES users(id),
  ticket_id TEXT REFERENCES tickets(id), text TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(tenant_id,user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenants(id),
  actor_id TEXT REFERENCES users(id), action TEXT NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_events(tenant_id,created_at DESC);
