/* Vulnerabilities — the organization's CVE register (exposure gate), enrichment from the local threat-context
   snapshot (CISA KEV, FIRST EPSS, ladder rung), NVD / CVE JSON 5 / scanner CSV import, and the CWE explorer.
   Everything is joined locally: no CVE is ever sent to an external service (constraint C5).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, card, pill, chip, select, toast, go, banner, table, today, parseCSV, field, download, toCSV } from '../util.js';
import { S, touch, scen, blankScenario, nextScenarioId } from '../state.js';
import { KB, cwe, searchCwe, techniquesForCwe, techName } from '../ontology.js';
import { classify as ladder } from '../../threat.js';
import * as online from './online.js';
import * as links from './links.js';

let view = 'register';

const scenariosFor = id => S.ws.assessment.SCEN.filter(s => (s.cves || []).includes(id) || (s.cwe || []).includes(id) || (s.wlinks || []).includes(id));
const rungPill = r => el('span', { class: 'pill ' + (r.rung >= 4 ? 'bad' : r.rung >= 3 ? 'warn' : 'good'), title: r.evidence }, `rung ${r.rung}`);

export function render(sec, arg) {
  if (arg === 'online') view = 'online';
  else if (arg === 'links') view = 'links';
  else if (arg) view = arg.startsWith('CWE') ? 'cwe' : 'cve';   // CVE-… and W-… (named weakness) open the detail
  if (!sec._onl) { sec._onl = true; sec.addEventListener('online-redraw', () => render(sec, null)); }
  sec.replaceChildren(el('h1', null, 'Vulnerabilities — CVE, CWE, KEV, EPSS'),
    el('p', 'lede', 'The vulnerabilities the organization is confirmed to operate are the exposure gate of the threat-context method: intelligence moves Pb(ψ,A) only where exposure is confirmed. CVEs are enriched from the loaded snapshot (CISA KEV and FIRST EPSS) by a local join — nothing is transmitted. Weakness types come from CWE.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['register', `CVE register (${S.ws.vulns.length})`], ['links', `Suggest links${(S.ws.linkDraft?.links || []).length ? ' (' + S.ws.linkDraft.links.length + ')' : ''}`], ['online', 'Online sources'], ['import', 'Import files'], ['cwe', 'CWE explorer'], ['cve', 'CVE detail']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; history.replaceState(null, '', k === 'links' ? '#/vulns/links' : '#/vulns'); render(sec, k === 'links' ? 'links' : null); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  if (view === 'online') { online.render(body, sec); return; }
  if (view === 'links') { links.render(body, sec, () => render(sec, 'links')); return; }
  ({ register, import: importer, cwe: cweView, cve: cveView }[view])(body, arg, sec);
}

function enrich(v) {
  const out = { kev: null, epss: null, rung: null };
  if (!S.snap || v.kind !== 'CVE') return out;
  out.kev = S.snap.kev?.cves?.[v.id] || null;
  out.epss = S.snap.epss?.scores?.[v.id] || null;
  out.rung = ladder(v.id, S.snap, !!v.exposed);
  return out;
}

function register(body, _, sec) {
  const ws = S.ws, V = ws.vulns;
  const rows = V.map(v => Object.assign({ v }, enrich(v)));
  const kev = rows.filter(r => r.kev).length, hi = rows.filter(r => r.rung && r.rung.rung >= 4 && r.v.exposed).length;
  body.append(el('div', 'grid g5',
    kpi('Register entries', n0(V.length)), kpi('Exposure confirmed', n0(V.filter(v => v.exposed).length), 'pass the C4 gate'),
    kpi('In CISA KEV', S.snap ? n0(kev) : '—', S.snap ? 'snapshot ' + S.snap.retrieved : 'load a snapshot', kev ? 'bad' : ''),
    kpi('Exposed at rung ≥ 4', S.snap ? n0(hi) : '—', 'propose Pb(ψ,A) ≥ 0.70', hi ? 'bad' : ''),
    kpi('Not linked to a scenario', n0(V.filter(v => !scenariosFor(v.id).length).length), 'coverage gap')));
  if (!S.snap) body.append(banner('warn', 'No threat-context snapshot loaded', el('span', null, 'KEV, EPSS and ladder columns stay empty until one is. ', el('a', { href: '#/threat' }, 'Load or generate a snapshot →'))));

  // add form
  const id = el('input', { placeholder: 'CVE-2026-12345 (several allowed)', class: 'mono' });
  const prod = el('input', { placeholder: 'Vendor / product' });
  const asset = el('input', { placeholder: 'Asset or system (CMDB reference)' });
  const exp = el('input', { type: 'checkbox', checked: true });
  body.append(card(el('h2', null, 'Add vulnerabilities'), el('div', 'grid g4', field('<b>CVE ID(s)</b>', id), field('Product', prod), field('Asset', asset),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)', alignSelf: 'end' } }, exp, 'Exposure confirmed (inventory or scan evidence)')),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: () => {
      const ids = [...new Set((id.value.match(/CVE-\d{4}-\d{4,}/gi) || []).map(x => x.toUpperCase()))];
      if (!ids.length) { toast('Enter at least one CVE identifier', 'bad'); return; }
      let n = 0;
      for (const c of ids) { const ex = V.find(v => v.id === c); if (ex) { if (exp.checked) ex.exposed = true; if (prod.value) ex.product = prod.value; if (asset.value) ex.asset = asset.value; continue; } V.push({ id: c, kind: 'CVE', title: '', product: prod.value, asset: asset.value, exposed: exp.checked, source: 'Manual entry', added: today(), cwe: [], notes: '' }); n++; }
      touch(); toast(`${n} added, ${ids.length - n} updated`); render(sec);
    } }, 'Add'),
    el('button', { class: 'btn ghost', onclick: () => { let n = 0; for (const s of ws.assessment.SCEN) for (const c of s.cves || []) if (!V.some(v => v.id === c)) { V.push({ id: c, kind: 'CVE', title: '', product: '', asset: '', exposed: false, source: 'Linked from ' + s.id, added: today(), cwe: [], notes: '' }); n++; } touch(); toast(n + ' CVEs pulled from scenarios'); render(sec); } }, 'Pull CVEs linked in scenarios'),
    /* 1.5.5 — not every organization has scanner output, and the register half of Process step 4 asks
       for an entry, not for a CVE. A weakness you know about belongs here: "the billing server still
       runs an unsupported OS" is a vulnerability whether or not anyone has given it a number. */
    el('button', { class: 'btn ghost', onclick: () => {
      const t = (window.prompt('Describe the weakness in a few words — no CVE needed. For example: “Remote access accepts push-approval MFA without number matching”.') || '').trim();
      if (!t) return;
      let n = 0; for (const v of V) { const m = /^W-(\d+)$/.exec(v.id); if (m) n = Math.max(n, +m[1]); }
      const w = { id: 'W-' + String(n + 1).padStart(3, '0'), kind: 'Weakness', title: t.slice(0, 200),
                  product: prod.value, asset: asset.value, exposed: exp.checked, source: 'Manual entry',
                  added: today(), cwe: [], notes: '' };
      V.push(w); touch(); toast(`${w.id} added — a named weakness, no CVE`); render(sec);
    } }, 'Add a weakness without a CVE'),
    el('button', { class: 'btn ghost', onclick: () => { links.scope(null); go('vulns/links'); } }, 'Suggest links to scenarios…'),
    el('button', { class: 'btn ghost', disabled: !V.some(v => v.exposed), onclick: () => go('threat/join') }, 'Place exposed CVEs on the ladder →'),
    el('button', { class: 'btn ghost', disabled: !V.length, onclick: () => download('vulnerability-register.csv', toCSV([['cve', 'product', 'asset', 'exposure_confirmed', 'cvss', 'cwe', 'kev_added', 'kev_ransomware', 'epss', 'epss_percentile', 'ladder_rung', 'scenarios', 'source', 'notes'],
      ...rows.map(r => [r.v.id, r.v.product, r.v.asset, r.v.exposed ? 'yes' : 'no', r.v.cvss ?? '', (r.v.cwe || []).join(';'), r.kev?.added ?? '', r.kev?.ransomware ?? '', r.epss?.[0] ?? '', r.epss?.[1] ?? '', r.rung?.rung ?? '', scenariosFor(r.v.id).map(s => s.id).join(';'), r.v.source, r.v.notes])])) }, 'Export CSV'))));

  if (!V.length) { body.append(card(el('div', 'empty-state', el('b', null, 'The register is empty'), 'Add CVEs above, add a named weakness with no CVE, import a scanner export or NVD records, or pull those already linked in scenarios.'))); return; }
  const cols = [
    { key: 'id', label: 'CVE', render: r => el('a', { href: '#/vulns/' + r.v.id, class: 'mono' }, r.v.id), sort: r => r.v.id },
    { key: 'p', label: 'Product · asset', render: r => el('div', null, r.v.title || r.v.product || '—', r.v.asset ? el('div', 'small muted', r.v.asset) : null), sort: r => r.v.product },
    { key: 'exp', label: 'Exposed', render: r => { const c = el('input', { type: 'checkbox', checked: !!r.v.exposed, title: 'Exposure confirmed' }); c.addEventListener('change', () => { r.v.exposed = c.checked; touch(); render(sec); }); return c; }, sort: r => r.v.exposed ? 1 : 0 },
    { key: 'cvss', label: 'CVSS', num: true, render: r => r.v.cvss != null && r.v.cvss !== '' ? Number(r.v.cvss).toFixed(1) : '—', sort: r => r.v.cvss ?? -1 },
    { key: 'cwe', label: 'CWE', sortable: false, render: r => el('div', 'chips', ...(r.v.cwe || []).map(c => chip(c, { kind: 'c', href: '#/vulns/' + c, title: cwe(c)?.name }))) },
    { key: 'kev', label: 'KEV', render: r => r.kev ? pill('KEV ' + (r.kev.added || '') + (r.kev.ransomware === 'Known' ? ' · ransomware' : ''), 'bad') : (S.snap ? 'no' : '—'), sort: r => r.kev ? 1 : 0 },
    { key: 'epss', label: 'EPSS', num: true, render: r => r.epss ? n2(r.epss[0] * 100) + '%' : '—', sort: r => r.epss?.[0] ?? -1 },
    { key: 'rung', label: 'Ladder', render: r => r.rung ? el('span', null, rungPill(r.rung), r.v.exposed ? '' : el('span', 'small muted', ' watch')) : '—', sort: r => r.rung?.rung ?? 0 },
    { key: 'sc', label: 'Scenarios', sortable: false, render: r => { const ss = scenariosFor(r.v.id); return el('div', 'chips', ...ss.map(s => chip(s.id, { href: '#/scenario/' + s.id, title: s.name })), linkSel(r.v.id, sec)); } },
    { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ghost danger', onclick: () => { V.splice(V.indexOf(r.v), 1); touch(); render(sec); } }, '×') },
  ];
  body.append(card(el('div', 'tablewrap', table(cols, rows, { sortKey: 'rung', sortDir: -1, class: 'compact' })),
    el('p', 'note', 'An unconfirmed CVE is watch-list context only: whatever its KEV or EPSS signal, it must not move a parameter (C4). Tick "Exposed" only with inventory, CMDB or scanner evidence.')));
}

function linkSel(id, sec) {
  const opts = S.ws.assessment.SCEN.filter(s => !(s.cves || []).includes(id) && !(s.cwe || []).includes(id));
  if (!opts.length) return null;
  const sel = select([['', '+ link'], ...opts.map(s => [s.id, s.id + ' ' + (s.name || '').slice(0, 40)])], '', { style: { width: '90px', padding: '2px 4px', fontSize: '12px' } });
  sel.addEventListener('change', () => { const s = scen(sel.value); if (!s) return; (id.startsWith('CWE') ? s.cwe : s.cves).push(id); touch(); toast(id + ' linked to ' + s.id); render(sec, view === 'register' ? null : id); });
  return sel;
}

/* ---------------- import ---------------- */
function importer(body, _, sec) {
  const V = S.ws.vulns;
  const msg = el('div');
  const upsert = (rec) => {
    const ex = V.find(v => v.id === rec.id);
    if (ex) { for (const [k, v] of Object.entries(rec)) if (v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length)) ex[k] = k === 'exposed' ? ex.exposed || v : v; return 0; }
    V.push(Object.assign({ kind: 'CVE', title: '', product: '', asset: '', exposed: false, source: '', added: today(), cwe: [], notes: '' }, rec)); return 1;
  };
  const fromNvd = (j) => {
    const items = j.vulnerabilities ? j.vulnerabilities.map(x => x.cve) : j.cveMetadata ? [j] : Array.isArray(j) ? j : [];
    let n = 0, m = 0;
    for (const c of items) {
      if (c.cveMetadata) {   // CVE JSON 5 record
        const cna = c.containers?.cna || {};
        const met = (cna.metrics || []).find(x => x.cvssV4_0) || (cna.metrics || []).find(x => x.cvssV3_1);
        const cwes = (cna.problemTypes || []).flatMap(p => p.descriptions || []).map(d => d.cweId).filter(Boolean);
        n += upsert({ id: c.cveMetadata.cveId, title: (cna.descriptions || [])[0]?.value?.slice(0, 300) || '', product: (cna.affected || []).map(a => [a.vendor, a.product].filter(Boolean).join(' ')).slice(0, 2).join('; '),
          cvss: met?.cvssV4_0?.baseScore ?? null, cvss_vector: met?.cvssV4_0?.vectorString ?? null, cvss_version: met?.cvssV4_0 ? '4.0' : met ? '3.1 (not v4 — rescore)' : null, cwe: cwes, source: 'CVE JSON 5 record' });
      } else if (c.id) {     // NVD API 2.0
        const v4 = c.metrics?.cvssMetricV40?.[0]?.cvssData, v31 = c.metrics?.cvssMetricV31?.[0]?.cvssData;
        const cwes = (c.weaknesses || []).flatMap(w => w.description || []).map(d => d.value).filter(x => /^CWE-\d+$/.test(x));
        n += upsert({ id: c.id, title: (c.descriptions || []).find(d => d.lang === 'en')?.value?.slice(0, 300) || '', cvss: v4?.baseScore ?? null, cvss_vector: v4?.vectorString ?? null,
          cvss_version: v4 ? '4.0' : v31 ? '3.1 (not v4 — rescore)' : null, cwe: [...new Set(cwes)], source: 'NVD CVE API 2.0 file' });
      } else m++;
    }
    return [n, items.length];
  };
  const nvdIn = el('input', { type: 'file', accept: '.json', multiple: true, style: { display: 'none' } });
  nvdIn.addEventListener('change', async () => {
    let added = 0, total = 0;
    for (const f of nvdIn.files) { try { const [a, t] = fromNvd(JSON.parse(await f.text())); added += a; total += t; } catch (e) { msg.append(banner('bad', f.name, String(e.message || e))); } }
    touch(); msg.replaceChildren(banner('good', `${total} records read`, `${added} new, ${total - added} updated. Exposure is not set by this import — confirm it per CVE.`));
  });
  const csvTa = el('textarea', { class: 'code', rows: 7, placeholder: 'Scanner or CMDB export with a header row. Recognized columns: cve, host / asset, product / plugin name, cvss, cwe.\nEvery row of a scanner export is evidence of exposure on that host.' });
  const csvExp = el('input', { type: 'checkbox', checked: true });
  const csvIn = el('input', { type: 'file', accept: '.csv,.tsv,.txt', style: { display: 'none' } });
  csvIn.addEventListener('change', async () => { csvTa.value = await csvIn.files[0].text(); });
  body.append(
    card(el('h2', null, 'NVD or CVE.org records (JSON)'),
      el('p', 'note', 'Download records yourself — the NVD CVE API 2.0 response (nvd.nist.gov) or CVE JSON 5 records (cve.org / the CVEProject cvelistV5 bulk repository) — then open them here. Bulk or saved files keep C5: the app never queries an API with your CVE list. CVSS v4.0 Base vectors are kept; v3.1-only records are flagged for rescoring.'),
      el('div', 'btnrow', el('button', { class: 'btn', onclick: () => nvdIn.click() }, 'Open JSON files…'), nvdIn)),
    card(el('h2', null, 'Scanner or inventory export (CSV)'), csvTa,
      el('div', 'btnrow', { style: { marginTop: '10px' } },
        el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)', margin: 0 } }, csvExp, 'Mark imported CVEs as exposure confirmed'),
        el('button', { class: 'btn ghost', onclick: () => csvIn.click() }, 'Open CSV…'), csvIn,
        el('button', { class: 'btn', onclick: () => {
          const rows = parseCSV(csvTa.value); if (rows.length < 2) { msg.replaceChildren(banner('warn', 'Nothing to import', 'A header row and at least one data row are required.')); return; }
          const h = rows[0].map(x => x.trim().toLowerCase());
          const col = (...names) => h.findIndex(x => names.some(n => x === n || x.includes(n)));
          const ci = col('cve'), hi = col('host', 'asset', 'ip', 'hostname', 'device'), pi = col('product', 'plugin name', 'name', 'software', 'title'), si = col('cvss'), wi = col('cwe');
          let n = 0, seen = 0;
          for (const r of rows.slice(1)) {
            const ids = ci >= 0 ? (r[ci] || '').match(/CVE-\d{4}-\d{4,}/gi) || [] : (r.join(' ').match(/CVE-\d{4}-\d{4,}/gi) || []);
            for (const c of ids) {
              seen++;
              const host = hi >= 0 ? r[hi] : '';
              const ex = V.find(v => v.id === c.toUpperCase());
              if (ex && host && !(ex.asset || '').includes(host)) ex.asset = [ex.asset, host].filter(Boolean).join(', ').slice(0, 300);
              n += upsert({ id: c.toUpperCase(), product: pi >= 0 ? r[pi] : '', asset: ex ? ex.asset : host, cvss: si >= 0 && r[si] ? Number(r[si]) : null, cwe: wi >= 0 ? (r[wi].match(/CWE-\d+/gi) || []).map(x => x.toUpperCase()) : [], exposed: csvExp.checked, source: 'Scanner / CMDB import ' + today() });
            }
          }
          touch(); msg.replaceChildren(banner('good', `${seen} CVE occurrences read`, `${n} new register entries.`));
        } }, 'Import'))),
    card(el('h2', null, 'Other sources to consult'), el('ul', 'small', ...[
      ['CISA Known Exploited Vulnerabilities', 'enters through the threat-context snapshot'], ['FIRST EPSS', 'enters through the threat-context snapshot'],
      ['NVD (CVE API 2.0)', 'CVSS Base vectors and CWE — save records and import above'], ['CVE.org / cvelistV5', 'authoritative CVE JSON 5 records'],
      ['MITRE CWE and CWE Top 25', 'bundled — see the CWE explorer'], ['Vendor and national advisories (CCCS, CISA, NCSC, ENISA)', 'analyst-reviewed narrative, recorded as evidence'],
      ['OSV.dev, GitHub Security Advisories', 'open-source package vulnerabilities — export and import as CSV'],
    ].map(([a, b]) => el('li', null, el('b', null, a), ' — ' + b)))), msg);
}

/* ---------------- CWE ---------------- */
function cweView(body, arg, sec) {
  const id = arg && arg.startsWith('CWE') && cwe(arg) ? arg : null;
  const q = el('input', { placeholder: 'Search CWE — ID or words (e.g. 287, authorization, injection)' });
  const list = el('div');
  const draw = () => {
    const ids = searchCwe(q.value, 60);
    list.replaceChildren(table([
      { key: 'id', label: 'CWE', render: x => el('a', { href: '#/vulns/' + x, class: 'mono' }, x) },
      { key: 'name', label: 'Weakness', render: x => cwe(x).name },
      { key: 'top', label: 'Top 25', num: true, render: x => cwe(x).top25 ? '#' + cwe(x).top25 : '', sort: x => cwe(x).top25 || 99 },
      { key: 'att', label: 'ATT&CK links', num: true, render: x => n0(techniquesForCwe(x).length), sort: x => techniquesForCwe(x).length },
      { key: 'sc', label: 'Scenarios', num: true, render: x => n0(scenariosFor(x).length), sort: x => scenariosFor(x).length },
    ], ids, { class: 'compact' }));
  };
  q.addEventListener('input', draw); draw();
  if (id) {
    const c = cwe(id), techs = techniquesForCwe(id), sc = scenariosFor(id), regs = S.ws.vulns.filter(v => (v.cwe || []).includes(id));
    body.append(card(el('div', 'row', el('div', { style: { flex: 1 } }, el('div', 'mono small muted', id + ' · ' + (c.abstraction || '') + (c.top25 ? ' · ' + KB.meta.cwe.top25 + ' #' + c.top25 : '')),
      el('h2', { style: { textTransform: 'none', fontSize: '19px', color: 'var(--ink)', margin: '2px 0 8px', letterSpacing: 0 } }, c.name)),
      el('a', { class: 'btn ghost sm', href: c.url, target: '_blank', rel: 'noopener' }, 'cwe.mitre.org ↗')), el('p', null, c.desc)),
      el('div', 'cols2',
        card(el('h2', null, `Scenarios with this weakness (${sc.length})`), ...sc.map(s => el('div', null, el('a', { href: '#/scenario/' + s.id }, s.id + ' — ' + s.name))), sc.length ? null : el('p', 'note', 'None yet.'),
          el('div', 'btnrow', { style: { marginTop: '10px' } }, linkSel(id, sec), el('button', { class: 'btn sm ghost', onclick: () => { const s = blankScenario(nextScenarioId()); s.name = c.name + ' in [asset]'; s.cwe = [id]; s.attack = techs.slice(0, 3); s.vulns = [c.name]; S.ws.assessment.SCEN.push(s); touch(); go('scenario/' + s.id); } }, 'New scenario from this weakness')),
          regs.length ? el('div', null, el('hr', 'sep'), el('div', 'small muted', 'Register CVEs classified under this CWE:'), el('div', 'chips', ...regs.map(v => chip(v.id, { kind: 'v', href: '#/vulns/' + v.id })))) : null),
        card(el('h2', null, `ATT&CK techniques that exploit it (via CAPEC) — ${techs.length}`), techs.length ? el('div', 'chips', ...techs.map(t => chip(t + ' ' + techName(t), { kind: 't', href: '#/threats/' + t }))) : el('p', 'note', 'No CAPEC pattern links this weakness to an ATT&CK technique.'))));
  }
  body.append(card(el('h2', null, id ? 'Other weaknesses' : `${KB.meta.cwe?.top25} and search (${KB.meta.cwe?.version}, ${n0(KB.meta.cwe?.entries)} entries)`), q, el('div', { style: { marginTop: '10px' } }, list)));
}

/* ---------------- CVE detail ---------------- */
function cveView(body, arg, sec) {
  const id = arg && /^CVE-/i.test(arg) ? arg.toUpperCase() : null;
  if (!id) {
    const inp = el('input', { placeholder: 'CVE-2026-12345', class: 'mono' });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && /CVE-\d{4}-\d{4,}/i.test(inp.value)) go('vulns/' + inp.value.trim().toUpperCase()); });
    body.append(card(field('<b>Look up a CVE in the register and the loaded snapshot</b> (local only)', inp)));
    return;
  }
  const v = S.ws.vulns.find(x => x.id === id) || { id, kind: 'CVE', exposed: false };
  const e = enrich(v), sc = scenariosFor(id);
  const inReg = S.ws.vulns.includes(v);
  body.append(card(el('div', 'row', el('div', { style: { flex: 1 } }, el('div', 'mono small muted', v.kind === 'Weakness' ? 'Weakness' : 'CVE'), el('h2', { style: { textTransform: 'none', fontSize: '19px', color: 'var(--ink)', margin: '2px 0 8px', letterSpacing: 0 } }, id)),
    v.kind === 'Weakness' ? pill('named weakness from the documents', 'warn') : el('a', { class: 'btn ghost sm', href: 'https://nvd.nist.gov/vuln/detail/' + id, target: '_blank', rel: 'noopener' }, 'NVD ↗'), v.kind === 'Weakness' ? null : el('a', { class: 'btn ghost sm', href: 'https://www.cve.org/CVERecord?id=' + id, target: '_blank', rel: 'noopener' }, 'CVE.org ↗')),
    v.title ? el('p', null, v.title) : null,
    el('div', 'grid g4', kpi('In register', inReg ? 'yes' : 'no', inReg ? v.source : ''), kpi('Exposure', v.exposed ? 'confirmed' : 'not confirmed', v.asset || '', v.exposed ? 'good' : 'warn'),
      kpi('CISA KEV', S.snap ? (e.kev ? 'listed ' + (e.kev.added || '') : 'not listed') : '—', e.kev ? [e.kev.vendor, e.kev.product].filter(Boolean).join(' ') + (e.kev.ransomware === 'Known' ? ' · ransomware' : '') : '', e.kev ? 'bad' : ''),
      kpi('EPSS', e.epss ? n2(e.epss[0] * 100) + '%' : '—', e.epss ? 'percentile ' + n2(e.epss[1] * 100) : S.snap ? 'not in snapshot table' : 'no snapshot')),
    e.rung ? el('div', { style: { marginTop: '12px' } }, el('b', null, 'Threat Evidence Ladder: '), rungPill(e.rung), ' ' + e.rung.label + ' — band ' + e.rung.band.map(x => x.toFixed(2)).join('–'), el('div', 'small muted', e.rung.evidence), el('div', 'note', e.rung.note)) : null,
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      inReg ? null : el('button', { class: 'btn', onclick: () => { S.ws.vulns.push({ id, kind: 'CVE', title: '', product: '', asset: '', exposed: false, source: 'Manual entry', added: today(), cwe: [], notes: '' }); touch(); render(sec, id); } }, 'Add to register'),
      inReg ? el('button', { class: 'btn ghost', onclick: () => { v.exposed = !v.exposed; touch(); render(sec, id); } }, v.exposed ? 'Mark exposure unconfirmed' : 'Confirm exposure') : null)),
    card(el('h2', null, `Scenarios (${sc.length})`), ...sc.map(s => el('div', null, el('a', { href: '#/scenario/' + s.id }, s.id + ' — ' + s.name))), el('div', 'btnrow', { style: { marginTop: '8px' } }, linkSel(id, sec))),
    (v.cwe || []).length ? card(el('h2', null, 'Weakness types'), el('div', 'chips', ...v.cwe.map(c => chip(c + ' ' + (cwe(c)?.name || ''), { kind: 'c', href: '#/vulns/' + c })))) : null);
}
