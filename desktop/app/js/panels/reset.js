/* Reset data (1.5.6) — starting over, at the level the person is entitled to choose.

   Two audiences on one screen, deliberately separated.

   “Start over” is for a student working a teaching case. It needs no administrator: resetting your own
   exercise is not an administrative act. It is offered only for a teaching case, because only a
   teaching case has a starting point to go back to. Confirmation happens in a window of its own (see
   help/reset-confirm.html) rather than a one-line confirm() box, and in multi-user mode it asks for an
   administrator's PIN, so a classroom can decide that students do not reset unsupervised.

   “Reset or delete” is for an administrator and covers real organizations: four depths from clearing
   the assessment to emptying the workspace, the deletion of a whole workspace, and the options that
   decide the fate of the safeguards inventory, the maturity assessment, the threat snapshot and the
   stored API keys. Keys are kept unless explicitly unticked.

   Nothing on this screen calculates anything, and nothing here touches another workspace.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, banner, kpi, toast, go } from '../util.js';
import { S, remove, refreshList } from '../state.js';
import * as RESET from '../reset.js';
import * as users from '../users.js';
import { HS, probe, loadConfig, setKey } from '../helper.js';
import { tr } from '../i18n.js';

let view = 'start';
let chosen = 'assessment';
let opts = { ...RESET.DEFAULT_OPTS };
let sp = null;                                    // the starting point of this teaching case

/** Administrative rights: in single-user mode there is one person and they hold every right. */
const isAdmin = () => !users.active() || !!users.me()?.admin;
/** A PIN is asked for only when multi-user mode is on and an administrator has set one. */
const pinWanted = () => users.active() && (users.U.users || []).some(u => u.admin && u.pinHash);

export async function render(sec, arg) {
  if (arg && ['start', 'admin', 'about'].includes(arg)) view = arg;
  const ws = S.ws;
  sp = await RESET.startingPoint(ws).catch(() => ({ available: false, why: 'none-recorded' }));
  /* The stored keys come from the helper's configuration, not from the probe. Without this the page
     would show "0 keys" and the delete-the-keys option would quietly have nothing to delete. */
  if (HS.helper === undefined || (HS.helper && !HS.config)) loadConfig().then(() => render(sec, arg)).catch(() => {});

  sec.replaceChildren(el('h1', null, 'Reset data'),
    el('p', 'lede', 'Start a teaching case over, or — as an administrator — reset or delete a workspace. Every action on this screen is permanent: there is no undo and no trash. Export first if there is any chance you will want what is there.'));

  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['start', 'Start over'], ['admin', 'Reset or delete'], ['about', 'What each level means']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ start, admin, about }[view])(body, sec);
}

/* ---------------- the confirmation window ---------------- */

/** Ask in a window of its own, then run `work` if the person confirmed (and the PIN checks out).
    Resolves when the window is answered or closed; the window reports the result itself. */
function confirmInWindow(payload, work) {
  const w = window.open('help/reset-confirm.html', 'crg-reset-confirm', 'popup=yes,width=660,height=760');
  if (!w) {
    toast('Allow pop-up windows for this app: the confirmation opens in its own window', 'bad');
    return;
  }
  const token = 'r' + Math.random().toString(36).slice(2);
  const send = (type, extra) => { try { w.postMessage({ type, ...extra }, location.origin); } catch { /* window gone */ } };

  const onMsg = async ev => {
    if (ev.origin !== location.origin || ev.source !== w) return;
    const d = ev.data || {};
    if (d.type === 'crg-reset-ready') { send('crg-reset-request', { payload: { ...payload, token } }); return; }
    if (d.type !== 'crg-reset-answer') return;
    if (!d.ok) { window.removeEventListener('message', onMsg); return; }

    if (payload.requirePin) {
      const admins = (users.U.users || []).filter(u => u.admin && u.pinHash);
      let good = false;
      for (const a of admins) if (await users.hashPin(d.pin || '', a.salt) === a.pinHash) { good = true; break; }
      if (!good) { send('crg-reset-result', { ok: false, retry: true, message: tr('That PIN does not match any administrator of this installation. Nothing was changed.') }); return; }
    }
    window.removeEventListener('message', onMsg);
    try {
      const message = await work();
      send('crg-reset-result', { ok: true, message });
    } catch (err) {
      send('crg-reset-result', { ok: false, message: String(err.message || err) });
    }
  };
  window.addEventListener('message', onMsg);
}

/* ---------------- start over (teaching cases) ---------------- */

function start(body, sec) {
  const ws = S.ws;

  if (!RESET.isTeaching(ws)) {
    body.append(banner('warn', 'This workspace is a real organization',
      `“${ws.name}” is not a teaching case, so there is no starting point to go back to and this reset is not offered. ` +
      'An administrator can clear it at a chosen depth under “Reset or delete”. To make a workspace a teaching case, set its type to a classroom business case in Organization → Workspaces.'));
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Why this is restricted'),
      el('p', null, 'Starting a case over rebuilds a known state. A teaching case has one: the state it was handed out in. A real assessment has no such state — the work is the only copy — so the same button would be a way to destroy it by accident. For a real organization the choice has to be explicit about depth, which is what the other tab does.')));
    return;
  }

  const c = RESET.contents(ws);
  body.append(el('div', 'grid g4',
    kpi('Case', ws.name, ws.kind === 'example' ? 'bundled teaching example' : 'classroom case'),
    kpi('Starting point', sp.available ? (sp.source === 'bundled' ? 'the shipped case' : 'recorded ' + String(sp.captured || '').slice(0, 10)) : 'none recorded',
      sp.available ? 'this is where “start over” goes' : 'nothing to go back to', sp.available ? 'good' : 'warn'),
    kpi('Your work in this case', `${c.scenarios} scen. · ${c.measures} meas.`, `${c.risks} risks · ${c.kriReadings} KRI readings`),
    kpi('Confirmation', pinWanted() ? 'typed word + PIN' : 'typed word', pinWanted() ? 'an administrator PIN is required' : 'in a window of its own')));

  if (!sp.available) {
    body.append(banner('warn', 'No starting point has been recorded',
      'This case was built here rather than imported from a file, so nothing has been stored as its starting state. ' +
      (isAdmin() ? 'Set it below once the case is ready to hand out; after that, start over puts the case back to exactly that state.'
                 : 'Ask the person who set up the case to record one, or restore the case from the file it was handed out in.')));
  }

  const go1 = el('button', { class: 'btn danger', disabled: !sp.available, onclick: () => {
    const lines = RESET.preview('clean', ws).concat(sp.source === 'bundled'
      ? ['every change you made to the organization profile, the crown jewels and the appetite']
      : ['every change made since the starting point was recorded']);
    confirmInWindow({
      title: tr('Start this case over?'),
      workspace: ws.name,
      action: tr('Start over'),
      phrase: tr('START OVER'),
      requirePin: pinWanted(),
      pinLabel: tr('Instructor or administrator PIN'),
      what: tr('The case goes back to its starting point. Everything you have done in it is removed.'),
      linesTitle: tr('This will remove:'),
      lines,
      keeps: [tr('the name you gave this workspace'), tr('every other workspace on this computer'),
        tr('your settings, the framework catalogues and the stored API keys')],
      advice: tr('If you want to keep a copy of your work, cancel and export the workspace first: Organization → Workspaces → Export.'),
    }, async () => {
      const r = await RESET.restoreTeaching(ws.id);
      render(sec);
      toast('The case is back to its starting point', 'good');
      return tr('“{0}” is back to its starting point. You can begin the exercise again.').replace('{0}', r.name);
    });
  } }, 'Start this case over…');

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Start this case over'),
    el('p', null, sp.source === 'bundled'
      ? 'This is the teaching example that ships with the application. Starting over rebuilds it exactly as delivered — all its scenarios, its organization profile and its figures — and removes everything you have added or changed in it.'
      : 'Starting over puts this case back to the state it was handed out in, including its documents. Everything you have added or changed is removed.'),
    el('p', 'note', 'Only this workspace is affected. Other workspaces, your settings and the stored API keys are untouched.'),
    el('div', 'row', go1,
      el('button', { class: 'btn ghost', onclick: () => go('org/workspaces') }, 'Export this case first'))));

  if (isAdmin()) {
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'For the instructor'),
      el('p', null, 'The starting point is what “start over” goes back to. Record it once the case is ready to hand out — with its documents, its profile and whatever scenarios the exercise starts from. Recording it again replaces it, which moves the starting point for everyone using this copy.'),
      el('div', 'row',
        el('button', { class: 'btn', onclick: async () => {
          if (!confirm(tr('Record the current state of this case as the starting point that “start over” goes back to?'))) return;
          const r = await RESET.captureBaseline(S.ws);
          users.audit('teaching starting point recorded', S.ws.name, S.ws);
          toast(`Starting point recorded (${r.docs} document(s))`, 'good');
          render(sec);
        } }, sp.available && sp.source === 'baseline' ? 'Replace the starting point with the current state' : 'Set the current state as the starting point'),
        sp.available && sp.source === 'baseline' ? el('button', { class: 'btn ghost danger', onclick: async () => {
          if (!confirm(tr('Forget the recorded starting point? Students will no longer be able to start this case over.'))) return;
          await RESET.forgetBaseline(S.ws.id);
          users.audit('teaching starting point forgotten', S.ws.name, S.ws);
          toast('Starting point forgotten');
          render(sec);
        } }, 'Forget it') : null),
      pinWanted()
        ? el('p', 'small muted', 'Multi-user mode is on and at least one administrator has a PIN, so a student must enter an administrator PIN to start the case over.')
        : el('p', 'small muted', users.active()
          ? 'Multi-user mode is on but no administrator has set a PIN, so no PIN can be asked for. Set one in Settings → Users & RACI to supervise resets.'
          : 'In single-user mode any user of this computer can start the case over. Turn on multi-user mode in Settings → Users & RACI and give an administrator a PIN to require one.')));
  }
}

/* ---------------- reset or delete (administrators) ---------------- */

function admin(body, sec) {
  const ws = S.ws;

  if (!isAdmin()) {
    body.append(banner('bad', 'Administrators only',
      'Resetting or deleting a workspace is an administrative action. Your account is not an administrator of this installation, so this section is not available. ' +
      (RESET.isTeaching(ws) ? 'You can still start this teaching case over under “Start over”.' : 'Ask an administrator.')));
    return;
  }

  body.append(el('div', 'grid g4',
    kpi('Workspace', ws.name, ws.org?.name && ws.org.name !== ws.name ? ws.org.name : { example: 'teaching example', classroom: 'classroom case', organization: 'real organization' }[ws.kind] || ws.kind),
    kpi('Workspaces on this computer', String(S.list.length), S.list.length === 1 ? 'deleting the last one brings back the example' : 'only the one above is affected'),
    kpi('Stored API keys', HS.helper ? String(HS.keys.length) : 'helper not running', opts.keepKeys ? 'kept by this reset' : 'deleted by this reset', opts.keepKeys ? 'good' : 'bad'),
    kpi('Chosen level', RESET.scope(chosen)?.label || '—', 'nothing happens until you confirm')));

  /* --- the four levels --- */
  const levels = el('div');
  for (const sc of RESET.SCOPES) {
    const id = 'rs-' + sc.id;
    const r = el('input', { type: 'radio', name: 'crg-reset-scope', id, checked: chosen === sc.id, style: { width: 'auto' } });
    r.addEventListener('change', () => { chosen = sc.id; render(sec); });
    levels.append(el('div', 'opt',
      el('div', 'row', { style: { alignItems: 'baseline' } }, r, el('label', { for: id }, el('b', null, sc.label))),
      el('div', 'small muted', { style: { marginLeft: '26px' } }, sc.what)));
  }

  /* --- the options that apply on top --- */
  const box = (key, label, hint) => {
    const c = el('input', { type: 'checkbox', checked: !!opts[key], style: { width: 'auto' } });
    c.addEventListener('change', () => { opts[key] = c.checked; render(sec); });
    return el('div', 'opt', el('div', 'row', { style: { alignItems: 'baseline' } }, c, el('div', null, el('b', null, label), el('div', 'small muted', hint))));
  };
  const lines = RESET.preview(chosen, ws, opts);
  const previewCard = card(el('h2', { style: { marginTop: 0 } }, 'What this would remove'),
    lines.length ? el('ul', null, ...lines.map(l => el('li', null, l)))
      : el('p', 'note', 'There is nothing of that kind in this workspace, so this reset would change nothing.'),
    el('p', 'small muted', 'Counted from this workspace as it stands now. Anything not listed here stays.'));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Reset this workspace'),
    el('p', null, 'Choose how deep the reset goes. The levels are cumulative: each one removes everything the one above it removes, and more.'),
    levels,
    el('h3', null, 'Also clear'),
    box('clearSafeguards', 'The safeguards inventory', 'What already protects the organization — technical measures, processes, controls, awareness programmes. Describes the organization, so it is kept by default.'),
    box('clearMaturity', 'The maturity and resilience assessment', 'The CSF 2.0 scores, the questionnaire and the recorded history. Also describes the organization, so it is kept by default.'),
    box('clearSnapshot', 'The threat-context snapshot', 'The dated KEV/EPSS evidence loaded for this workspace. A new one can be loaded at any time.'),
    el('h3', null, 'Keep'),
    box('keepInstallation', 'The example snapshot, the framework catalogues and the AI settings',
      'These belong to the installation, not to a workspace, and are shared by every workspace. Untick to put them back to the state of a fresh installation as well.'),
    box('keepKeys', 'The stored API keys',
      HS.helper ? `${HS.keys.length} key(s) held by the helper in crg-keys.json. Untick to delete them with this reset — you would have to paste them again.`
                : 'The helper is not running, so no key can be read or deleted right now.'),
    previewCard,
    el('div', 'row',
      el('button', { class: 'btn danger', onclick: () => resetNow(sec) }, 'Reset this workspace…'),
      el('button', { class: 'btn ghost', onclick: () => { opts = { ...RESET.DEFAULT_OPTS }; chosen = 'assessment'; render(sec); } }, 'Back to the safe defaults'))));

  /* --- deleting a workspace outright --- */
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Delete a workspace completely'),
    el('p', null, 'Deleting removes the workspace itself — its documents, their extracted text, its threat snapshot and its history — from this browser\'s storage. It is permanent: no undo and no trash. Export it first if you may need it.'),
    el('p', 'note', S.list.length === 1
      ? 'This is the only workspace on this computer. Deleting it brings back the MediBec teaching example, so you are never left with none.'
      : 'Every workspace is listed on Organization → Workspaces, each row with Open, Export and Delete. The button below deletes the one you are in.'),
    el('div', 'row',
      el('button', { class: 'btn danger', onclick: () => deleteNow(sec) }, `Delete “${ws.name}”…`),
      el('button', { class: 'btn ghost', onclick: () => go('org/workspaces') }, 'All workspaces on this computer'))));

  /* --- the way back to a known good state --- */
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Going back to a known good state'),
    el('p', null, 'A reset is not a way back: it removes, it does not restore. To return to a state you know was right, restore a backup taken earlier — Backup & restore → choose the file → “Replace everything — this installation ends up holding exactly what the file holds”. It tells you how many workspaces it would delete before you confirm.'),
    el('div', 'row',
      el('button', { class: 'btn', onclick: () => go('backup') }, 'Backup & restore'),
      el('button', { class: 'btn ghost', onclick: () => go('org/workspaces') }, 'Export this workspace'))));
}

function resetNow(sec) {
  const ws = S.ws;
  const sc = RESET.scope(chosen);
  confirmInWindow({
    title: tr('Reset this workspace?'),
    workspace: ws.name + (ws.org?.name && ws.org.name !== ws.name ? ' — ' + ws.org.name : ''),
    action: tr('Reset'),
    phrase: tr('RESET'),
    requirePin: pinWanted(),
    pinLabel: tr('Administrator PIN'),
    what: tr(sc.label) + ' — ' + tr(sc.what),
    linesTitle: tr('This will remove:'),
    lines: RESET.preview(chosen, ws, opts),
    keeps: [
      ...(RESET.keepsGroup(chosen, 'ORGANIZATION') ? [tr('the organization profile, the appetite, the crown jewels and the budget')] : []),
      ...(RESET.keepsGroup(chosen, 'DOCUMENTS') ? [tr('the context documents and their extracted text')] : []),
      ...(RESET.keepsGroup(chosen, 'CONTEXT') && !opts.clearSafeguards ? [tr('the information assets, the safeguards inventory and the maturity assessment')] : []),
      ...(opts.keepKeys ? [tr('the stored API keys')] : []),
      ...(opts.keepInstallation ? [tr('the framework catalogues, the bundled example snapshot and the AI settings')] : []),
      tr('every other workspace on this computer'),
    ],
    advice: tr('A reset cannot be undone. Cancel and export the workspace first if you may want what is there.'),
  }, async () => {
    const out = await RESET.run(ws.id, chosen, opts);
    const extra = [];
    if (!opts.keepKeys) extra.push(await dropKeys());
    if (!opts.keepInstallation) extra.push(await resetInstallation());
    users.audit('workspace reset', `${ws.name} — ${out.label}`, S.ws);
    render(sec);
    toast('Workspace reset: ' + out.label, 'good');
    return tr('“{0}” was reset: {1}.').replace('{0}', ws.name).replace('{1}', out.label.toLowerCase())
      + (extra.filter(Boolean).length ? ' ' + extra.filter(Boolean).join(' ') : '');
  });
}

function deleteNow(sec) {
  const ws = S.ws;
  confirmInWindow({
    title: tr('Delete this workspace?'),
    workspace: ws.name,
    action: tr('Delete'),
    phrase: tr('DELETE'),
    requirePin: pinWanted(),
    pinLabel: tr('Administrator PIN'),
    what: tr('The whole workspace goes: there is no undo and no trash.'),
    linesTitle: tr('This will remove:'),
    lines: [
      tr('the workspace “{0}” itself').replace('{0}', ws.name),
      ...RESET.preview('organization', ws, opts),
      ...(S.list.length === 1 ? [tr('— and because it is the last one, the MediBec teaching example is created in its place')] : []),
    ],
    keeps: [tr('every other workspace on this computer'), tr('your settings, the framework catalogues and the stored API keys')],
    advice: tr('Export it first if there is any chance you will want it: Organization → Workspaces → Export.'),
  }, async () => {
    const name = ws.name;
    await remove(ws.id);
    await refreshList();
    users.audit('workspace deleted', name, S.ws);
    render(sec);
    toast('Workspace deleted: ' + name);
    return tr('“{0}” was deleted. You are now in “{1}”.').replace('{0}', name).replace('{1}', S.ws?.name || '—');
  });
}

/** Delete every key the helper holds. Only reached when the person unticked “keep the API keys”. */
async function dropKeys() {
  if (!HS.helper) return tr('The helper was not running, so no API key could be deleted.');
  await loadConfig();                              // the list has to be the helper's, not a stale copy
  const names = [...HS.keys];
  if (!names.length) return tr('There was no stored API key to delete.');
  for (const n of names) { try { await setKey(n, ''); } catch { /* reported below */ } }
  await loadConfig();
  return HS.keys.length
    ? tr('{0} API key(s) could not be deleted.').replace('{0}', String(HS.keys.length))
    : tr('{0} stored API key(s) were deleted.').replace('{0}', String(names.length));
}

/** Put the installation-level things back to a fresh installation: the imported framework catalogues,
    the AI settings and the loaded example snapshot. Workspaces are not touched here. */
async function resetInstallation() {
  const out = [];
  try {
    const FW = await import('../frameworks.js');
    const store = await import('../store.js');
    await store.del('meta', 'frameworks');
    FW.reset(); await FW.load();
    out.push(tr('The framework catalogues are back to the bundled set.'));
  } catch { out.push(tr('The framework catalogues could not be reset.')); }
  if (HS.helper) {
    try {
      const { DEFAULT_CONFIG, saveConfig } = await import('../helper.js');
      HS.config.ai = JSON.parse(JSON.stringify(DEFAULT_CONFIG.ai || {}));
      await saveConfig(); await probe(true);
      out.push(tr('The AI settings are back to their defaults.'));
    } catch { out.push(tr('The AI settings could not be reset.')); }
  }
  return out.join(' ');
}

/* ---------------- what each level means ---------------- */

function about(body) {
  const rows = RESET.SCOPES.map(sc => el('tr',
    el('td', null, el('b', null, sc.label)),
    el('td', 'small', sc.what),
    el('td', 'small mono', RESET.cleared(sc.id).length + ' fields')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'The four levels'),
    el('table', 'compact',
      el('thead', el('tr', el('th', null, 'Level'), el('th', null, 'What it does'), el('th', null, 'Cleared'))),
      el('tbody', ...rows)),
    el('p', 'small muted', 'A level is written as what it keeps, not as what it deletes. A field added to the workspace model in a later version is therefore cleared by a reset rather than quietly surviving one — the safe direction for an action that cannot be undone.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What lives where'),
    el('p', null, 'Three different places hold what you have, and a reset of one does not touch the others.'),
    el('ul', null,
      el('li', null, el('b', null, 'In the workspace: '), 'the organization profile, the appetite, the crown jewels, the documents and their extracted text, the information assets, the safeguards inventory, the maturity assessment, the vulnerability register, the threat snapshot, the scenarios, the measures, the risks, the recommendations and the KRI history. This is what the levels above clear.'),
      el('li', null, el('b', null, 'With the installation: '), 'the framework catalogues you imported, the bundled example snapshot, the AI settings, the interface language, the users and their rights. Shared by every workspace; kept unless you untick “Keep the example snapshot, the framework catalogues and the AI settings”.'),
      el('li', null, el('b', null, 'With the helper: '), 'the API keys, in crg-keys.json in the feeds folder, readable by your user only. Never in a workspace, an export or a backup. Kept unless you untick “Keep the stored API keys”, and removable one at a time in Settings → AI — local & remote and Settings → Feed sources & keys.')),
    el('p', 'note', 'Workspaces live in this browser\'s storage for one address and port. If you ever start the app on a different port, the list looks empty — the workspaces are still there under the address you used before.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Teaching cases'),
    el('p', null, 'A teaching case — the bundled MediBec example, or any workspace whose type is a classroom business case — can be put back to its starting point by anyone, without an administrator, as often as needed. That is what a teaching case is for.'),
    el('ul', null,
      el('li', null, 'The bundled example rebuilds from the case shipped with the application.'),
      el('li', null, 'A classroom case imported from a file uses the state in that file, recorded the moment it was imported.'),
      el('li', null, 'A classroom case built here has no starting point until an instructor records one.'),
      el('li', null, 'Recording a starting point again moves it for everyone using this copy of the app.')),
    el('p', 'small muted', 'Confirmation always happens in a window of its own, with the word typed out. In multi-user mode, if an administrator has a PIN, that PIN is required — so a class can decide that students do not reset unsupervised.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'This is a proof of concept'),
    el('p', null, 'Rights in this edition organize who does what and record who did it. They are not a security boundary: anyone with access to this computer and the browser\'s developer tools can bypass them. Treat the administrator distinction here as a guard against mistakes, not against intent.'),
    el('p', 'small muted', 'Recorded resets of this workspace: ' + ((S.ws.resetLog || []).length || 'none') +
      ((S.ws.resetLog || [])[0] ? ` · last on ${S.ws.resetLog[0].date} (${S.ws.resetLog[0].label})` : ''))));
}
