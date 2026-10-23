/* updateui.js — what the person sees of the update check (1.8.0): the question asked once at first start,
   the banner when a newer release exists, and the card of Help → About → Versions. Rules in updates.js.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { el, banner, card, toast } from './util.js';
import { tr } from './i18n.js';
import * as UP from './updates.js';
import { VERSION } from './version.js';

const host = () => document.getElementById('engine-banner');

/** The result of a check, as a banner (or a short note when there is nothing to show). */
export function resultView(r, { compact = false } = {}) {
  if (!r) return el('p', 'small muted', 'Not checked yet.');
  if (r.status === 'ok' && r.newer) {
    const out = el('div', { class: 'update-banner', id: 'update-banner' });
    const msg = el('div', 'small');
    const dl = el('button', { class: 'btn sm', id: 'update-download', disabled: !r.asset }, 'Download');
    dl.addEventListener('click', async () => {
      dl.disabled = true; msg.textContent = tr('Downloading…');
      try {
        const job = await UP.download();
        const end = await UP.waitJob(job.id, j => { msg.textContent = j.message || ''; });
        msg.textContent = end?.status === 'done' ? tr('Saved in the feeds folder: {0}. Follow the steps below to upgrade.').replace('{0}', end.file) : (end?.message || tr('The download did not finish.'));
        if (end?.status !== 'done') dl.disabled = false;
      } catch (e) { msg.textContent = String(e.message || e); dl.disabled = false; }
    });
    out.append(banner('good', tr('Version {0} is available').replace('{0}', r.latest),
      el('div', null, el('div', null, tr('You are running {0}.').replace('{0}', VERSION), ' ', r.published ? tr('Published {0}.').replace('{0}', String(r.published).slice(0, 10)) : '', r.prerelease ? ' ' + tr('Pre-release.') : ''),
        el('div', 'btnrow', { style: { marginTop: '6px' } }, el('a', { class: 'btn sm ghost', href: r.notes_url || UP.RELEASES, target: '_blank', rel: 'noopener noreferrer', id: 'update-notes' }, 'Release notes'), dl,
          !r.asset ? el('span', 'small muted', 'This release has no ZIP file attached: download it from the release page.') : null),
        msg,
        compact ? null : el('details', null, el('summary', { class: 'small' }, 'How to upgrade'), el('ol', 'small', ...UP.STEPS.map(s => el('li', null, s)))))));
    return out;
  }
  const text = r.status === 'ok' ? tr('You are running the latest release ({0}).').replace('{0}', r.latest)
    : tr(r.message || r.status) + (r.retry ? ' (' + tr('after {0}').replace('{0}', String(r.retry).replace('T', ' ')) + ')' : '') + (r.code ? ` (${r.code})` : '');
  return el('p', { class: 'small ' + (r.status === 'ok' ? '' : 'muted'), id: 'update-result' }, text, r.checked ? ' · ' + tr('checked {0}').replace('{0}', String(r.checked).replace('T', ' ').slice(0, 16)) : '');
}

/** At start-up: ask once; when switched on, check and show the banner only if a newer release exists. */
export async function startup() {
  const h = host(); if (!h) return;
  if (!UP.asked()) {
    const box = el('div', { id: 'update-ask' });
    box.append(banner('warn', 'Check for updates at start-up?',
      el('div', null, el('div', null, 'The local helper can ask GitHub, once at each start, whether a newer release of CyberRiskGuardian Desktop exists. Nothing about you or your workspaces is sent, and nothing is installed: you decide whether to download it. You can change this in Help → About → Versions.'),
        el('div', 'btnrow', { style: { marginTop: '6px' } },
          el('button', { class: 'btn sm', id: 'update-yes', onclick: async () => { UP.setEnabled(true); box.remove(); run(); } }, 'Yes, check at start-up'),
          el('button', { class: 'btn sm ghost', id: 'update-no', onclick: () => { UP.setEnabled(false); box.remove(); toast('No update check at start-up'); } }, 'No')))));
    h.append(box);
    return;
  }
  if (UP.enabled()) run();
}
async function run() {
  const r = await UP.check();
  if (r.status === 'ok' && r.newer) host()?.append(resultView(r, { compact: false }));
}

/** The card of Help → About → Versions. */
export function versionsCard() {
  const res = el('div'); res.append(resultView(UP.last()));
  const cb = el('input', { type: 'checkbox', checked: UP.enabled(), id: 'update-setting', style: { width: 'auto' } });
  cb.addEventListener('change', () => { UP.setEnabled(cb.checked); toast(cb.checked ? 'The update check runs at each start' : 'No update check at start-up'); });
  const now = el('button', { class: 'btn', id: 'update-check-now' }, 'Check now');
  now.addEventListener('click', async () => { now.disabled = true; res.replaceChildren(el('p', 'small muted', tr('Checking…'))); const r = await UP.check(); res.replaceChildren(resultView(r)); now.disabled = false; });
  return card(el('h2', { style: { marginTop: 0 } }, 'Updates'),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' } }, cb, 'Check for updates at start-up'),
    el('p', 'small muted', 'Off unless you switch it on. The local helper asks the GitHub releases of the application (github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel) for the latest release; no data is sent and nothing is installed.'),
    el('div', 'btnrow', now), res);
}
