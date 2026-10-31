export const ROLES = ['admin', 'agent', 'requester'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const STATUSES = ['open','in_progress','pending_approval','on_hold','resolved','closed','rejected'];
export const TYPES = ['incident','service_request','task'];
export const hoursForPriority = (priority) => ({low:168,medium:72,high:24,urgent:4})[priority] ?? 72;
export const isoNow = () => new Date().toISOString();
export const deadline = (priority, at=Date.now()) => new Date(at+hoursForPriority(priority)*3600000).toISOString();
export const safe = (v, max=500) => typeof v === 'string' ? v.trim().slice(0,max) : '';
export const isAllowed = (v, allowed) => allowed.includes(v);
export const json = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
export const uid = () => crypto.randomUUID();
export const shortCode = () => 'OS-' + crypto.randomUUID().slice(0,8).toUpperCase();
export function classify(text) {
  const s=String(text||'').toLowerCase();
  if (/(payroll|invoice|reimburse|expense|payment|salary|purchase order)/.test(s)) return {workspace:'Finance',priority:'medium',type:'service_request',reason:'Finance-related wording'};
  if (/(leave|onboard|holiday|benefit|employee|recruit|vacation)/.test(s)) return {workspace:'HR',priority:'medium',type:'service_request',reason:'People-operations wording'};
  if (/(contract|legal|compliance|gdpr|privacy|policy review)/.test(s)) return {workspace:'Legal',priority:'high',type:'service_request',reason:'Legal-related wording'};
  if (/(urgent|outage|production down|security incident|ransomware)/.test(s)) return {workspace:'IT',priority:'urgent',type:'incident',reason:'Potential high-severity operational issue'};
  return {workspace:'IT',priority:'medium',type:'incident',reason:'Default IT triage'};
}
export const contains = (haystack, needle) => String(haystack||'').toLowerCase().includes(String(needle||'').toLowerCase());
