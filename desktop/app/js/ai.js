/* ai.js — the AI layer (1.5.1 proof of concept; routing policy 1.5.3).

   The one place in this application where anything about a workspace can leave the machine, and the
   rules that govern it:

   1. **The browser never calls a model.** It posts to the local helper, which makes the request. That
      keeps the key out of the page and makes the egress point a single, auditable function.
   2. **Nothing is sent without the analyst seeing it.** Every task builds a payload that the screen
      shows in full, with its size, before anything is transmitted.
   3. **AI proposes; the verified engine calculates.** No AI output changes a stored value. A proposal
      becomes a change only when the analyst accepts it, and the acceptance is logged.
   4. **Confidential workspaces ask every time.** Consent is never remembered for them, and the
      anonymizer is offered on the preview.
   5. Every call is recorded: task, provider, model, date, payload size, and what the analyst did with
      the answer — accepted, edited or rejected.

   6. **One routing policy (1.5.3).** Settings → AI — local & remote decides, per feature, whether a
      request may go to the local model, to the Claude API, or nowhere. The helper applies the same policy
      before it makes any call, so a feature set to "local only" cannot reach api.anthropic.com.

   C1 is unaffected: none of this is in the calculation path.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch, compute, scen } from './state.js';
import * as helper from './helper.js';
import * as anon from './anon.js';
import * as K from './catalog.js';
import * as KRI from './kri.js';
import { today, uid } from './util.js';

/* ---------------- routing policy (1.5.3) ----------------
   Installation-wide, kept in crg-config.json (ai.policy) so the helper — the only component that sends
   anything — enforces it too. Modes per feature: 'workspace' (the provider chosen for the workspace),
   'local' (a model on this machine only), 'remote' (a provider off this machine), 'off'. */
export const FEATURES = [
  // id, label, what it sends, sensitivity, default mode
  ['link_vulns', 'Vulnerability ↔ scenario linking', 'Scenario causal chains and the vulnerability register (CVE identifiers, products, assets, exposure)', 'high', 'local'],
  ['extract_profile', 'Profile extraction', 'Text of the context documents', 'high', 'workspace'],
  ['extract_crown', 'Crown-jewel extraction', 'Text of the context documents and the profile', 'high', 'workspace'],
  ['extract_sensitive', 'Import from documents — assets & BIA, existing controls, incidents, weaknesses', 'Text of the context documents; the answer maps the organization’s systems and exposure', 'high', 'local'],
  ['extract_more', 'Import from documents — third parties, compliance, scenarios, evidence, risks, budget, KRIs, roles, classroom', 'Text of the context documents', 'high', 'workspace'],
  ['scenarios', 'Scenario proposals (Batch scenarios, AI assistant)', 'Organization profile, crown jewels and information assets', 'medium', 'workspace'],
  ['causal_chain', 'Causal chain of one scenario (Scenario editor)', 'The scenario’s name and statement, the organization profile, and the assets and controls already recorded against it', 'high', 'local'],
  ['analyst', 'AI assistant — analyst', 'Profile, included scenarios with their figures, your question', 'medium', 'workspace'],
  ['critique', 'AI assistant — parameter critique', 'Scenarios with their parameters and rationales', 'medium', 'workspace'],
  ['briefing', 'Weekly threat briefing', 'Triaged feed stories matched to this organization', 'medium', 'workspace'],
  ['chat', 'Help chatbot — Ask AI', 'Your question, the screen, help passages, a short workspace summary', 'low', 'workspace'],
];
export const MODES = [['workspace', 'Workspace provider'], ['local', 'Local model only'], ['remote', 'Remote provider'], ['off', 'Off']];
export const DEFAULT_POLICY = { remote_allowed: true, web_search: true, tasks: Object.fromEntries(FEATURES.map(f => [f[0], f[4]])) };

/** The installation's policy, merged over the defaults. */
export function policy() {
  const p = helper.HS.config?.ai?.policy || {};
  return { ...DEFAULT_POLICY, ...p, tasks: { ...DEFAULT_POLICY.tasks, ...(p.tasks || {}) } };
}
/* ---------------- the provider registry, as the helper reports it (1.5.5) ----------------
   The pages must never compare a provider id with 'claude' or 'local': there are now many of both
   kinds, and an installation can add its own. They ask these functions instead, so a provider added
   to the helper's registry — or to crg-config.json as a custom provider — is handled everywhere the
   day it appears. REMOTE_FALLBACK is only the provider a feature routed to "remote" uses when the
   workspace itself is on a local model. */
export const WEB_SEARCH_PROVIDER = 'claude';   // the only provider whose API runs the search for us
const FALLBACK = { claude: { label: 'Claude API (api.anthropic.com)', local: false, protocol: 'anthropic' },
                   local: { label: 'Local model (OpenAI-compatible)', local: true, protocol: 'openai' } };

/** Every provider the helper offers, in display order: remote first, then the ones on this machine. */
export function providers() {
  const info = helper.HS.ai?.providers;
  const src = info && Object.keys(info).length ? info : FALLBACK;
  return Object.entries(src).map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (a.local === b.local ? 0 : a.local ? 1 : -1));
}
export function provider(id) {
  return providers().find(p => p.id === id) || { id, label: id, local: !!FALLBACK[id]?.local, protocol: 'openai' };
}
/** True when a request to this provider cannot leave the machine. The single question that matters. */
export const isLocal = id => !!provider(id).local;
/** The host a request would reach, for a destination label. Derived from the endpoint, never typed. */
export function host(id) {
  if (isLocal(id)) return '';
  const base = helper.HS.ai?.bases?.[id] || '';
  try { return new URL(base).host; } catch { return ''; }
}
/** Short, honest destination for a pill or a KPI: where the text actually goes. */
export function where(id) { return isLocal(id) ? 'this computer' : (host(id) || provider(id).label); }
export const kindOf = id => (isLocal(id) ? 'good' : 'warn');
/** A provider the workspace can use now: its own choice if the helper still offers it. */
export function remoteDefault() {
  const list = providers().filter(p => !p.local);
  return (list.find(p => p.id === WEB_SEARCH_PROVIDER) || list[0] || { id: WEB_SEARCH_PROVIDER }).id;
}
/** The local provider to use when a feature is restricted to this machine. */
export function localDefault() {
  const list = providers().filter(p => p.local);
  return (list.find(p => p.id === 'local') || list[0] || { id: 'local' }).id;
}
export const provider_label = id => provider(id).label;

/** Where a task's request goes for this workspace: {provider, mode, why}. provider null = not allowed. */
/** The feature a task belongs to (1.5.4: the import tasks share two features). */
export const featureOf = task => /^extract_s_/.test(task) ? 'extract_sensitive' : /^extract_m_/.test(task) ? 'extract_more' : task;
export function route(task, ws = S.ws) {
  const P = policy(), mode = P.tasks[featureOf(task)] || 'workspace';
  if (mode === 'off') return { provider: null, mode, why: 'This feature is switched off in Settings → AI — local & remote.' };
  const chosen = settings(ws).provider;
  const provider = mode === 'local' ? (isLocal(chosen) ? chosen : localDefault())
    : mode === 'remote' ? (isLocal(chosen) ? remoteDefault() : chosen) : chosen;
  if (!isLocal(provider) && !P.remote_allowed)
    return { provider: null, mode, why: `Remote AI is switched off in Settings → AI — local & remote, so nothing may go to ${provider_label(provider)}. Set this feature to the local model, or allow remote AI.` };
  return { provider, mode, why: '' };
}

export const MARK = 'Analytical estimate — validation required.';

/* ---------------- per-workspace settings ---------------- */

/**
 * AI is on by default, except where the analyst has marked the workspace confidential — the one case
 * where sending first and asking later would be the wrong default.
 */
export function settings(ws = S.ws) {
  ws.ai = Object.assign({ enabled: true, confidential: false, provider: 'claude', anon: false,
                          acknowledged: '', log: [] }, ws.ai || {});
  // A workspace can name a provider this installation no longer offers (a custom one was removed, a
  // backup came from another machine). Fall back rather than fail every call with "unknown provider".
  if (helper.HS.ai?.providers && !helper.HS.ai.providers[ws.ai.provider]) ws.ai.provider = remoteDefault();
  return ws.ai;
}
export const enabled = (ws = S.ws) => !!settings(ws).enabled;
export const confidential = (ws = S.ws) => !!settings(ws).confidential;
/** A confidential workspace confirms every single call; others confirm once. */
export const needsConsent = (ws = S.ws) => confidential(ws) || !settings(ws).acknowledged;

export function acknowledge(ws = S.ws) {
  const a = settings(ws);
  if (!confidential(ws)) { a.acknowledged = new Date().toISOString(); touch(); }
  return a;
}

/* ---------------- the decision log ---------------- */

export function record(entry, ws = S.ws) {
  const a = settings(ws);
  a.log.unshift(Object.assign({ id: uid('ai'), at: new Date().toISOString(), decision: 'pending' }, entry));
  a.log = a.log.slice(0, 500);
  touch();
  return a.log[0];
}
export function decide(id, decision, note = '', ws = S.ws) {
  const e = settings(ws).log.find(x => x.id === id);
  if (e) { e.decision = decision; e.decidedAt = new Date().toISOString(); if (note) e.note = note; touch(); }
  return e;
}
export const log = (ws = S.ws) => settings(ws).log || [];

/* ---------------- context the tasks draw on ---------------- */

const n2 = x => Number(x).toFixed(2);
const vv = x => (x && typeof x === 'object' ? x.v : x);

/** A compact, readable picture of the organization. Deliberately not the whole workspace. */
export function orgContext(ws = S.ws) {
  const o = ws.org || {};
  const lines = [
    `Organization: ${o.name || ws.name}`,
    o.sector && `Sector: ${o.sector}`,
    o.size && `Size: ${o.size}${o.employees ? `, ${o.employees} employees` : ''}`,
    o.region && `Region: ${o.region}`,
    o.context && `Context: ${o.context}`,
    o.mission && `Mission: ${o.mission}`,
    o.services && `Services: ${o.services}`,
    o.systems && `Systems: ${o.systems}`,
    o.cloud && `Cloud: ${o.cloud}`,
    o.suppliers && `Suppliers: ${o.suppliers}`,
    (o.regulations || []).length && `Obligations: ${(o.regulations || []).join('; ')}`,
    o.sensitive && `Sensitive information: ${o.sensitive}`,
    o.availability && `Availability needs: ${o.availability}`,
    o.maturity && `Existing controls and maturity: ${o.maturity}`,
    o.incidents && `Incident history: ${o.incidents}`,
    `Risk appetite: ${n2(ws.assessment.APPETITE)}${ws.appetite_rationale ? ` — ${ws.appetite_rationale}` : ''}`,
  ].filter(Boolean);
  return lines.join('\n');
}

export function scenarioLine(s, r) {
  const p = s.params || {};
  const six = ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'].map(k => `${k}=${n2(vv(p[k]))}`).join(' ');
  const conf = ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'].map(k => p[k]?.conf).filter(Boolean);
  return `${s.id} | ${s.name || ''} | ${six}` +
    (r ? ` | residual ${Math.round(r.res)} ratio ${n2(r.ratio)} (${r.cls})` : '') +
    (conf.length ? ` | confidence ${conf.join(',')}` : '');
}

/* ---------------- tasks ---------------- */

const SYSTEM = `You are a senior cybersecurity risk analyst working inside CyberRiskGuardian, a
scenario-driven risk assessment tool. Its model computes, for each scenario:
  estimated = Pb(A) x Pb(psi,A) x CVSS_base x ((delta_e + delta_m)/2) x mu(E) / theta x factor
  tolerated = Pb(A) x Pb(psi,A) x CVSS_base x appetite x mu(E) / theta x factor
  residual  = estimated - estimated x red_p x red_i ; ratio = residual / tolerated
A ratio below 0.90 is below tolerance, 0.90-1.10 approximately at it, above 1.10 above it.

Rules you must follow:
- You do not calculate risk. The application's verified engine does. Never state a residual risk or a
  ratio you were not given.
- Never invent organizational facts. If something is not in the material provided, say
  "Information gap - organizational validation required" and name what is missing.
- Distinguish documented facts from assumptions and from your own estimates. Label every estimate
  "Analytical estimate - validation required".
- CVSS is Base-only here; exploitation evidence belongs in Pb(psi,A), never in the CVSS vector.
- You propose. The analyst decides. Say so where a proposal would change a stored value.
- Be concise and specific. Cite the scenario, measure or indicator identifiers you used.`;

export const TASKS = {
  /** 6 — the in-app analyst. */
  analyst: {
    label: 'Analyst',
    build(ws, { question = '', screen = '' } = {}) {
      const R = compute(ws);
      const rows = R.rows.filter(r => r.inc).sort((a, b) => b.ratio - a.ratio);
      const body = [
        orgContext(ws), '',
        `Scenarios (${rows.length} included, worst first):`,
        ...rows.slice(0, 30).map(r => scenarioLine(r.s, r)),
        '',
        `Portfolio: estimated ${Math.round(R.totals.est)}, tolerated ${Math.round(R.totals.tol)}, residual ${Math.round(R.totals.res)}; ` +
        `${R.counts.above} above tolerance, ${R.counts.at} at it, ${R.counts.below} below.`,
      ];
      const ms = (ws.measures || []).filter(m => m.status !== 'rejected');
      if (ms.length) body.push('', `Measures (${ms.length}):`,
        ...ms.slice(0, 40).map(m => `${m.id} | ${m.name} | rp=${n2(m.rp)} ri=${n2(m.ri)} | scenarios ${(m.scen || []).join(',') || 'none'} | ${m.status}`));
      const recs = ws.recommendations || [];
      if (recs.length) body.push('', `Recommendations (${recs.length}):`,
        ...recs.map(r => `${r.code} | ${r.title || '(untitled)'} | ${r.status} | scenarios ${r.scenarios.join(',')}`));
      const kd = KRI.allDefs(ws);
      if (kd.length) body.push('', 'Indicators: ' + kd.map(d => d.id).join(', '));
      if (screen) body.push('', `The analyst is looking at the "${screen}" screen.`);
      body.push('', 'Question: ' + (question || 'Summarize where this assessment stands and what deserves attention next.'),
        '', 'Answer in at most 250 words. Name the identifiers you used so the analyst can check you.');
      return { system: SYSTEM, prompt: body.join('\n'), max_tokens: 1200 };
    },
  },

  /** 8 — parameter critique. Suggests; never applies. */
  critique: {
    label: 'Parameter critique',
    build(ws) {
      const R = compute(ws);
      const rows = R.rows.filter(r => r.inc);
      const body = [
        orgContext(ws), '',
        'Every included scenario with its six parameters, stated confidence, and the engine\'s own figures:',
        ...rows.map(r => scenarioLine(r.s, r)),
        '',
        'Controls recorded in the workspace:',
        ...(ws.measures || []).slice(0, 40).map(m => `${m.id} ${m.name} (${m.status}) → ${(m.scen || []).join(',')}`),
        (ws.assets || []).length ? `Assets recorded: ${(ws.assets || []).length}` : 'No asset inventory recorded.',
        ws.compliance?.frameworks?.length ? `Compliance frameworks followed: ${ws.compliance.frameworks.join(', ')}` : 'No compliance framework selected.',
        '',
        'Review these estimates as a reviewer would. Look for:',
        '- inconsistency: similar scenarios carrying very different parameters with no stated reason;',
        '- overconfidence: High confidence on a parameter the evidence does not support;',
        '- theta out of line with the controls actually recorded;',
        '- consequence categories that look unconsidered (operational, financial, regulatory, reputational, privacy);',
        '- parameters at suspiciously round or default values across many scenarios.',
        '',
        'Return JSON only, no prose around it:',
        '{"findings":[{"scenario":"<id or \\"portfolio\\">","parameter":"PbA|Pbx|De|Dm|Th|Mu|other",' +
        '"issue":"<what is wrong, one sentence>","evidence":"<what in the material points to it>",' +
        '"suggestion":"<what to reconsider — never a value to apply automatically>",' +
        '"severity":"high|medium|low"}]}',
        'At most 10 findings, most material first. Keep each field to one sentence. If an estimate looks sound, do not invent a problem.',
      ];
      return { system: SYSTEM, prompt: body.join('\n'), max_tokens: 12000, json: true };
    },
  },

  /** K — scenario generation, optionally seeded by feed items already matched locally. */
  scenarios: {
    label: 'Scenario generation',
    build(ws, { brief = '', count = 8, feedItems = [], docs = '' } = {}) {
      const existing = ws.assessment.SCEN.map(s => `${s.id}: ${s.name}`);
      const body = [
        orgContext(ws), '',
        `Scenarios already in the register (${existing.length}) — do not repeat these:`,
        ...existing,
      ];
      if (feedItems.length) body.push('', 'Threat-feed items the application has already matched to this organization:',
        ...feedItems.map(i => `- [${i.source}] ${i.title}${i.date ? ` (${i.date})` : ''}${i.why ? ` — matched because: ${i.why}` : ''}`));
      if (brief) body.push('', 'The analyst adds: ' + brief);
      // 1.5.4 — the full text of the context documents, when the analyst includes it
      if (docs) body.push('', 'Context documents of the organization (extracted text; base the scenarios on what they state):', docs);
      body.push('',
        `Propose ${count} new scenarios that are material for this organization and genuinely different from`,
        'the ones above. Each must be a complete causal chain, not the name of a threat:',
        'threat source or event → vulnerability or predisposing condition → affected asset or process →',
        'cybersecurity event → organizational consequence.',
        '',
        'Return JSON only:',
        '{"scenarios":[{"name":"<short name>","statement":"<the causal chain in two or three sentences>",' +
        '"threat_source":"","initiating_event":"","vulnerability":"","asset":"","process":"",' +
        '"consequence":"","existing_controls":"","assumptions":"",' +
        '"params":{"PbA":{"v":0.0,"why":"","conf":"Low|Medium|High"},"Pbx":{...},"De":{...},"Dm":{...},"Th":{...},"Mu":{...}},' +
        '"attack":["T1566"],"seed":"<the feed item id that prompted it, or empty>"}]}',
        '',
        'Every parameter is between 0 and 1; theta must be above 0. Base each on what the material says,',
        'and where you are estimating, say so in "why". Do not invent facts about the organization.',
      );
      return { system: SYSTEM, prompt: body.join('\n'), max_tokens: Math.min(32000, 2200 * count + 1500), json: true };
    },
  },

  /**
   * Guideline 4 — write a causal chain, not a threat name.
   *
   * The laborious part of the methodology: a statement plus eight structured fields, for every
   * scenario. This drafts them from whatever the scenario already holds. It is deliberately one
   * scenario at a time: a chain is an argument about a specific organization, and a batch of eight
   * would get the review a batch gets rather than the review an argument needs.
   *
   * It is given the fields that are already filled and told not to contradict them, so running it on
   * a half-written scenario completes it instead of rewriting the analyst's work.
   */
  causal_chain: {
    label: 'Causal chain',
    build(ws, { scen = null, note = '' } = {}) {
      const s = scen;
      if (!s) throw new Error('Open a scenario first: a causal chain is written for one scenario.');
      const have = [];
      const put = (label, v) => { const t = Array.isArray(v) ? v.join('; ') : String(v || '').trim(); if (t) have.push(`${label}: ${t}`); };
      put('Name', s.name); put('Statement', s.statement);
      put('Threat source', s.threat_source); put('Initiating event', s.threat_event);
      put('Vulnerabilities or predisposing conditions', s.vulns); put('Existing controls', s.controls);
      put('Affected assets', s.assets); put('Affected business processes', s.processes);
      put('Event sequence', s.sequence); put('Narrative', s.narrative);
      put('Background and assumptions', s.background);
      const cons = Object.entries(s.consequences || {}).filter(([, v]) => String(v || '').trim());
      if (cons.length) have.push('Consequences already recorded: ' + cons.map(([k, v]) => `${k} — ${v}`).join(' | '));
      if ((s.attack || []).length) have.push('ATT&CK techniques linked: ' + s.attack.join(', '));
      if ((s.cves || []).length) have.push('CVEs linked: ' + s.cves.map(c => typeof c === 'string' ? c : c.id).join(', '));

      const assets = (ws.assets || []).map(a => a.name).filter(Boolean).slice(0, 25);
      const crown = (ws.assessment?.CROWN || []).map(x => typeof x === 'string' ? x : x.name).filter(Boolean);
      const body = [
        orgContext(ws), '',
        'What this scenario already holds. Do not contradict any of it; complete what is missing and',
        'leave a field empty rather than inventing an organizational fact:',
        ...(have.length ? have : ['(nothing but an empty scenario)']),
      ];
      if (crown.length) body.push('', 'Crown jewels of this organization: ' + crown.join('; '));
      if (assets.length) body.push('Information assets recorded: ' + assets.join('; '));
      if (note) body.push('', 'The analyst adds: ' + note);
      body.push('',
        'Write this scenario as a complete causal chain in the CyberRiskGuardian sense:',
        'threat source or event \u2192 vulnerability or predisposing condition \u2192 affected asset or process \u2192',
        'cybersecurity event \u2192 organizational consequence.',
        '',
        'Rules:',
        '- Name real things from the material above. Where you must assume something, put it in "assumptions".',
        '- The statement is two or three sentences and reads as one chain, not a list of nouns.',
        '- "sequence" is the order events would actually occur, one step per array element.',
        '- Consequences: fill only the categories this scenario would genuinely produce; leave the rest out.',
        '- Do not propose numbers for the six parameters. That is not what this task is for.',
        '',
        'Return JSON only:',
        '{"statement":"","threat_source":"","initiating_event":"","vulnerabilities":[""],',
        ' "existing_controls":[""],"assets":"","processes":"","sequence":[""],"narrative":"",',
        ' "consequences":{"Confidentiality/privacy":"","Integrity":"","Availability":"","Operations":"",',
        '  "Financial":"","Regulatory":"","Reputation":"","Safety":""},',
        ' "assumptions":"","attack":["T1566"],"notes":"<anything you could not determine>"}',
      );
      return { system: SYSTEM, prompt: body.join('\n'), max_tokens: 3000, json: true };
    },
  },

  /** 10 — narrate a briefing the local triage has already assembled. */
  briefing: {
    label: 'Weekly briefing',
    build(ws, { input = null, note = '' } = {}) {
      if (!input) throw new Error('Run the triage first; the briefing narrates its result.');
      const body = [
        orgContext(ws), '',
        'The application has already deduplicated this period\'s feed items, scored them against this',
        'workspace and linked them to its scenarios, assets and registered CVEs. That work is done and',
        'is not yours to redo. Here is the result:', '',
        JSON.stringify(input, null, 1), '',
        note ? 'The analyst adds: ' + note + '\n' : '',
        'Write the management section of a weekly threat briefing, in at most 350 words:',
        '- open with what changed this period for this organization specifically;',
        '- for each item needing a decision, say what the decision is and which scenario or asset it',
        '  bears on, using the identifiers given;',
        '- say plainly where nothing has changed, rather than manufacturing significance;',
        '- end with what you would ask the analyst to confirm.',
        '',
        'Do not state any risk figure, residual or ratio: you have not been given them and the engine owns',
        'them. Do not propose a parameter change — that goes through the Threat Evidence Ladder with the',
        'analyst accepting each one. Markdown, no heading above level 3.',
      ].filter(x => x !== '');
      return { system: SYSTEM, prompt: body.join('\n'), max_tokens: 2000 };
    },
  },
};

/* ---------------- building and sending ---------------- */

/** The payload exactly as it would be sent, plus its size — what the preview shows. */
export function prepare(task, ws = S.ws, opts = {}) {
  const t = TASKS[task];
  if (!t) throw new Error('Unknown task ' + task);
  const req = t.build(ws, opts);
  if (!/^TASK:/.test(req.prompt)) req.prompt = 'TASK: ' + task + '\n' + req.prompt;   // names the task in the payload and the log
  const a = settings(ws);
  let redacted = null;
  if (a.anon) {
    const ctx = anon.context(ws, anon.DEFAULT_OPTS);
    redacted = anon.text(req.prompt, ctx, anon.DEFAULT_OPTS);
  }
  const sent = redacted ?? req.prompt;
  // 1.5.2 — prose comes back in the interface language; content (values taken from documents or the
  // workspace) stays in its own language.
  const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  const system = req.system + (lang === 'fr' && !req.keepLanguage
    ? '\n\nThe person reads the interface in French (Canada): write your explanations in French. Keep identifiers, JSON keys and values copied from the material in their original language.'
    : '');
  const r = route(task, ws);
  if (!r.provider) throw new Error(r.why);
  return { task, label: t.label, provider: r.provider, mode: r.mode, system, prompt: sent, original: req.prompt,
           web_search: !!req.web_search && r.provider === WEB_SEARCH_PROVIDER && policy().web_search,
           anonymized: !!redacted, json: !!req.json, max_tokens: req.max_tokens,
           bytes: new Blob([system + sent]).size,
           words: sent.split(/\s+/).filter(Boolean).length };
}

/** Send a prepared payload. The helper owns the key; this never sees it. */
export async function send(prepared, ws = S.ws) {
  const out = await helper.post('/api/ai', {
    provider: prepared.provider || settings(ws).provider, task: prepared.task, system: prepared.system, prompt: prepared.prompt, max_tokens: prepared.max_tokens,
    web_search: !!prepared.web_search,
  });
  if (out.error) throw new Error(out.error);
  const entry = record({
    task: prepared.task, label: prepared.label, provider: out.provider, model: out.model,
    bytes: prepared.bytes, anonymized: prepared.anonymized, usage: out.usage,
    summary: prepared.prompt.slice(0, 160).replace(/\s+/g, ' '),
  }, ws);
  return { text: out.text, model: out.model, provider: out.provider, usage: out.usage, entryId: entry.id, sources: out.sources || [] };
}

/**
 * Parse a JSON answer a model may have wrapped in prose or a fenced block.
 *
 * An answer that ran into the token ceiling is cut off mid-structure. Rather than discard it, the
 * parser salvages the array elements that are complete and reports how many were lost, so a
 * truncated critique still shows its first nine findings instead of nothing at all.
 */
export function parseJson(text) {
  const t = String(text || '').trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(t);
  const body = fence ? fence[1] : t;
  const start = body.search(/[[{]/);
  if (start < 0) throw new Error('The answer contained no JSON.');
  const end = Math.max(body.lastIndexOf('}'), body.lastIndexOf(']'));
  try { return JSON.parse(body.slice(start, end + 1)); } catch (e) {
    const salvaged = salvage(body.slice(start));
    if (salvaged) return salvaged;
    throw new Error('The answer was not valid JSON: ' + e.message);
  }
}

/** Keep the complete objects of the first array in a truncated answer. */
function salvage(src) {
  const key = /"(\w+)"\s*:\s*\[/.exec(src);
  const open = key ? src.indexOf('[', key.index) : src.indexOf('[');
  if (open < 0) return null;
  const items = [];
  let i = open + 1, depth = 0, startItem = -1, inStr = false, esc = false;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') { if (depth === 0) startItem = i; depth++; continue; }
    if (ch === '}') {
      depth--;
      if (depth === 0 && startItem >= 0) {
        try { items.push(JSON.parse(src.slice(startItem, i + 1))); } catch { /* drop the broken one */ }
        startItem = -1;
      }
      continue;
    }
    if (ch === ']' && depth === 0) break;
  }
  if (!items.length) return null;
  const out = key ? { [key[1]]: items } : items;
  Object.defineProperty(out, '__truncated', { value: true, enumerable: false });
  return out;
}

/** True when the answer was cut short by the token ceiling. */
export const truncated = (parsed, usage, max) =>
  !!(parsed && parsed.__truncated) || !!(usage && max && usage.out >= max - 2);
