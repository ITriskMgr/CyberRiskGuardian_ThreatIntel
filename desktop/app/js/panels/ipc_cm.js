/* Identity, privilege & configuration — the configuration registers: baselines with their versions,
   configuration scopes, assets not linked to a baseline, deviations with their exceptions, and
   configuration changes. An approved baseline version is frozen (SHA-256) and read-only. The asset's own
   baseline status is never written here: it keeps driving the asset's drift factor and check AC-7;
   "Link" writes only the baseline name and its reference.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, field, select, toast, today, modal } from '../util.js';
import { touch } from '../state.js';
import * as G from '../grcui.js';
import * as IPC from '../ipc.js';
import * as SH from '../shared.js';
import * as AS from '../assets.js';
import * as MK from '../markers.js';
import { tr } from '../i18n.js';
import { count, tail, stateCell, ipcRegister } from './ipc_regs.js';

const c = v => v === null || v === undefined || v === '' ? el('span', 'muted', tr('unknown')) : String(v);
const blOpts = ws => [['', '—'], ...IPC.reg(ws).baselines.map(b => [b.id, `${b.id} ${b.name}`])];

/* ---------------- baselines ---------------- */
function baselines(body, redraw, ws) {
  const R = IPC.reg(ws);
  if (!R.baselines.length) body.append(banner('warn', MK.INFO_GAP, 'No baseline is recorded yet.'));
  body.append(G.register({ title: 'Baselines', rows: R.baselines, prefix: 'BL', redraw, csv: true,
    blank: () => ({ ...IPC.blankRow('baselines'), id: IPC.nextIdReg(R.baselines, 'BL') }),
    check: r => { const g = IPC.guardRow({ name: r.name, platform: r.platform, licenceRef: r.licenceRef, owner: r.owner, note: r.note }); return { block: g.block || (!String(r.name || '').trim() ? 'Give the baseline a name.' : null), warn: g.warn }; },
    fields: [{ key: 'name', label: 'Name', type: 'text', wide: true }, { key: 'platform', label: 'Platform', type: 'text' }, { key: 'kind', label: 'Kind', type: 'select', options: IPC.BL_KINDS },
      { key: 'licenceRef', label: 'Licence reference (never the licensed text)', type: 'text' }, { key: 'owner', label: 'Owner (role or team)', type: 'text' }, { key: 'note', label: 'Note', type: 'area' }],
    columns: ['id', { key: 'name', label: 'Name', render: r => el('span', { 'data-noi18n': '' }, r.name) }, 'kind',
      { key: 'v', label: 'Versions', render: r => el('div', 'chips', ...(r.versions || []).map(v => pill(`${v.v} · ${tr(IPC.V_STATES.find(s => s[0] === v.state)?.[1] || v.state)}`, v.state === 'approved' ? 'good' : v.state === 'draft' ? 'warn' : ''))) },
      { key: 'legacy', label: 'Legacy', render: r => r.legacy ? '✓' : '' }],
    actions: r => [el('button', { class: 'btn sm ghost', 'data-versions': r.id, onclick: () => versions(ws, r, redraw) }, 'Versions')] }));
  // configuration scopes
  body.append(ipcRegister(ws, 'ciScopes', { title: 'Configuration scopes', redraw,
    fields: [{ key: 'label', label: 'Scope', type: 'text', wide: true }, { key: 'baseline', label: 'Baseline', type: 'select', options: blOpts(ws) }, { key: 'version', label: 'Version', type: 'text' },
      { key: 'fromAssets', label: 'Count live from Information assets', type: 'check' }, { key: 'assetTypes', label: 'Asset types (when counted from Information assets)', type: 'multi', options: AS.TYPES },
      count('inScope', 'In scope'), count('assigned', 'Assigned a baseline'), count('assessed', 'Assessed'), count('compliant', 'Compliant'), { key: 'asOf', label: 'Counts as of', type: 'date' }, ...tail(ws)],
    columns: ['id', { key: 'label', label: 'Scope', render: r => el('span', { 'data-noi18n': '' }, r.label) }, { key: 'b', label: 'Baseline', render: r => r.fromAssets ? tr('Information assets') : [r.baseline, r.version].filter(Boolean).join(' ') || '—' },
      { key: 'n', label: 'In scope · assigned · assessed · compliant', render: r => { const k = IPC.scopeCounts(r, ws); return el('span', null, c(k.inScope), ' · ', c(k.assigned), ' · ', c(k.assessed), ' · ', c(k.compliant)); } },
      { key: 'vs', label: 'Version state', render: r => { const s = r.fromAssets ? null : IPC.versionState(r.baseline, r.version, ws); return s ? pill(tr(IPC.V_STATES.find(x => x[0] === s)[1]), s === 'approved' ? 'good' : 'warn') : '—'; } },
      { key: 'st', label: 'State', render: r => r.fromAssets ? pill(tr('live'), 'good') : stateCell('ciScopes', r, ws) }] }));
  // assets not linked
  const live = (ws.assets || []).filter(a => a.lifecycle?.stage !== 'disposed' && !a.baseline?.name && ['server', 'hardware', 'network', 'cloud', 'iot'].includes(a.type));
  body.append(card({ id: 'ipc-unlinked' }, el('h2', { style: { marginTop: 0 } }, tr('Assets not linked to a baseline ({0})').replace('{0}', live.length)),
    el('p', 'note', '"Link" writes the baseline name and its reference on the asset; the asset\'s own compliance status is left as it is.'),
    live.length ? table([{ key: 'id', label: 'Asset', render: a => el('span', { 'data-noi18n': '' }, `${a.id} ${a.name}`) }, { key: 'type', label: 'Type', render: a => tr(AS.TYPES.find(t => t[0] === a.type)?.[1] || a.type) },
      { key: 'l', label: '', sortable: false, render: a => el('button', { class: 'btn xs', disabled: !R.baselines.length, onclick: () => linkAsset(ws, a, redraw) }, 'Link') }], live, { class: 'compact' })
      : el('div', 'empty-state', tr('Every server, endpoint, network device, cloud service and connected device is linked.'))));
}

function versions(ws, bl, redraw) {
  const draw = () => {
    m.box.querySelector('.vbody')?.remove();
    const b = el('div', 'vbody');
    b.append(table([{ key: 'v', label: 'Version', render: v => el('b', null, v.v) }, { key: 's', label: 'State', render: v => pill(tr(IPC.V_STATES.find(s => s[0] === v.state)?.[1] || v.state), v.state === 'approved' ? 'good' : v.state === 'draft' ? 'warn' : '') },
      { key: 'a', label: 'Approved', render: v => [v.approved, v.approvedBy].filter(Boolean).join(' · ') || '—' }, { key: 'e', label: 'Effective · review', render: v => [v.effective, v.review].filter(Boolean).join(' · ') || '—' },
      { key: 'h', label: 'SHA-256', render: v => v.hash ? el('span', { class: 'mono small', title: v.hash }, v.hash.slice(0, 12) + '…') : '—' },
      { key: 'r', label: 'Rationale', render: v => el('span', { class: 'small', 'data-noi18n': '' }, v.rationale || '') },
      { key: 'x', label: '', sortable: false, render: v => v.state !== 'draft' ? el('span', 'small muted', tr('read-only')) : el('div', 'btnrow',
        el('button', { class: 'btn xs ghost', onclick: () => editVersion(ws, bl, v, draw) }, 'Edit'),
        el('button', { class: 'btn xs', 'data-approve': v.v, onclick: () => {
          const by = window.prompt(tr('Approved by (person or role)'));
          if (by === null) return;
          try { IPC.approve(bl, v, by); touch(); toast(tr('Version {0} approved and frozen').replace('{0}', v.v)); draw(); redraw(); } catch (e) { toast(tr(e.message), 'bad'); }
        } }, 'Approve')) }], bl.versions || [], { class: 'compact' }),
      el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn sm', id: 'ipc-newversion', onclick: () => { IPC.newVersion(bl); touch(); draw(); redraw(); } }, 'New version')));
    m.box.append(b);
  };
  const m = modal(tr('Versions of {0}').replace('{0}', bl.name), el('p', 'note', 'An approved version is frozen with the SHA-256 of its content and becomes read-only; approving a new one supersedes the previous approved version. "New version" copies the latest as a draft.'));
  draw();
}
function editVersion(ws, bl, v, after) {
  G.edit('Draft version', [{ key: 'v', label: 'Version', type: 'text' }, { key: 'effective', label: 'Effective', type: 'date' }, { key: 'review', label: 'Next review', type: 'date' },
    { key: 'rationale', label: 'Rationale', type: 'area' }, { key: 'applicability', label: 'Applies to asset types', type: 'multi', options: AS.TYPES, encode: x => x?.assetTypes || [], decode: x => ({ assetTypes: x, note: v.applicability?.note || '' }) }],
  v, { check: r => ({ block: v.state !== 'draft' ? 'An approved version is read-only.' : IPC.guardText(r.rationale)?.block || null, warn: [] }), onSave: () => { touch(); after(); } });
}
function linkAsset(ws, a, redraw) {
  const R = IPC.reg(ws), s = select(R.baselines.map(b => [b.id, `${b.id} ${b.name}`]), R.baselines[0]?.id); s.setAttribute('data-noi18n', '');
  const m = modal(tr('Link {0} to a baseline').replace('{0}', a.name), field('Baseline', s),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      const bl = R.baselines.find(b => b.id === s.value); if (!bl) return;
      const v = IPC.approvedVersion(bl) || IPC.latestVersion(bl);
      a.baseline ||= { name: '', status: 'unknown', checked: '', deviations: '' };
      const before = a.baseline.name;
      a.baseline.name = bl.name; a.baseline.ref = { id: bl.id, v: v?.v || '' };
      AS.log(ws, a, 'baseline linked', 'baseline.name', before, bl.name, 'ipc');
      touch(); m.close(); toast(tr('Linked')); redraw();
    } }, 'Link'), el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
}

/* ---------------- deviations & exceptions ---------------- */
function excCell(ws, r) {
  if (!r.exception) return r.cls === 'compensated' ? pill(tr('no exception'), 'bad') : '—';
  const x = SH.exceptions(ws).find(e => e.id === r.exception);
  if (!x) return pill(tr('{0} not found').replace('{0}', r.exception), 'bad');
  if (SH.exceptionExpired(x, IPC.asOf(ws))) return pill(`${x.id} · ${tr('Expired — not counted')}`, 'bad');
  return pill(`${x.id} · ${tr(SH.EXC_STATES.find(s => s[0] === x.status)?.[1] || x.status)}${x.expiry ? ' · ' + x.expiry : ''}`, x.status === 'accepted' ? 'good' : 'warn');
}
function requestException(ws, r, redraw) {
  const X = SH.exceptions(ws);
  const id = 'EXC-' + String(X.reduce((m, e) => Math.max(m, Number(String(e.id).split('-').pop()) || 0), 0) + 1).padStart(3, '0');
  const rec = { id, type: 'exception', title: `${r.id} ${r.requirement || ''}`.trim(), status: 'requested', compensatedBy: [], scenarios: [], waivesLaw: false, severity: r.severity || 'medium', opened: today(), concerns: [{ kind: 'deviation', id: r.id }] };
  G.edit('Request exception', [{ key: 'title', label: 'Title', type: 'text', wide: true }, { key: 'scope', label: 'Scope (systems, people, data)', type: 'area' }, { key: 'description', label: 'Departure', type: 'area' },
    { key: 'compensatedBy', label: 'Compensating controls (one per line)', type: 'list' }, { key: 'approvedBy', label: 'Approved by (person)', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: SH.EXC_STATES }, { key: 'expiry', label: 'Expires on', type: 'date' }],
  rec, { validate: SH.exceptionError, note: 'An exception never waives a law', onSave: x => { X.push(x); r.exception = x.id; touch(); redraw(); } });
}
function deviations(body, redraw, ws) {
  const R = IPC.reg(ws);
  if (!R.deviations.length) body.append(banner('warn', MK.INFO_GAP, 'No deviation is recorded yet.'));
  const assets = (ws.assets || []).map(a => [a.id, `${a.id} ${a.name}`]);
  body.append(ipcRegister(ws, 'deviations', { title: 'Deviations', redraw,
    fields: [{ key: 'baseline', label: 'Baseline', type: 'select', options: blOpts(ws) }, { key: 'version', label: 'Version', type: 'text' },
      { key: 'ciScope', label: 'Configuration scope', type: 'select', options: [['', '—'], ...R.ciScopes.map(s => [s.id, `${s.id} ${s.label}`])] },
      { key: 'asset', label: 'Asset (one asset, or leave empty for a count)', type: 'select', options: [['', '—'], ...assets] }, count('count', 'Items deviating'),
      { key: 'cls', label: 'Drift class', type: 'select', options: IPC.DRIFT }, { key: 'severity', label: 'Severity', type: 'select', options: IPC.SEVERITY },
      { key: 'requirement', label: 'Requirement (a short reference, never licensed text)', type: 'text', wide: true }, { key: 'opened', label: 'Opened', type: 'date' }, { key: 'lastSeen', label: 'Last seen', type: 'date' },
      { key: 'exception', label: 'Exception', type: 'select', options: [['', '—'], ...SH.exceptions(ws).map(x => [x.id, `${x.id} ${x.title || ''}`])] },
      { key: 'state', label: 'State', type: 'select', options: IPC.DV_STATES }, { key: 'owner', label: 'Owner (role or team)', type: 'text' }, ...tail(ws)],
    columns: ['id', { key: 'req', label: 'Requirement', render: r => el('span', { 'data-noi18n': '' }, r.requirement || '—') }, { key: 'b', label: 'Baseline', render: r => [r.baseline, r.version].filter(Boolean).join(' ') || '—' },
      { key: 'cls', label: 'Drift class', render: r => r.cls ? tr(IPC.DRIFT.find(x => x[0] === r.cls)[1]) : pill(tr('to be classified'), 'warn') }, 'severity', { key: 'count', label: 'Items', render: r => c(r.count) },
      { key: 'x', label: 'Exception', render: r => excCell(ws, r) },
      { key: 'br', label: 'Blast radius', render: r => { if (!r.asset || !(ws.assets || []).some(a => a.id === r.asset)) return '—'; const b = AS.blastRadius(r.asset, ws); return tr('{0} dependent assets · {1} scenarios').replace('{0}', b.assets.length).replace('{1}', b.scen.length); } },
      'state', { key: 'st', label: 'State', render: r => stateCell('deviations', r, ws) }],
    actions: r => r.exception ? [] : [el('button', { class: 'btn sm ghost', onclick: () => requestException(ws, r, redraw) }, 'Request exception')] }));
  const drift = (ws.assets || []).filter(a => a.baseline?.status === 'drift' && a.lifecycle?.stage !== 'disposed' && !R.deviations.some(d => d.asset === a.id && d.state !== 'closed'));
  body.append(card({ id: 'ipc-drift' }, el('h2', { style: { marginTop: 0 } }, tr('Assets in drift without a deviation ({0})').replace('{0}', drift.length)),
    drift.length ? table([{ key: 'a', label: 'Asset', render: a => el('span', { 'data-noi18n': '' }, `${a.id} ${a.name}`) }, { key: 'b', label: 'Baseline', render: a => el('span', { 'data-noi18n': '' }, a.baseline.name || '—') },
      { key: 'r', label: '', sortable: false, render: a => el('button', { class: 'btn xs', onclick: () => {
        const bl = R.baselines.find(b => b.name === a.baseline.name || b.id === a.baseline.ref?.id);
        R.deviations.push({ ...IPC.blankRow('deviations'), id: IPC.nextIdReg(R.deviations, 'DV'), baseline: bl?.id || '', version: a.baseline.ref?.v || '', asset: a.id, count: 1, opened: a.baseline.checked || today(),
          lastSeen: a.baseline.checked || '', owner: a.owner || '', source: 'Information assets', note: a.baseline.deviations || '' });
        touch(); redraw();
      } }, 'Record deviation') }], drift, { class: 'compact' }) : el('div', 'empty-state', tr('Every asset in drift has a deviation.'))));
}

/* ---------------- configuration changes ---------------- */
function changes(body, redraw, ws) {
  const R = IPC.reg(ws);
  if (!R.changes.length) body.append(banner('warn', MK.INFO_GAP, 'No configuration change is recorded yet.'));
  body.append(el('p', 'note', 'A row is one change (count 1, with its ticket) or an aggregate for a period (YYYY-Qn or YYYY-MM).'));
  body.append(ipcRegister(ws, 'changes', { title: 'Configuration changes', redraw,
    fields: [{ key: 'period', label: 'Period (YYYY-Qn or YYYY-MM)', type: 'text' }, { key: 'type', label: 'Type', type: 'select', options: IPC.CH_TYPES }, { key: 'scope', label: 'Scope', type: 'text' },
      count('count', 'Changes'), count('verified', 'Verified'), { key: 'ticket', label: 'Ticket', type: 'text' }, ...tail(ws)],
    columns: ['id', 'period', 'type', { key: 'scope', label: 'Scope', render: r => el('span', { 'data-noi18n': '' }, r.scope || '—') }, { key: 'count', label: 'Changes', render: r => c(r.count) },
      { key: 'verified', label: 'Verified', render: r => c(r.verified) }, { key: 'st', label: 'State', render: r => stateCell('changes', r, ws) }] }));
}

export const TABS = { baselines, deviations, changes };
