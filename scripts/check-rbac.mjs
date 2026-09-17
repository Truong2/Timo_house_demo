import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const fixture = {
  meta: { period: '2026-10', today: '2026-10-28' },
  session: null,
  users: [
    { id: 'u-admin', role: 'admin', status: 'active', name: 'Admin' },
    { id: 'u-accountant', role: 'accountant', status: 'active', name: 'Accountant' },
    { id: 'u-ops', role: 'ops', status: 'active', name: 'Ops', buildingIds: ['b1'] },
    { id: 'u-sale-lead', role: 'sale', status: 'active', name: 'Sale lead', teamId: 'team-1' },
    { id: 'u-sale-member', role: 'sale', status: 'active', name: 'Sale member', teamId: 'team-1' },
    { id: 'u-sale-other', role: 'sale', status: 'active', name: 'Sale other', teamId: 'team-2' },
    { id: 'u-tech', role: 'kythuat', status: 'active', name: 'Technician' },
    { id: 'u-hr', role: 'hr', status: 'active', name: 'HR' },
    { id: 'u-investor', role: 'codong', status: 'active', name: 'Investor' },
  ],
  salesTeams: [{ id: 'team-1', leadUserId: 'u-sale-lead', status: 'active' }, { id: 'team-2', leadUserId: 'u-sale-other', status: 'active' }],
  buildings: [{ id: 'b1', name: 'Building 1' }, { id: 'b2', name: 'Building 2' }],
  rooms: [{ id: 'r1', code: 'R1', buildingId: 'b1' }, { id: 'r2', code: 'R2', buildingId: 'b2' }],
  employees: [{ id: 'e-tech', userId: 'u-tech' }],
  buildingAssignments: [{ id: 'ba1', employeeId: 'e-tech', buildingId: 'b1', status: 'active' }],
  leads: [
    { id: 'l-lead', saleId: 'u-sale-lead', buildingIds: ['b1'] },
    { id: 'l-member', saleId: 'u-sale-member', buildingIds: ['b1'] },
    { id: 'l-other', saleId: 'u-sale-other', buildingIds: ['b2'] },
  ],
  leadActivities: [], viewings: [],
  holds: [{ id: 'h-member', leadId: 'l-member', roomId: 'r1', status: 'active' }, { id: 'h-other', leadId: 'l-other', roomId: 'r2', status: 'active' }],
  deals: [], commissions: [],
  incidents: [
    { id: 'i-mine', buildingId: 'b1', assigneeId: 'u-tech' },
    { id: 'i-open', buildingId: 'b1', assigneeId: '' },
    { id: 'i-other-tech', buildingId: 'b1', assigneeId: 'u-someone' },
    { id: 'i-other-building', buildingId: 'b2', assigneeId: 'u-tech' },
  ],
  incidentUpdates: [], maintenanceSchedules: [], assets: [],
  inventories: [{ id: 'inv-b1', buildingIds: ['b1'] }, { id: 'inv-b2', buildingIds: ['b2'] }], inventoryLines: [],
  projects: [{ id: 'p1', buildingId: 'b1' }, { id: 'p2', buildingId: 'b2' }],
  shareholders: [{ id: 'sh-me', userId: 'u-investor' }, { id: 'sh-other', userId: 'u-other-investor' }],
  capitalCommitments: [{ id: 'cc-me', shareholderId: 'sh-me', projectId: 'p1' }, { id: 'cc-other', shareholderId: 'sh-other', projectId: 'p2' }],
  contributions: [{ id: 'c-me', shareholderId: 'sh-me', projectId: 'p1' }, { id: 'c-other', shareholderId: 'sh-other', projectId: 'p2' }],
  distributions: [
    { id: 'd-me', projectId: 'p1', lines: [{ shareholderId: 'sh-me', amount: 100 }, { shareholderId: 'sh-other', amount: 900 }] },
    { id: 'd-other', projectId: 'p2', lines: [{ shareholderId: 'sh-other', amount: 500 }] },
  ],
  tenants: [], contracts: [], contractMembers: [], contractServices: [], roomAssets: [],
  landlords: [], landlordContracts: [], landlordPayments: [], meterReadings: [], invoices: [], invoiceLines: [],
  payments: [], paymentAllocations: [], refunds: [], refundDeductions: [], expenses: [], expenseAllocations: [],
  documents: [], importJobs: [{ id: 'job-mine', createdBy: 'u-ops' }, { id: 'job-other', createdBy: 'u-admin' }],
  auditLog: [], zaloBatches: [], zaloMessages: [], openingBalances: [],
  reportRuns: [{ id: 'report-mine', cat: 'sales', createdBy: 'u-sale-member' }, { id: 'report-team', cat: 'sales', createdBy: 'u-sale-lead' }, { id: 'report-admin', cat: 'sales', createdBy: 'u-admin' }],
  ocrExtractions: [{ id: 'ocr-mine', createdBy: 'u-ops', fields: [] }, { id: 'ocr-b2', createdBy: 'u-admin', fields: [{ key: 'roomCode', value: 'R2' }] }],
};

const clone = value => JSON.parse(JSON.stringify(value));
const state = clone(fixture);
const store = {
  state,
  rawAll: collection => state[collection] || [],
  rawGet: (collection, id) => (state[collection] || []).find(row => row && row.id === id) || null,
};

const phaseState = { 1: true, 2: true, 3: true };
const TH = {
  store,
  phase: { state: phaseState, on: n => n === 1 || !!phaseState[n], ROLES: { 2: ['sale', 'kythuat'], 3: ['hr', 'codong'] } },
  f: {
    esc: value => String(value ?? ''), uid: prefix => `${prefix}-test`, nowISO: () => '2026-10-28T09:00:00',
    today: () => '2026-10-28', pad: n => String(n).padStart(2, '0'), num: Number,
  },
  q: {}, ui: {}, icon: () => '', pages: {},
};

const noopStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const documentStub = {
  body: { classList: { toggle: () => {}, contains: () => false, remove: () => {} } },
  querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener: () => {},
};
const sandbox = {
  window: { TH, innerWidth: 1280, scrollY: 0, addEventListener: () => {}, removeEventListener: () => {}, scrollTo: () => {} },
  document: documentStub, sessionStorage: noopStorage, localStorage: noopStorage, history: {}, location: {},
  console, setTimeout, clearTimeout, URLSearchParams,
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
const run = rel => vm.runInContext(read(rel), sandbox, { filename: rel });
run('mockup/js/core/auth.js');
assert.ok(TH.auth.ROLE_POLICY && TH.auth.DATA_SCOPE, 'ROLE_POLICY and DATA_SCOPE must be exported');

const login = (role, userId) => { state.session = { role, userId, name: role }; };
const ids = rows => rows.map(row => row.id).sort();

// Data scope: Ops by building, Sale by self/team, Technician by assignment, Investor by ownership.
login('ops', 'u-ops');
assert.deepEqual(ids(TH.auth.filterByScope('buildings', state.buildings)), ['b1']);
assert.deepEqual(ids(TH.auth.filterByScope('ocrExtractions', state.ocrExtractions)), ['ocr-mine']);
assert.equal(TH.auth.can('rooms.manage', { buildingId: 'b1' }), true);
assert.equal(TH.auth.can('rooms.manage', { buildingId: 'b2' }), false);

login('sale', 'u-sale-lead');
assert.deepEqual([...TH.auth.allowedSaleIds()].sort(), ['u-sale-lead', 'u-sale-member']);
assert.deepEqual(ids(TH.auth.filterByScope('leads', state.leads)), ['l-lead', 'l-member']);
login('sale', 'u-sale-member');
assert.deepEqual([...TH.auth.allowedSaleIds()], ['u-sale-member']);
assert.deepEqual(ids(TH.auth.filterByScope('leads', state.leads)), ['l-member']);
assert.deepEqual(ids(TH.auth.filterByScope('holds', state.holds)), ['h-member']);
assert.deepEqual(ids(TH.auth.filterByScope('reportRuns', state.reportRuns)), ['report-mine']);
login('sale', 'u-sale-lead');
assert.deepEqual(ids(TH.auth.filterByScope('reportRuns', state.reportRuns)), ['report-mine', 'report-team']);

login('kythuat', 'u-tech');
assert.deepEqual([...TH.auth.allowedBuildingIds()], ['b1']);
assert.deepEqual(ids(TH.auth.filterByScope('incidents', state.incidents)), ['i-mine', 'i-open']);
assert.equal(TH.auth.can('maintenance.manage', { type: 'incident', record: state.incidents[2] }), false);

login('codong', 'u-investor');
assert.deepEqual(ids(TH.auth.filterByScope('projects', state.projects)), ['p1']);
assert.deepEqual(ids(TH.auth.filterByScope('shareholders', state.shareholders)), ['sh-me']);
assert.deepEqual(ids(TH.auth.filterByScope('capitalCommitments', state.capitalCommitments)), ['cc-me']);
assert.deepEqual(ids(TH.auth.filterByScope('distributions', state.distributions)), ['d-me']);

// Sidebar structure is declarative and every referenced item comes from the canonical registry.
run('mockup/js/ui/layout.js');
const expectedTopLevel = { admin: 6, ops: 6, accountant: 5, sale: 4, kythuat: 3, hr: 3, codong: 2 };
for (const [role, count] of Object.entries(expectedTopLevel)) {
  const groups = TH.layout.menuForRole(role);
  assert.equal(groups.length, count, `${role} must have ${count} top-level sidebar entries`);
  for (const group of groups) for (const item of group.items) {
    assert.ok(TH.layout.NAV_ITEMS[item.key], `${role} references unknown NAV_ITEMS key ${item.key}`);
    assert.equal(item.permission, TH.layout.NAV_ITEMS[item.key].permission, `${role}/${item.key} overrides permission`);
  }
}
const keysOf = role => TH.layout.menuForRole(role).flatMap(group => group.items.map(item => item.key));
for (const [role, userId] of Object.entries({ admin: 'u-admin', accountant: 'u-accountant', ops: 'u-ops', sale: 'u-sale-member', kythuat: 'u-tech', hr: 'u-hr', codong: 'u-investor' })) {
  login(role, userId);
  const sidebarHrefs = new Set(TH.layout.menuForRole(role).flatMap(group => group.items.filter(item => TH.auth.can(item.permission)).map(item => item.href)));
  const launcher = TH.layout.availableLauncherApps();
  for (const app of launcher) {
    assert.equal(sidebarHrefs.has(app.href), false, `${role} has duplicate entry point ${app.href}`);
    assert.equal(TH.auth.can(app.permission), true, `${role} launcher bypasses ${app.permission}`);
  }
}
login('admin', 'u-admin');
assert.equal(keysOf('admin').includes('tools'), false);
assert.ok(TH.layout.availableLauncherApps().some(app => app.href === '#/settings/tools'));
assert.ok(keysOf('ops').includes('crm') && keysOf('ops').includes('inventory'));
assert.ok(keysOf('accountant').includes('maintenance') && keysOf('accountant').includes('inventory'));
assert.equal(TH.layout.NAV_ITEMS.ocr.key, 'ocr');
assert.equal(TH.layout.NAV_ITEMS.inventory.key, 'inventory');
assert.equal(TH.layout.NAV_ITEMS.shareholders.key, 'shareholders');
assert.equal(TH.layout.NAV_ITEMS.roi.href, '#/investment/roi');

// Parse every router registration with a small balanced-parenthesis scanner.
function registrations(source, file) {
  const marker = 'TH.router.register(';
  const rows = [];
  let start = 0;
  while ((start = source.indexOf(marker, start)) >= 0) {
    let i = start + marker.length, depth = 1, quote = '', escaped = false, lineComment = false, blockComment = false;
    for (; i < source.length && depth; i++) {
      const ch = source[i], next = source[i + 1];
      if (lineComment) { if (ch === '\n') lineComment = false; continue; }
      if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
      if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = ''; continue; }
      if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
      if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    const call = source.slice(start, i);
    const route = call.match(/TH\.router\.register\(\s*'([^']+)'/);
    const permission = call.match(/permission\s*:\s*'([^']+)'/);
    const phase = call.match(/phase\s*:\s*(\d+)/);
    const resource = call.match(/resource\s*:\s*\{\s*type\s*:\s*'([^']+)'(?:\s*,\s*param\s*:\s*'([^']+)')?/);
    assert.ok(route, `Cannot parse route in ${file}`);
    assert.ok(permission, `${route[1]} in ${file} has no permission metadata`);
    rows.push({ path: route[1], permission: permission[1], phase: phase ? Number(phase[1]) : 0, resource: resource ? { type: resource[1], param: resource[2] || 'id' } : null, file });
    start = i;
  }
  return rows;
}

const pagesDir = path.join(root, 'mockup/js/pages');
const routes = fs.readdirSync(pagesDir).filter(file => file.endsWith('.js')).flatMap(file => registrations(read(`mockup/js/pages/${file}`), file));
assert.equal(routes.length, 68, 'Expected the demo route inventory to contain 68 routes');
assert.equal(new Set(routes.map(route => route.path)).size, 68, 'Route paths must be unique');
for (const route of routes) assert.ok(TH.auth.ROLE_POLICY[route.permission], `${route.path} uses unknown permission ${route.permission}`);
const routeAt = pathName => routes.find(route => route.path === pathName);
assert.equal(routeAt('/crm/leads/:id').resource.type, 'lead');
assert.equal(routeAt('/crm/deals/:id').resource.type, 'deal');
assert.equal(routeAt('/maintenance/incidents/:id').resource.type, 'incident');
assert.equal(routeAt('/assets/inventory/:id').resource.type, 'inventory');
assert.equal(routeAt('/settings/jobs/:id').resource.type, 'importJob');
assert.equal(routeAt('/reports/runs/:id').resource.type, 'reportRun');

// Direct URLs to records outside the account scope must be denied by canRoute().
login('sale', 'u-sale-member');
assert.equal(TH.auth.canRoute(routeAt('/crm/leads/:id'), { id: 'l-member' }), true);
assert.equal(TH.auth.canRoute(routeAt('/crm/leads/:id'), { id: 'l-other' }), false);
assert.equal(TH.auth.canRoute(routeAt('/rooms/:id'), { id: 'r2' }), true, 'Sale room lookup should remain global');
assert.equal(TH.auth.canRoute(routeAt('/reports/runs/:id'), { id: 'report-mine' }), true);
assert.equal(TH.auth.canRoute(routeAt('/reports/runs/:id'), { id: 'report-admin' }), false);
login('kythuat', 'u-tech');
assert.equal(TH.auth.canRoute(routeAt('/maintenance/incidents/:id'), { id: 'i-mine' }), true);
assert.equal(TH.auth.canRoute(routeAt('/maintenance/incidents/:id'), { id: 'i-other-tech' }), false);
assert.equal(TH.auth.canRoute(routeAt('/assets/inventory/:id'), { id: 'inv-b1' }), true);
assert.equal(TH.auth.canRoute(routeAt('/assets/inventory/:id'), { id: 'inv-b2' }), false);
login('ops', 'u-ops');
assert.equal(TH.auth.canRoute(routeAt('/settings/jobs/:id'), { id: 'job-mine' }), true);
assert.equal(TH.auth.canRoute(routeAt('/settings/jobs/:id'), { id: 'job-other' }), false);

// Guard matrix: Login -> Permission -> Data scope -> Phase -> Render.
const accounts = {
  admin: 'u-admin', accountant: 'u-accountant', ops: 'u-ops', sale: 'u-sale-member',
  kythuat: 'u-tech', hr: 'u-hr', codong: 'u-investor',
};
let matrixCases = 0;
for (const [role, userId] of Object.entries(accounts)) {
  for (const enabled of [false, true]) {
    phaseState[2] = enabled; phaseState[3] = enabled; login(role, userId);
    for (const route of routes) {
      const permitted = TH.auth.canRoute({ permission: route.permission }, {});
      const result = !permitted ? '403' : route.phase && !TH.phase.on(route.phase) ? 'coming-soon' : 'render';
      if (!permitted) assert.equal(result, '403', `${role} must not see a phase teaser for forbidden ${route.path}`);
      if (permitted && route.phase && !enabled) assert.equal(result, 'coming-soon', `${role} should see phase teaser for ${route.path}`);
      matrixCases++;
    }
  }
}
assert.equal(matrixCases, 7 * 68 * 2);
state.session = null;
for (const route of routes) assert.equal(state.session ? 'continue' : 'login', 'login', `Logged-out access to ${route.path} must stop at Login`);

// Direct unauthorized action must throw before mock state changes.
phaseState[2] = true; phaseState[3] = true;
store.all = collection => TH.auth.shouldScopeCollection(collection) ? TH.auth.filterByScope(collection, store.rawAll(collection)) : store.rawAll(collection);
store.get = (collection, id) => store.all(collection).find(row => row && row.id === id) || null;
store.where = (collection, predicate) => store.all(collection).filter(predicate);
store.one = (collection, predicate) => store.all(collection).find(predicate) || null;
store.byCode = (collection, code) => store.all(collection).find(row => row && row.code === code) || null;
store.add = (collection, row) => { state[collection].push(row); return row; };
store.update = (collection, id, patch) => { const row = store.get(collection, id); if (row) Object.assign(row, patch); return row; };
store.remove = (collection, id) => { const index = state[collection].findIndex(row => row && row.id === id); if (index >= 0) state[collection].splice(index, 1); };
store.nextCode = () => 'TEST-001'; store.audit = () => {}; store.save = () => {}; store.saveNow = () => {}; store.emit = () => {};
run('mockup/js/core/actions.js');
login('sale', 'u-sale-member');
const buildingsBefore = JSON.stringify(state.buildings);
assert.throws(() => TH.actions.saveBuilding({ name: 'Forbidden', address: 'Forbidden' }), /quyền|cấp/i);
assert.equal(JSON.stringify(state.buildings), buildingsBefore, 'Denied action changed mock state');
login('ops', 'u-ops');
const roomsBefore = JSON.stringify(state.rooms);
assert.throws(() => TH.actions.saveRoom({ buildingId: 'b2', code: 'B.01' }), /quyền|cấp/i);
assert.equal(JSON.stringify(state.rooms), roomsBefore, 'Out-of-scope action changed mock state');

run('mockup/js/core/actions-p2.js');
login('sale', 'u-sale-member');
const ocrBefore = JSON.stringify(state.ocrExtractions);
assert.throws(() => TH.actions.ocrSetField('ocr-mine', 'roomCode', 'R1'), /quyền|cấp/i);
assert.equal(JSON.stringify(state.ocrExtractions), ocrBefore, 'Denied Phase 2 action changed mock state');

run('mockup/js/core/actions-p3.js');
login('codong', 'u-investor');
const projectsBefore = JSON.stringify(state.projects);
assert.throws(() => TH.actions.saveProject({ name: 'Forbidden', buildingId: 'b1', capital: 1 }), /quyền|cấp/i);
assert.equal(JSON.stringify(state.projects), projectsBefore, 'Denied Phase 3 action changed mock state');

console.log(`✓ RBAC/sidebar/scope OK: ${matrixCases} route-phase cases, 7 roles, ${routes.length} routes`);
