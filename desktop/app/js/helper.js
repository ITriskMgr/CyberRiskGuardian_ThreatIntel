/* helper.js — client of the local download helper (serve.py) and the shared settings (1.4.0).
   Settings live in one place: crg-config.json in the feeds folder when the helper runs (so the Claude
   scheduled task reads the same file), mirrored in the browser so the app works without the helper.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';

const H = { 'X-CRG': '1' };
export const HS = { helper: undefined, config: null, keys: [], sources: [], catalogue: [], feedsDir: '', ai: null };

export async function api(path, opts = {}) {
  const r = await fetch(path, Object.assign({ headers: Object.assign({ 'Content-Type': 'application/json' }, H), cache: 'no-store' }, opts));
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r;
}
export const apiJson = async (path, opts) => (await api(path, opts)).json();
export const post = (path, body) => apiJson(path, { method: 'POST', body: JSON.stringify(body || {}) });

export async function probe(force = false) {
  if (HS.helper !== undefined && !force) return HS.helper;
  try { HS.helper = await apiJson('/api/helper'); HS.ai = HS.helper?.ai || null; } catch { HS.helper = null; HS.ai = null; }
  return HS.helper;
}

/* ---------------- defaults (mirror of crg_feeds.DEFAULT_CONFIG) ---------------- */
/* The shared folders are yours, not the author's (1.5.6). They ship empty: an empty link means "not
   set yet", the screens say so and offer the way to set it, and Settings → Links & shared folders is
   where each person puts their own. Until 1.5.5 the package carried the author's own Drive folders as
   defaults, so every copy pointed at them — harmless to open, wrong to ship. The public endpoints
   below are not personal and keep their defaults. */
export const DEFAULT_LINKS = {
  drive_feeds: '',
  drive_registry: '',
  registry_local_dir: '', drive_feeds_local_dir: '',
  controls_list: '',
  nvd_api: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
  kev: 'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json',
  epss: 'https://epss.empiricalsecurity.com/epss_scores-{date}.csv.gz',
  attack_navigator: 'https://mitre-attack.github.io/attack-navigator/',
  plugin_repo: 'https://github.com/ITriskMgr/CyberRiskGuardian',
};
/** What a link should look like, shown as the placeholder of an empty field. Never a real folder. */
export const LINK_EXAMPLE = {
  drive_feeds: 'https://drive.google.com/drive/folders/…',
  drive_registry: 'https://drive.google.com/drive/folders/…',
  registry_local_dir: '~/Library/CloudStorage/GoogleDrive-…/My Drive/CRG registry',
  drive_feeds_local_dir: '~/Library/CloudStorage/GoogleDrive-…/My Drive/CRG feeds',
  controls_list: 'https://docs.google.com/spreadsheets/d/…',
};
/** The links a person has to provide themselves; the rest are public endpoints with sane defaults. */
export const LINK_YOURS = ['drive_feeds', 'drive_registry', 'registry_local_dir', 'drive_feeds_local_dir', 'controls_list'];
export const LINK_LABEL = {
  drive_feeds: ['Google Drive — Feeds folder (yours)', 'A folder in your own Drive where the scheduled task copies the feed digest and the summaries it writes. Optional: leave it empty and nothing is uploaded.'],
  drive_registry: ['Google Drive — Risk registry folder (yours)', 'A folder in your own Drive where you share published, anonymized risk and scenario registries. Optional: Publish downloads the file anyway.'],
  registry_local_dir: ['Local folder synced with the registry (optional)', 'A Google Drive for desktop path, e.g. ~/Library/CloudStorage/GoogleDrive-…/My Drive/Registry. When set, Publish writes there directly; otherwise packages wait in the outbox and the scheduled task uploads them.'],
  drive_feeds_local_dir: ['Local folder synced with the Feeds folder (optional)', 'Google Drive for desktop path of the Feeds folder, for reference by the scheduled task.'],
  controls_list: ['Controls list (Google Sheets, yours)', 'Your own control list, if you keep one. The catalogues bundled with the application do not need it.'],
  nvd_api: ['NVD CVE API 2.0', 'Used by Vulnerabilities → Online sources.'],
  kev: ['CISA KEV catalogue', 'Used by Online sources and the snapshot generator.'],
  epss: ['FIRST EPSS daily file', '{date} is replaced by the score date.'],
  attack_navigator: ['ATT&CK Navigator', 'Opens exported layers.'],
  plugin_repo: ['CyberRiskGuardian plugin repository', 'Methodology, crg_calc.py and build_workbook.py.'],
};
export const DEFAULT_CONFIG = {
  schema: 'crg-config/1', links: { ...DEFAULT_LINKS },
  social: { query: '(CVE OR ransomware OR zero-day) -is:retweet lang:en', tags: ['cve', 'infosec', 'ransomware'], watch_terms: [] },
  schedule: { paused: false, retention: 14, upload_digest_to_drive: true, upload_outbox_to_drive: true, suggest_sources: true,
    task_name: 'CyberRiskGuardian threat-feed download', task_cadence: 'every 6 hours' },
  sources: {}, custom_sources: [], rejected_suggestions: [],
};
const merge = (a, b) => { const o = JSON.parse(JSON.stringify(a)); for (const [k, v] of Object.entries(b || {})) o[k] = v && typeof v === 'object' && !Array.isArray(v) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? merge(o[k], v) : v; return o; };

/** Load the configuration: from the helper when it runs (authoritative), else the browser copy. */
export async function loadConfig() {
  await probe();
  const local = await store.get('meta', 'settings').catch(() => null);
  if (HS.helper) {
    try {
      const r = await apiJson('/api/config');
      HS.config = merge(DEFAULT_CONFIG, r.config); HS.keys = r.keys || []; HS.sources = r.sources || []; HS.catalogue = r.catalogue || []; HS.feedsDir = r.feeds_dir;
      // first start of 1.4 with the helper: carry links edited offline into the shared file
      if (local?.savedLocal && (!r.config.saved || local.savedLocal > r.config.saved)) { HS.config = merge(HS.config, { links: local.links, social: local.social }); await saveConfig(); }
      await store.put('meta', 'settings', HS.config);
      return HS.config;
    } catch (e) { console.warn('config from helper failed', e); }
  }
  HS.config = merge(DEFAULT_CONFIG, local || {});
  HS.sources = []; // catalogue known only through the helper; the Settings screen shows the bundled copy
  return HS.config;
}
export async function saveConfig() {
  HS.config.savedLocal = new Date().toISOString().slice(0, 19);
  await store.put('meta', 'settings', HS.config);
  if (HS.helper) {
    const r = await post('/api/config', { config: HS.config });
    HS.config = merge(DEFAULT_CONFIG, r.config); HS.sources = r.sources || HS.sources;
  }
  return HS.config;
}
export const link = k => HS.config?.links?.[k] || DEFAULT_LINKS[k] || '';
export async function setKey(name, value) {
  if (!HS.helper) throw new Error('The helper is not running — keys are stored by the helper only.');
  HS.keys = (await post('/api/keys', { name, value })).keys;
  return HS.keys;
}
export const driveId = url => (/folders\/([A-Za-z0-9_-]+)/.exec(url || '') || [])[1] || '';
