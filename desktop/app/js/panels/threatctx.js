/* Threat context — load or generate a dated snapshot, place exposed CVEs on the Threat Evidence Ladder,
   apply exposure-gated Pb(ψ,A) proposals to scenarios with an audit trail, and keep the revision log.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, banner, card, pill, pillFor, field, toast, download, copyText, today, select } from '../util.js';
import { S, touch, setSnapshot, compute, scen } from '../state.js';
import { LADDER, classify as ladderClassify, parseExposure, snapshotAge, snapshotStats, SCHEMA } from '../../threat.js';
import { parseKev, parseEpss, build, KEV_URL, KEV_MIRROR, epssUrl, REGIONAL_SOURCES } from '../snapgen.js';

let LASTJOIN = null, lastRows = null;

export function render(sec, arg) {
  sec.replaceChildren(el('h1', null, 'Threat context'),
    el('p', 'lede', el('span', null, 'A snapshot is dated evidence about the threat environment. It may calibrate ', el('span', 'mono', 'Pb(A)'), ' and ', el('span', 'mono', 'Pb(ψ,A)'),
      ' only, within Threat Evidence Ladder bands, and only where exposure is confirmed. It never informs δe, δm, θ or μ(E).')));
  snapshotCard(sec);
  generator(sec);
  joinCard(sec, arg === 'join');
  revisionLog(sec);
  ladderCard(sec);
}

/* ---------------- snapshot ---------------- */
function snapshotCard(sec) {
  const fileIn = el('input', { type: 'file', id: 'snap-file', accept: '.json,application/json' });
  const status = el('div', { id: 'snap-status', class: 'note' });
  const detail = el('div', { id: 'snap-detail' });
  fileIn.addEventListener('change', async e => {
    const f = e.target.files?.[0]; if (!f) return;
    status.textContent = 'Reading ' + f.name + '…';
    try { const snap = JSON.parse(await f.text()); await setSnapshot(snap, f.name); toast('Snapshot stored in this workspace'); }
    catch (err) { status.replaceChildren(banner('bad', 'Could not read that file', String(err.message || err))); }
  });
  const clear = el('button', { class: 'btn ghost', id: 'snap-clear', onclick: async () => { await setSnapshot(null); toast('Snapshot removed from this workspace'); } }, 'Clear');
  /* 1.5.5 — the example shipped with the application. Until now every route to a snapshot needed the
     internet: the helper's download, a KEV file plus an EPSS file you fetched yourself, or
     threat_snapshot.py. On a machine behind an egress allowlist there was no fourth option, so
     Process step 4 could not be completed at all. This is that fourth option, and it is labelled
     loudly enough that it cannot be mistaken for current intelligence. */
  const example = el('button', { class: 'btn ghost', id: 'snap-example', onclick: async e => {
    const b = e.target; b.disabled = true; const was = b.textContent; b.textContent = 'Loading…';
    try {
      const r = await fetch('examples/threat-context/threat-context-example.json', { cache: 'no-store' });
      if (!r.ok) throw new Error(`the file is missing from this installation (HTTP ${r.status})`);
      const snap = await r.json();
      await setSnapshot(snap, 'threat-context-example.json');
      toast('Example snapshot loaded — it is an example, not current intelligence');
    } catch (err) {
      status.replaceChildren(banner('bad', 'The example snapshot could not be loaded', String(err.message || err)));
      b.disabled = false; b.textContent = was;
    }
  } }, 'Load the bundled example');
  sec.append(card(el('div', 'row', el('div', { style: { flex: '1 1 320px' } }, el('label', null, el('b', null, 'Snapshot'), ' — the JSON produced by ', el('span', 'mono', 'threat_snapshot.py'), ' or by the generator below'), fileIn),
    S.snap ? el('button', { class: 'btn ghost', onclick: () => download(S.ws.snapshot?.name || 'threat-context.json', JSON.stringify(S.snap), 'application/json') }, 'Download') : null, example, clear), status), detail);

  const SNAP = S.snap;
  if (!SNAP) {
    status.replaceChildren(el('div', null, 'No snapshot loaded in this workspace. Everything below stays inert until one is.'));
    sec.append(banner('warn', 'No network? Use the bundled example',
      el('div', null,
        el('div', null, 'Every other route to a snapshot needs the internet: the download helper, a KEV file and an EPSS file you fetch yourself, or ',
          el('span', 'mono', 'threat_snapshot.py'), '. The example shipped with the application needs none of them, and it is enough to place CVEs on the Threat Evidence Ladder, run the exposure join and complete Process step 4.'),
        el('div', { style: { marginTop: '4px' } }, el('b', null, 'It carries the CISA KEV catalogue of its build date and a pruned EPSS table'),
          ' — pruned at the ladder\u2019s own rung-1 ceiling, so every row that was dropped would have classified as rung 1 anyway. Classification is identical to the unpruned snapshot; only the exact score of an already-negligible CVE is missing.'))));
    return;
  }
  /* An example snapshot announces itself, on every visit, wherever it is used. */
  if (SNAP.example?.is_example) sec.append(banner('warn', 'This is the example snapshot, not current threat intelligence',
    el('div', null,
      el('div', null, SNAP.example.what || ''),
      el('div', { style: { marginTop: '4px' } }, SNAP.example.not || ''),
      el('div', 'small muted', { style: { marginTop: '4px' } }, 'Built ', SNAP.retrieved || '—', ' from ', SNAP.example.built_from || 'the project snapshot', '.'))));
  const age = snapshotAge(SNAP), st = snapshotStats(SNAP);
  if (!st.schemaOk) status.append(banner('warn', 'Unexpected schema', `Found ${st.schema || 'none'}, expected ${SCHEMA}. Fields may be missing.`));
  status.append(document.createTextNode((S.ws.snapshot?.name ? S.ws.snapshot.name + ' — ' : '') + (age.expired ? `retrieved ${age.retrieved}. EXPIRED ${Math.abs(age.daysLeft)} days ago — refresh before relying on it.`
    : `retrieved ${age.retrieved}, ${age.daysLeft} days of validity left.`)));
  const k = el('div', 'grid g4', { id: 'snap-kpis' });
  k.append(kpi('Snapshot', age.retrieved ?? '—', 'expires ' + (age.expires ?? '—')),
    kpi('Freshness', pill(age.expired ? 'Expired' : age.daysLeft < 15 ? 'Expiring' : 'Valid', age.expired ? 'bad' : age.daysLeft < 15 ? 'warn' : 'good'), `${age.ageDays} days old · 90-day lifetime`),
    kpi('KEV entries', n0(st.kev), 'exploited in the wild'), kpi('EPSS scores', n0(st.epss), st.pruned ? `pruned below ${st.pruned.threshold}` : 'full table'),
    kpi('Regions', st.regions.join(', ') || 'global only'));
  const t = el('table');
  t.append(el('thead', null, el('tr', null, el('th', null, 'Source'), el('th', null, 'Version'), el('th', null, 'Date'), el('th', 'num', 'Entries'))));
  const tb = el('tbody', { id: 'snap-sources' });
  for (const s of st.sources) tb.append(el('tr', null, el('td', null, s.name + (s.region ? ` (${s.region})` : '')), el('td', 'mono', s.version ?? '—'), el('td', 'mono', s.scoreDate ?? '—'), el('td', 'num', s.entries != null ? n0(s.entries) : '—')));
  t.append(tb);
  detail.append(k, el('h2', null, 'Provenance'), card(t, el('div', 'note', { id: 'snap-pruned' }, st.pruned
    ? `EPSS pruned at ${st.pruned.threshold}: kept ${n0(st.pruned.kept)}, dropped ${n0(st.pruned.dropped)}. Rule: ${st.pruned.rule}. A CVE absent from the table and not in KEV is inferred to sit on rung 1.`
    : 'The sources block reports what each source provided at retrieval; the counts above report what the snapshot retains.')));
}

/* ---------------- generator ---------------- */
function generator(sec) {
  const d = el('details', 'card');
  d.append(el('summary', null, 'Generate a new threat-context snapshot'));
  const day = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const kevIn = el('input', { type: 'file', accept: '.json' }), epssIn = el('input', { type: 'file', accept: '.csv,.gz' });
  const regs = Object.keys(REGIONAL_SOURCES).map(r => [r, el('input', { type: 'checkbox', checked: r === 'ca' || r === 'intl' })]);
  const exp = el('input', { type: 'number', value: 90, min: 1, max: 365 }), prune = el('input', { type: 'number', value: 0.001, step: 0.001, min: 0, max: 0.049 }),
    guard = el('input', { type: 'number', value: 10, min: 0, max: 30 });
  const out = el('div');
  const cli = 'python3 threat_snapshot.py --refresh --regions ' + 'ca,intl' + ' --prune-epss 0.001 --summary -o threat-context-' + today() + '.json';
  d.append(el('p', 'note', 'Two ways, same artifact (schema crg-threat-context/1). Either way the app itself makes no network request, and no CVE of yours is ever sent to a provider: the catalogues are downloaded whole and joined locally (C5).'),
    el('div', 'cols2',
      el('div', null, el('h2', null, 'A · In this app, from downloaded files'),
        el('ol', 'small', el('li', null, 'Download the CISA KEV catalogue: ', el('a', { href: KEV_URL, target: '_blank', rel: 'noopener' }, 'cisa.gov JSON'), ' or the ', el('a', { href: KEV_MIRROR, target: '_blank', rel: 'noopener' }, 'GitHub mirror'), '.'),
          el('li', null, 'Download the EPSS daily file: ', el('a', { href: epssUrl(day), target: '_blank', rel: 'noopener' }, `epss_scores-${day}.csv.gz`), ' (any recent date; keep it gzipped).'),
          el('li', null, 'Open both files below and build.')),
        el('div', 'grid g2', field('<b>KEV JSON</b>', kevIn), field('<b>EPSS CSV (.csv or .csv.gz)</b>', epssIn)),
        el('div', 'grid g3', { style: { marginTop: '10px' } }, field('Validity (days)', exp), field('Prune EPSS below', prune, 'Keeps the file small; KEV CVEs always kept. Must be < 0.05'), field('Age guard (years)', guard)),
        el('div', { style: { marginTop: '10px' } }, el('label', null, 'Regional strategic modules (narrative sources, listed for the analyst)'), el('div', 'chips', ...regs.map(([r, c]) => el('label', { class: 'chip' }, c, r)))),
        el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: async () => {
          out.replaceChildren(el('div', 'note', 'Reading files…'));
          try {
            if (!kevIn.files[0] || !epssIn.files[0]) throw new Error('Open both the KEV JSON and the EPSS CSV.');
            const kev = await parseKev(kevIn.files[0]); const epss = await parseEpss(epssIn.files[0]);
            const snap = build({ kev, epss, regions: regs.filter(([, c]) => c.checked).map(([r]) => r), expiryDays: Number(exp.value) || 90, ageGuard: Number(guard.value), prune: Number(prune.value) || null });
            const name = 'threat-context-' + snap.retrieved + '.json';
            out.replaceChildren(banner('good', 'Snapshot built', `${n0(kev.count)} KEV entries (catalogue ${kev.catalog_version}), ${n0(snap.epss.count)} EPSS scores kept of ${n0(epss.count)} (score date ${epss.score_date || 'unknown'}). Review the provenance, then use it.`),
              el('div', 'btnrow', el('button', { class: 'btn', onclick: async () => { await setSnapshot(snap, name); toast('Snapshot in use'); } }, 'Use in this workspace'),
                el('button', { class: 'btn ghost', onclick: () => download(name, JSON.stringify(snap), 'application/json') }, 'Download ' + name)));
          } catch (e) { out.replaceChildren(banner('bad', 'Could not build the snapshot', String(e.message || e))); }
        } }, 'Build snapshot')), out),
      el('div', null, el('h2', null, 'B · With the Python script'),
        el('p', 'small', 'From the CyberRiskGuardian_ThreatIntel repository, on a machine with network access:'),
        el('pre', { class: 'preview mono' }, cli),
        el('button', { class: 'btn ghost sm', onclick: e => copyText(cli, e.target) }, 'Copy command'),
        el('p', 'small', 'Then load the resulting JSON with the Snapshot field above. Use ', el('span', 'mono', '--offline file.json --summary'), ' to inspect an existing snapshot with no network at all.'),
        el('p', 'note', 'Refresh at least every 90 days, and whenever a major campaign or KEV addition affects technology you operate.'))));
  sec.append(d);
}

/* ---------------- exposure join + apply ---------------- */
function joinCard(sec, prefill) {
  const ws = S.ws, SNAP = S.snap;
  const exposedReg = ws.vulns.filter(v => v.exposed).map(v => v.id);
  const ta = el('textarea', { id: 'exposure', class: 'code', placeholder: '# from the CMDB or scanner evidence\nCVE-2026-12345\nCVE-2025-54321' });
  ta.value = ws.exposureText ?? (exposedReg.length ? '# exposure confirmed in the vulnerability register\n' + exposedReg.join('\n') : '');
  if (prefill && exposedReg.length) ta.value = '# exposure confirmed in the vulnerability register\n' + exposedReg.join('\n');
  ta.addEventListener('input', () => { ws.exposureText = ta.value; touch(); });
  const outBox = el('div', { id: 'join-out' });
  const copyBtn = el('button', { class: 'btn ghost', id: 'join-copy', disabled: true, onclick: async () => {
    if (!LASTJOIN) return;
    const txt = JSON.stringify(LASTJOIN, null, 2);
    if (!(await copyText(txt, copyBtn))) { const t2 = el('textarea', { class: 'code' }); t2.value = txt; outBox.append(t2); }
  } }, 'Copy threat_basis JSON');
  sec.append(el('h2', null, 'Exposure join'), card(
    el('label', null, el('b', null, 'CVEs the organization is confirmed to operate'), ' — one per line, ', el('span', 'mono', '#'), ' comments allowed. Nothing is transmitted; the join is local.'),
    ta, el('div', 'row', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'join-run', onclick: () => run() }, 'Place on the ladder'), copyBtn,
      el('button', { class: 'btn ghost', disabled: !exposedReg.length, onclick: () => { ta.value = '# exposure confirmed in the vulnerability register\n' + exposedReg.join('\n'); ws.exposureText = ta.value; touch(); } }, `Use the register (${exposedReg.length} exposed)`))), outBox);

  function run() {
    outBox.replaceChildren();
    if (!SNAP) { outBox.append(banner('warn', 'No snapshot', 'Load a snapshot first — the ladder needs dated evidence.')); return; }
    const cves = parseExposure(ta.value);
    if (!cves.length) { outBox.append(banner('warn', 'No CVE found', 'Paste the CVEs the organization is confirmed to operate. Without exposure evidence the gate blocks every uplift.')); return; }
    const rows = cves.map(c => ladderClassify(c, SNAP, true));
    lastRows = rows;
    const c = el('div', 'card'), t = el('table');
    t.append(el('thead', null, el('tr', null, ...['CVE', 'Rung', 'Band', 'Ladder position', 'Evidence', 'Scenarios'].map((h, i) => el('th', i === 1 || i === 2 ? 'num' : null, h)))));
    const tb = el('tbody');
    for (const r of rows) {
      const scs = ws.assessment.SCEN.filter(s => (s.cves || []).includes(r.cve));
      tb.append(el('tr', null, el('td', 'mono', el('a', { href: '#/vulns/' + r.cve }, r.cve)), el('td', 'num', String(r.rung)), el('td', 'num', `${r.band[0].toFixed(2)}–${r.band[1].toFixed(2)}`),
        el('td', null, pill(r.label, r.rung >= 4 ? 'bad' : r.rung >= 3 ? 'warn' : 'good')), el('td', null, r.evidence),
        el('td', null, scs.length ? scs.map(s => s.id).join(', ') : el('span', 'muted', 'not linked'))));
    }
    t.append(tb); c.append(el('div', 'tablewrap', t));
    const r4 = rows.filter(r => r.rung >= 4).length, r5 = rows.filter(r => r.rung === 5).length;
    c.append(el('div', 'note', `${rows.length} CVE placed · ${r4} at rung 4 or above, proposing Pb(ψ,A) ≥ 0.70. Each change needs a threat_basis block recording the evidence dates and the exposure evidence. CVSS stays Base-only.`));
    if (r5) c.append(banner('bad', 'Rung 5 reached', 'Direct organizational evidence means an incident, not a prospective risk. Invoke incident response first.'));
    outBox.append(c);
    LASTJOIN = {
      threat_context: { snapshot: ws.snapshot?.name ?? 'threat-context.json', retrieved: SNAP.retrieved, expires: SNAP.expires, regions: SNAP.regions ?? [],
        sources: snapshotStats(SNAP).sources.map(s => [s.name, s.version, s.scoreDate, s.entries != null ? s.entries + ' entries' : null].filter(Boolean).join(' · ')) },
      threat_basis: rows.map(r => ({ cve: r.cve, parameter: 'Pb(psi,A)', ladder_rung: r.rung, ladder_label: r.label, band: r.band, evidence: [r.evidence + ` (snapshot ${SNAP.retrieved})`],
        exposure: exposureFor(r.cve), confidence: 'TODO — High / Medium / Low', cvss_unchanged: true, cvss_note: 'Base-only per C2; exploitation evidence routed to Pb(psi,A)' })),
    };
    copyBtn.disabled = false;
    proposals(outBox, rows);
  }
  if (SNAP && parseExposure(ta.value).length) run();
}
const exposureFor = cve => { const v = S.ws.vulns.find(x => x.id === cve && x.exposed); return v ? `Vulnerability register: ${[v.product, v.asset].filter(Boolean).join(' on ') || 'confirmed'} (${v.source || 'analyst'})` : 'TODO — cite the asset inventory or scanner evidence that confirms this technology is operated'; };

/** Exposure-gated, band-bounded Pb(ψ,A) proposals for scenarios that link the CVE. Analyst accepts each one. */
function proposals(box, rows) {
  const ws = S.ws, a = ws.assessment;
  const props = [];
  for (const r of rows) for (const s of a.SCEN.filter(x => (x.cves || []).includes(r.cve))) {
    const cur = Number(s.params.Pbx.v);
    let to = null;
    if (cur < r.band[0]) to = r.band[0];   // raise to the band floor; intelligence never lowers an organizational estimate on its own
    if (to !== null) props.push({ s, r, from: cur, to });
  }
  const c = el('div', 'card');
  c.append(el('h2', null, 'Proposed Pb(ψ,A) changes'));
  if (!props.length) { c.append(el('p', 'note', 'No linked scenario sits below its ladder band. Link CVEs to scenarios (scenario editor or vulnerability register) to receive proposals.')); box.append(c); return; }
  const checks = props.map(() => el('input', { type: 'checkbox', checked: true }));
  const conf = props.map(() => select(['Medium', 'High', 'Low'], 'Medium'));
  const t = el('table', 'compact');
  t.append(el('thead', null, el('tr', null, el('th', 'cb', ''), ...['Scenario', 'CVE · rung', 'Pb(ψ,A) now', 'Proposed', 'Ratio now → after', 'Confidence'].map(h => el('th', null, h)))));
  const tb = el('tbody');
  props.forEach((p, i) => {
    const before = CRG.calc(p.s, a.APPETITE, a.FACTOR);
    const after = CRG.calc(Object.assign({}, p.s, { params: Object.assign({}, p.s.params, { Pbx: { v: p.to } }) }), a.APPETITE, a.FACTOR);
    p.before = before; p.after = after;
    tb.append(el('tr', null, el('td', 'cb', checks[i]), el('td', null, el('a', { href: '#/scenario/' + p.s.id }, p.s.id + ' ' + (p.s.name || '').slice(0, 50))),
      el('td', 'mono', p.r.cve + ' · ' + p.r.rung), el('td', 'num', n2(p.from)), el('td', 'num', el('b', null, n2(p.to))),
      el('td', null, n2(before.ratio) + ' → ' + n2(after.ratio) + ' ', pill(CRG.classify(after.ratio), pillFor(CRG.classify(after.ratio)))), el('td', null, conf[i])));
  });
  t.append(tb);
  c.append(el('div', 'tablewrap', t), el('p', 'note', 'Proposals raise Pb(ψ,A) to the floor of the ladder band, never beyond it, and only for exposed CVEs linked to the scenario. Ratios are recomputed by the verified engine. Accepting records a threat_basis entry and a revision-log line.'),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: () => {
      let n = 0;
      ws.revisionLog ||= [];
      props.forEach((p, i) => {
        if (!checks[i].checked) return;
        p.s.params.Pbx = Object.assign({}, p.s.params.Pbx, { v: p.to, conf: conf[i].value, ev: [p.s.params.Pbx.ev, 'threat-context ' + S.snap.retrieved].filter(Boolean).join('; ') });
        (p.s.threat_basis ||= []).push({ cve: p.r.cve, parameter: 'Pb(psi,A)', from: p.from, to: p.to, ladder_rung: p.r.rung, ladder_label: p.r.label, band: p.r.band,
          evidence: [p.r.evidence + ` (snapshot ${S.snap.retrieved})`], exposure: exposureFor(p.r.cve), confidence: conf[i].value, date: today(), cvss_unchanged: true });
        ws.revisionLog.push({ date: today(), scenario: p.s.id, parameter: 'Pb(psi,A)', from: p.from, to: p.to, ratioFrom: p.before.ratio, ratioTo: p.after.ratio,
          clsFrom: CRG.classify(p.before.ratio), clsTo: CRG.classify(p.after.ratio), cause: `${p.r.cve}: ${p.r.evidence}`, snapshot: S.snap.retrieved });
        n++;
      });
      touch('redraw'); toast(n + ' scenario(s) recalibrated');
    } }, 'Accept selected')));
  box.append(c);
}

function revisionLog(sec) {
  const log = S.ws.revisionLog || [];
  if (!log.length) return;
  const t = el('table', 'compact');
  t.append(el('thead', null, el('tr', null, ...['Date', 'Scenario', 'Parameter', 'From → to', 'Ratio', 'Classification', 'Cause'].map(h => el('th', null, h)))));
  t.append(el('tbody', null, ...log.slice().reverse().map(r => el('tr', null, el('td', 'mono', r.date), el('td', null, el('a', { href: '#/scenario/' + r.scenario }, r.scenario)), el('td', 'mono', r.parameter),
    el('td', 'num', n2(r.from) + ' → ' + n2(r.to)), el('td', 'num', n2(r.ratioFrom) + ' → ' + n2(r.ratioTo)),
    el('td', null, r.clsFrom === r.clsTo ? r.clsTo : el('span', null, el('b', null, r.clsFrom + ' → ' + r.clsTo))), el('td', 'small', r.cause)))));
  sec.append(el('h2', null, 'Revision log'), card(el('div', 'tablewrap', t), el('p', 'note', 'Each line records why a scenario moved: the intelligence, the snapshot date and the before/after tolerance ratio. A classification change caused by the threat landscape — not by the organization — is the signal management needs.')));
}

function ladderCard(sec) {
  const t = el('table');
  t.append(el('thead', null, el('tr', null, el('th', null, 'Rung'), el('th', null, 'Band'), el('th', null, 'Label'), el('th', null, 'Test'))));
  t.append(el('tbody', { id: 'ladder' }, ...LADDER.map(l => el('tr', null, el('td', 'num', String(l.rung)), el('td', 'num', `${l.band[0].toFixed(2)}–${l.band[1].toFixed(2)}`), el('td', null, l.label), el('td', null, l.test)))));
  sec.append(el('h2', null, 'Threat Evidence Ladder'), card(t, el('div', 'note', el('span', null, 'Rung 5 means an ', el('b', null, 'incident'), ', not a prospective risk: invoke incident response first.'))));
}
