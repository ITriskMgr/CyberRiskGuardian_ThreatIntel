// Identity, privilege & configuration — registers: CRUD, CSV, blank → null, subset/future/personal-data/secret rules, compensated deviation, baseline approval.
import { open, ok, done } from './lib.mjs';
import { ipcOn, goto } from './ipc_lib.mjs';
const { browser, page, errors } = await open('#/process');
await ipcOn(page);
// a fresh organization workspace, so the registers start empty
await page.evaluate(async () => { const st = await import('/js/state.js'); await st.create(st.newWorkspace({ name: 'IPC register test' })); });
await page.waitForTimeout(500);
const F = label => page.locator('.modal .field', { has: page.locator(`label:text-is("${label}")`) }).locator('input,select,textarea').first();
const save = () => page.locator('.modal .btnrow .btn:text-is("Save")');
const reg = () => page.evaluate(async () => (await import('/js/state.js')).S.ws.ipc);
// accounts: add
await goto(page, '#/ipc/accounts');
ok(await page.isVisible('#panel-ipc >> text=Information gap — organizational validation required'), 'empty register: information gap');
await page.click('#panel-ipc .card button:text-is("Add")'); await page.waitForSelector('.modal');
await F('Type').selectOption('service');
await F('Population (a group, never a person)').fill('Integration accounts');
await F('Accounts').fill('40'); await F('Without an owner').fill('5');
ok(await page.isVisible('.modal >> text=Give this row an owner'), 'warn: owner missing on a service population');
ok(await save().isEnabled(), 'a warning lets Save go');
await F('Without an owner').fill('41');
ok(await save().isDisabled() && await page.isVisible('.modal >> text=Accounts without an owner cannot exceed the number of accounts.'), 'subset rule blocks: ownerless ≤ count');
await F('Without an owner').fill('5');
await F('Accounts').fill('-1'); ok(await save().isDisabled(), 'negative count blocks');
await F('Accounts').fill('2.5'); ok(await save().isDisabled(), 'non-integer count blocks');
await F('Accounts').fill('40');
await F('Last reconciliation').fill('2099-01-01'); ok(await save().isDisabled() && await page.isVisible('.modal >> text=A date of this register cannot be in the future.'), 'future date blocks');
await F('Last reconciliation').fill('2026-10-01');
for (const [txt, what] of [['svc-backup@clinic.example', 'e-mail/UPN'], ['CORP\\svc_backup', 'DOMAIN\\user'], ['S-1-5-21-3623811015-3361044348-30300820-1013', 'SID'],
  ['10.0.0.1 10.0.0.2 10.0.0.3 10.0.0.4', 'more than three IPv4'], ['AKIAABCDEFGHIJKLMNOP', 'AWS key'], ['-----BEGIN PRIVATE KEY-----', 'private key'], ['password = hunter2', 'password=']]) {
  await F('Note').fill(txt); ok(await save().isDisabled(), 'guard blocks ' + what);
}
await F('Note').fill('');
await F('Owner (role or team)').fill('Jean Tremblay');
ok(await page.isVisible('.modal >> text=Registers hold groups, not people: use a role or team.') && await save().isEnabled(), 'name-like owner warns only');
await F('Owner (role or team)').fill('Platform engineering');
await F('Dormant').fill('');
await save().click(); await page.waitForTimeout(300);
let R = await reg();
ok(R.accounts.length === 1 && R.accounts[0].id === 'AP-01' && R.accounts[0].count === 40 && R.accounts[0].dormant === null && R.accounts[0].mfa === null, 'saved; blank → null; machine identity has no MFA ' + JSON.stringify(R.accounts[0]).slice(0, 160));
ok(await page.isVisible('#panel-ipc >> text=unknown'), 'unknown shown in the table');
// edit and delete
await page.click('#panel-ipc tbody button:text-is("Open")'); await page.waitForSelector('.modal');
await F('Accounts').fill('42'); await save().click(); await page.waitForTimeout(300);
R = await reg(); ok(R.accounts[0].count === 42, 'edited');
// CSV export
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#panel-ipc button:text-is(".csv")')]);
ok(/^ap-.*\.csv$/.test(dl.suggestedFilename()), 'CSV export ' + dl.suggestedFilename());
page.once('dialog', d => d.accept());
await page.click('#panel-ipc tbody button:text-is("Open")'); await page.waitForSelector('.modal');
await page.click('.modal button:text-is("Delete")'); await page.waitForTimeout(300);
R = await reg(); ok(R.accounts.length === 0, 'deleted');
// the other subset rules, through the model's validator (the forms run the same one)
const v = await page.evaluate(async () => { const I = await import('/js/ipc.js'); const b = (r, o) => I.validate(r, { ...I.blankRow(r), ...o }).block;
  return { mfa: b('accounts', { type: 'employee', count: 5, mfa: 6 }), mfaPR: b('accounts', { type: 'employee', count: 5, mfa: 3, mfaPR: 4 }), dormant: b('accounts', { count: 5, dormant: 6 }),
    standing: b('privileged', { holders: 3, standing: 4 }), jit: b('privileged', { holders: 3, jit: 4 }), shared: b('privileged', { holders: 3, shared: 4 }), pmfa: b('privileged', { holders: 3, mfa: 4 }),
    sumWarn: I.validate('privileged', { ...I.blankRow('privileged'), tier: 1, owner: 'x team', holders: 5, standing: 2, jit: 2 }).warn.join(),
    uses: b('emergency', { uses: 1, usesReviewed: 2 }), dec: b('reviews', { decisionsDue: 1, decisionsDone: 2 }), rev: b('reviews', { revocationsRequested: 1, revocationsVerified: 2 }),
    chg: b('changes', { count: 1, verified: 2 }), cs1: b('ciScopes', { inScope: 10, assigned: 11 }), cs2: b('ciScopes', { inScope: 10, assigned: 5, assessed: 6 }), cs3: b('ciScopes', { inScope: 10, assigned: 5, assessed: 4, compliant: 5 }),
    ok: b('ciScopes', { inScope: 10, assigned: 5, assessed: 4, compliant: 4 }), closed: b('reviews', { closed: '2099-01-01' }), lastTest: b('emergency', { lastTest: '2099-01-01' }), lastUse: b('emergency', { lastUse: '2099-01-01' }),
    comp: b('deviations', { cls: 'compensated', exception: '' }), compOk: b('deviations', { cls: 'compensated', exception: 'EXC-001' }), jwt: b('sod', { note: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.abcdefghijk' }),
    slack: b('sod', { note: 'xoxb-1234-abcd' }), gh: b('sod', { note: 'ghp_abcdefghijklmnop' }) }; });
for (const k of ['mfa', 'mfaPR', 'dormant', 'standing', 'jit', 'shared', 'pmfa', 'uses', 'dec', 'rev', 'chg', 'cs1', 'cs2', 'cs3', 'closed', 'lastTest', 'lastUse', 'comp', 'jwt', 'slack', 'gh']) ok(!!v[k], 'blocks: ' + k);
ok(!v.ok && !v.compOk, 'valid rows pass');
ok(/Standing plus just-in-time/.test(v.sumWarn), 'warn: standing + jit ≠ holders');
// compensated deviation without an exception, in the form
await goto(page, '#/ipc/deviations');
await page.click('#panel-ipc .card button:text-is("Add")'); await page.waitForSelector('.modal');
await F('Drift class').selectOption('compensated');
ok(await save().isDisabled() && await page.isVisible('.modal >> text=A compensated deviation needs a linked exception.'), 'compensated deviation without exception blocks');
await page.click('.modal button:text-is("Cancel")');
// baselines: add, new version, approve freezes, hashes, supersedes
await goto(page, '#/ipc/baselines');
await page.click('#panel-ipc .card:has(h2:has-text("Baselines")) button:text-is("Add")'); await page.waitForSelector('.modal');
await F('Name').fill('Linux servers hardening'); await save().click(); await page.waitForTimeout(300);
await page.click('#panel-ipc button[data-versions="BL-01"]'); await page.waitForSelector('.modal');
page.once('dialog', d => d.accept('Infrastructure manager'));
await page.click('.modal button[data-approve="1.0"]'); await page.waitForTimeout(300);
R = await reg(); let bl = R.baselines[0];
ok(bl.versions[0].state === 'approved' && /^[0-9a-f]{64}$/.test(bl.versions[0].hash) && bl.versions[0].approvedBy === 'Infrastructure manager', 'approve sets state, approver and SHA-256');
const h = await page.evaluate(async () => { const I = await import('/js/ipc.js'); const v = (await import('/js/state.js')).S.ws.ipc.baselines[0].versions[0]; const ab = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(I.canonical(v))); return [...new Uint8Array(ab)].map(b => b.toString(16).padStart(2, '0')).join('') === v.hash; });
ok(h, 'hash = SHA-256 of the canonical version without its hash');
ok(await page.isVisible('.modal >> text=read-only'), 'approved version is read-only');
await page.click('#ipc-newversion'); await page.waitForTimeout(200);
page.once('dialog', d => d.accept('Infrastructure manager'));
await page.click('.modal button[data-approve="1.1"]'); await page.waitForTimeout(300);
R = await reg(); bl = R.baselines[0];
ok(bl.versions.length === 2 && bl.versions[0].state === 'superseded' && bl.versions[1].state === 'approved', 'approving 1.1 supersedes 1.0');
const noApprover = await page.evaluate(async () => { const I = await import('/js/ipc.js'); const b = { versions: [I.blankVersion('2.0')] }; try { I.approve(b, b.versions[0], ''); return false; } catch { return true; } });
ok(noApprover, 'approval needs approvedBy');
await page.keyboard.press('Escape');
// other registers: add one row each through the form
for (const [tab, fill] of [['privileged', { 'Role group': 'Domain admins', Holders: '3' }], ['emergency', { 'Account set': 'Tenant break-glass', Accounts: '2' }], ['reviews', { Campaign: 'Q4 review', 'Decisions due': '10', 'Decisions made': '9' }],
  ['sod', { 'Rule (the two duties that must not be combined)': 'Create and approve supplier', Conflicts: '1' }], ['changes', { 'Period (YYYY-Qn or YYYY-MM)': '2026-Q3', Changes: '4', Verified: '4' }]]) {
  await goto(page, '#/ipc/' + tab, 400);
  await page.click('#panel-ipc .card button:text-is("Add")'); await page.waitForSelector('.modal');
  for (const [l, x] of Object.entries(fill)) await F(l).fill(x);
  await save().click(); await page.waitForTimeout(250);
}
R = await reg();
ok(R.privileged.length === 1 && R.emergency.length === 1 && R.reviews.length === 1 && R.sod.length === 1 && R.changes.length === 1, 'one row in each register');
ok(R.emergency[0].controls.offlineCustody === 'unknown' && R.reviews[0].decisionsDone === 9, 'emergency controls default unknown; counts stored');
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); done('t33 ipc registers');
