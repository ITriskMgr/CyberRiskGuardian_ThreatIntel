/* triage.js — turning a week of feed items into something an analyst can act on (1.5.1).

   Downloading feeds is easy; the hard part is that four sources report the same campaign, most items
   are irrelevant to this organization, and the two that matter are buried. This module does that work
   locally and deterministically:

     deduplicate → score relevance against the workspace → link to the scenarios, assets and CVEs it
     touches → bucket into act / watch / noise → write a briefing.

   Three rules it keeps:
   - **A feed never changes a score.** Nothing here writes a parameter. The strongest thing an item can
     do is raise a review item, which the analyst then takes through the Threat Evidence Ladder.
   - **Every placement states its reason.** An item in the "act" bucket names the scenario, asset or
     registered CVE it matched and why.
   - **It works with AI switched off.** The briefing is written from the local pass; AI only adds a
     narrative on top, and the structure underneath is the same either way.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { profileTerms, relevance } from './feedparse.js';
import { today } from './util.js';

/* ---------------- deduplication ---------------- */

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'on', 'with', 'by', 'from',
  'new', 'has', 'have', 'is', 'are', 'was', 'were', 'its', 'as', 'at', 'that', 'this', 'after', 'over']);

/** Title words that carry meaning, for comparing two headlines about the same story. */
export function titleKey(s) {
  return (String(s || '').toLowerCase().match(/[a-z0-9][a-z0-9.-]{2,}/g) || [])
    .filter(w => !STOP.has(w)).slice(0, 12).sort().join(' ');
}

const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let n = 0; for (const x of a) if (b.has(x)) n++;
  return n / (a.size + b.size - n);
};

/**
 * Group items that are the same story.
 *
 * Two items match when they share a CVE, or their titles overlap enough. A shared CVE is decisive:
 * four outlets writing about CVE-2026-1234 are one story, however differently they headline it.
 */
export function dedupe(items, { titleThreshold = 0.6 } = {}) {
  const groups = [];
  for (const it of items) {
    const cves = new Set((it.cves || []).map(c => c.toUpperCase()));
    const words = new Set(titleKey(it.title).split(' ').filter(Boolean));
    let found = null;
    for (const g of groups) {
      if (cves.size && g.cves.size && [...cves].some(c => g.cves.has(c))) { found = g; break; }
      if (jaccard(words, g.words) >= titleThreshold) { found = g; break; }
    }
    if (found) {
      found.items.push(it);
      for (const c of cves) found.cves.add(c);
      for (const w of words) found.words.add(w);
      if (!found.date || (it.date && it.date > found.date)) found.date = it.date;
    } else {
      groups.push({ id: 'G' + (groups.length + 1), items: [it], cves, words,
                    title: it.title, date: it.date || '' });
    }
  }
  for (const g of groups) {
    g.sources = [...new Set(g.items.map(i => i.src))];
    // the longest headline usually carries the most detail
    g.title = g.items.map(i => i.title).sort((a, b) => b.length - a.length)[0] || g.title;
    g.cveList = [...g.cves].sort();
  }
  return groups;
}

/* ---------------- linking to the workspace ---------------- */

/** What in this workspace an item actually touches, named rather than implied. */
export function links(group, ws = S.ws) {
  const cves = new Set(group.cveList);
  const att = new Set(group.items.flatMap(i => i.attack || []));
  const hay = (' ' + group.items.map(i => `${i.title} ${i.text}`).join(' ') + ' ').toLowerCase();

  const registered = (ws.vulns || []).filter(v => cves.has(String(v.id).toUpperCase()));
  const exposed = registered.filter(v => v.exposed);
  const scenarios = (ws.assessment.SCEN || []).filter(s =>
    (s.attack || []).some(t => att.has(t)) || (s.cves || []).some(c => cves.has(String(c).toUpperCase())));
  const assets = (ws.assets || []).filter(a => {
    const names = [a.vendor, a.product, ...(a.software || []).map(x => x.name)].filter(Boolean);
    return names.some(nm => nm.length >= 3 && hay.includes(String(nm).toLowerCase()));
  });
  return { registered, exposed, scenarios, assets,
           attack: [...att].filter(t => (ws.assessment.SCEN || []).some(s => (s.attack || []).includes(t))) };
}

/* ---------------- buckets ---------------- */

export const BUCKETS = [
  ['act', 'Needs a decision', 'Touches a CVE the organization is confirmed to operate, or a scenario and an asset together.'],
  ['watch', 'Worth watching', 'Relevant to the sector, region or technology profile, but nothing in the workspace is confirmed exposed.'],
  ['noise', 'Not relevant', 'Nothing in this workspace matched. Kept so the triage can be audited, not hidden.'],
];

/**
 * The full local pass. Deterministic: the same items and workspace give the same result, which is
 * what makes a briefing checkable.
 */
export function triage(items, ws = S.ws, cfg = null, { since = null } = {}) {
  const terms = profileTerms(ws, cfg);
  const fresh = since ? items.filter(i => !i.date || i.date >= since) : items;
  const groups = dedupe(fresh);

  for (const g of groups) {
    const best = g.items.map(i => relevance(i, terms)).sort((a, b) => b.score - a.score)[0] || { score: 0, why: [] };
    g.score = best.score;
    g.why = best.why;
    g.link = links(g, ws);
    const L = g.link;
    if (L.exposed.length) { g.bucket = 'act'; g.reason = `${L.exposed.length} registered CVE(s) with exposure confirmed: ${L.exposed.map(v => v.id).join(', ')}`; }
    else if (L.scenarios.length && L.assets.length) { g.bucket = 'act'; g.reason = `matches scenario ${L.scenarios.map(s => s.id).join(', ')} and asset ${L.assets.map(a => a.id).join(', ')}`; }
    else if (L.registered.length) { g.bucket = 'watch'; g.reason = `${L.registered.length} CVE(s) in the register, exposure not confirmed`; }
    else if (L.scenarios.length) { g.bucket = 'watch'; g.reason = `technique used by ${L.scenarios.map(s => s.id).join(', ')}`; }
    else if (L.assets.length) { g.bucket = 'watch'; g.reason = `names technology recorded as ${L.assets.map(a => a.id).join(', ')}`; }
    else if (g.score >= 4) { g.bucket = 'watch'; g.reason = 'profile match: ' + (g.why[0] || 'sector or region'); }
    else { g.bucket = 'noise'; g.reason = g.score ? 'weak profile match only' : 'nothing in this workspace matched'; }
  }

  groups.sort((a, b) => {
    const rank = x => ({ act: 0, watch: 1, noise: 2 }[x.bucket]);
    return rank(a) - rank(b) || b.score - a.score || (b.date || '').localeCompare(a.date || '');
  });

  const by = k => groups.filter(g => g.bucket === k);
  return {
    when: new Date().toISOString(), since,
    counts: { items: fresh.length, groups: groups.length, duplicates: fresh.length - groups.length,
              act: by('act').length, watch: by('watch').length, noise: by('noise').length },
    sources: [...new Set(fresh.map(i => i.src))].sort(),
    groups, act: by('act'), watch: by('watch'), noise: by('noise'),
  };
}

/* ---------------- the briefing, written without AI ---------------- */

/**
 * A complete briefing from the local pass alone. AI can add a narrative on top, but the facts,
 * the counts and the reasons come from here — so the briefing is the same document either way, and
 * remains available when AI is switched off.
 */
export function markdown(t, ws = S.ws, { title = 'Weekly threat briefing', note = '' } = {}) {
  const L = [];
  const org = ws.org?.name || ws.name;
  L.push(`# ${title}`, '', `**${org}** · ${t.since ? `items dated ${t.since} onward` : 'all loaded items'} · prepared ${t.when.slice(0, 10)}`, '');
  L.push(`${t.counts.items} item(s) from ${t.sources.length} source(s) reduced to ${t.counts.groups} distinct stories ` +
         `(${t.counts.duplicates} duplicate report(s) merged). ` +
         `**${t.counts.act} need${t.counts.act === 1 ? 's' : ''} a decision**, ${t.counts.watch} ${t.counts.watch === 1 ? 'is' : 'are'} worth watching, ` +
         `${t.counts.noise} did not match this workspace.`, '');
  if (note) L.push(note, '');

  const block = (rows, heading, empty) => {
    L.push(`## ${heading}`, '');
    if (!rows.length) { L.push(`_${empty}_`, ''); return; }
    for (const g of rows) {
      L.push(`### ${g.title}`);
      const meta = [g.date && g.date.slice(0, 10), g.sources.join(', '),
                    g.cveList.length ? g.cveList.join(', ') : ''].filter(Boolean);
      L.push(`_${meta.join(' · ')}_`, '');
      L.push(`**Why it is here.** ${g.reason}.`);
      const K = g.link;
      const refs = [];
      if (K.scenarios.length) refs.push(`scenarios ${K.scenarios.map(s => `${s.id} (${s.name || ''})`).join('; ')}`);
      if (K.assets.length) refs.push(`assets ${K.assets.map(a => `${a.id} ${a.name || ''}`).join('; ')}`);
      if (K.registered.length) refs.push(`registered CVEs ${K.registered.map(v => v.id + (v.exposed ? ' (exposed)' : '')).join(', ')}`);
      if (refs.length) L.push(`**In this workspace.** ${refs.join(' · ')}.`);
      const url = g.items.find(i => i.url)?.url;
      if (url) L.push(`**Source.** ${url}`);
      L.push('');
    }
  };
  block(t.act, 'Needs a decision', 'Nothing this period touches a confirmed exposure or a scenario with a matching asset.');
  block(t.watch, 'Worth watching', 'Nothing matched the organization profile this period.');

  L.push('## What this briefing does not do', '');
  L.push('No risk score has been changed. An item here is evidence about the external environment; moving',
         'Pb(A) or Pb(ψ,A) requires confirmed exposure and goes through the Threat Evidence Ladder, where the',
         'analyst accepts each change. CVSS stays Base-only.', '');
  if (t.counts.noise) L.push(`_${t.counts.noise} item(s) were set aside as not relevant. They are kept in the app so the triage can be audited._`, '');
  return L.join('\n');
}

/**
 * What the scheduled task needs to do the same matching without access to the workspace.
 *
 * Technology names, registered CVE identifiers and scenario techniques — the things that decide
 * relevance. Deliberately no organization name, no scenario text, no asset notes: the file sits in
 * the feeds folder and may be read by the task, so it carries what matching needs and nothing else.
 */
export function profile(ws = S.ws, cfg = null) {
  const terms = profileTerms(ws, cfg);
  return {
    schema: 'crg-triage-profile/1',
    generated: today(),
    sector: ws.org?.sector || '',
    region: ws.org?.region || '',
    technologies: [...new Set((ws.assets || []).flatMap(a => [a.vendor, a.product,
      ...(a.software || []).map(x => x.name)]).filter(x => x && x.length >= 3))],
    assets: (ws.assets || []).map(a => ({ id: a.id, vendor: a.vendor || '', product: a.product || '' })),
    cves: (ws.vulns || []).map(v => ({ id: v.id, exposed: !!v.exposed })),
    techniques: [...new Set((ws.assessment.SCEN || []).flatMap(s => s.attack || []))],
    scenarios: (ws.assessment.SCEN || []).map(s => ({ id: s.id, attack: s.attack || [], cves: s.cves || [] })),
    terms: terms.map(t => ({ term: t.term, weight: t.w, why: t.why })),
    note: 'Matching data only. No organization name, scenario text or asset notes are included.',
  };
}

/** The compact structure an AI briefing is asked to narrate — never the raw feed dump. */
export function briefingInput(t, ws = S.ws) {
  const g = x => ({
    title: x.title, date: (x.date || '').slice(0, 10), sources: x.sources, cves: x.cveList,
    reason: x.reason,
    scenarios: x.link.scenarios.map(s => `${s.id}: ${s.name || ''}`),
    assets: x.link.assets.map(a => `${a.id}: ${a.name || ''}`),
    exposed: x.link.exposed.map(v => v.id),
  });
  return {
    organization: ws.org?.name || ws.name,
    sector: ws.org?.sector || '', region: ws.org?.region || '',
    period: t.since ? `since ${t.since}` : 'all loaded items',
    counts: t.counts,
    act: t.act.map(g),
    watch: t.watch.slice(0, 15).map(g),
  };
}
