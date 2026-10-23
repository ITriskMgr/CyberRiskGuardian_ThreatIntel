/* updates.js — the opt-in update check (1.8.0).

   Off by default. At first start the application asks once whether to check for updates at start-up;
   the answer is a preference of this installation (prefs: updateCheck, updateAsked). "Check now" under
   Help → About → Versions works whatever the setting. The check is made by the local helper (serve.py,
   GET /api/update/check) against one fixed address — the GitHub "latest release" API of the repository
   that publishes the desktop — and sends nothing: no workspace data, no identifier, no version in the
   request. When a newer release exists, a banner says "Version x.y.z is available" with a link to its
   release notes and a Download button that saves the release ZIP in the feeds folder, like the feeds.
   Nothing is ever installed or unpacked: the upgrade is guided (backup → new folder → restart).
   Without the helper, without network, with no release or when GitHub rate-limits the request, the
   check says so and changes nothing.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import * as prefs from './prefs.js';
import { apiJson, post, probe } from './helper.js';
import * as LOG from './logs.js';

export const RELEASES = 'https://github.com/ITriskMgr/CyberRiskGuardian_ThreatIntel/releases';
export const enabled = () => prefs.get('updateCheck') === true;
export const asked = () => prefs.get('updateAsked') === true;
export function setEnabled(on) { prefs.set('updateCheck', !!on); prefs.set('updateAsked', true); LOG.access(on ? 'update check switched on' : 'update check switched off', 'settings'); }
export const last = () => prefs.get('updateLast') || null;

/** Ask the helper. Always resolves: { status: ok|none|offline|rate-limited|error|nohelper, … }. */
export async function check() {
  const h = await probe().catch(() => null);
  if (!h) { const r = { status: 'nohelper', message: 'The local helper is not running: start the application with its launcher to check for updates.' }; prefs.set('updateLast', { ...r, checked: new Date().toISOString().slice(0, 16) }); return r; }
  let r;
  try { r = await apiJson('/api/update/check'); }
  catch (e) { r = { status: 'error', message: String(e.message || e) }; }
  prefs.set('updateLast', r);
  LOG.access('update check', r.status + (r.latest ? ' ' + r.latest : ''));
  return r;
}
/** Start the download of the release ZIP (a helper job, like a feed). */
export async function download() {
  const r = await post('/api/download', { source: 'update', params: {} });
  LOG.data('release download started', r.job?.id || '');
  return r.job;
}
/** Follow a helper job until it ends. */
export async function waitJob(id, onTick = () => {}) {
  for (let i = 0; i < 600; i++) {
    const j = (await apiJson('/api/jobs')).jobs.find(x => x.id === id);
    if (j) { onTick(j); if (!['running', 'queued'].includes(j.status)) return j; }
    await new Promise(res => setTimeout(res, 500));
  }
  return null;
}
/** The guided upgrade, step by step (shown in the banner and in About → Versions). */
export const STEPS = [
  'Back up: Tools → Backup & restore → “Download backup”, and keep the file.',
  'Unpack the downloaded ZIP into a new folder; do not overwrite the folder you are using.',
  'Close this application (Exit), then start the new version with its launcher; it opens your workspaces and migrates them.',
  'Check that the footer reads “engine verified” before you trust any number.',
];
