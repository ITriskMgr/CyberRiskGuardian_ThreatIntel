/* importer.js — import more of the risk assessment from the workspace's context documents (1.5.4,
   proof of concept).

   Beyond the profile and the crown jewels (extractor.js), fourteen targets can be pre-filled from the
   same documents, each with the same propose → review → accept approach and the same provenance tags
   (FACT, INFERENCE, ASSUMPTION, EXTERNAL, UNKNOWN):

     information assets · business impact (BIA) · third parties · existing controls → mitigation plan ·
     compliance · incidents · vulnerabilities (named weaknesses) · candidate scenarios · parameter
     evidence · existing risk register · budget · KRIs · people and roles · classroom setting

   Each target has an AI task (extract_s_* — sensitive, routed to the local model by default — or
   extract_m_*) and, where a transparent rule can do useful work, a rules method that runs offline.
   Rules:
     • Nothing is written until the analyst ticks a proposal and adds it.
     • Extraction never sets a risk parameter value: evidence and rationale only.
     • Existing controls enter the mitigation plan as *implemented* with zero reductions, so no score moves
       until the analyst sets their effect.
     • Every created record keeps {tag, source, method} in `prov`.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch, initArr, PARAMS } from './state.js';
import * as AI from './ai.js';
import { corpus } from './extractor.js';
import { blankAsset, nextAssetId } from './assets.js';
import { blankMeasure } from './catalog.js';
import * as K from './catalog.js';
import * as SG from './safeguards.js';
import { blankRisk } from './registry.js';
import { today, uid } from './util.js';

const TAGS = ['FACT', 'INFERENCE', 'ASSUMPTION', 'EXTERNAL', 'UNKNOWN'];
const tagOf = t => TAGS.includes(String(t || '').toUpperCase()) ? String(t).toUpperCase() : 'INFERENCE';
const str = (x, n = 300) => String(x ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const num = (x, d = 0) => { const v = Number(String(x ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(v) ? v : d; };
const lvl = (x, max = 5) => Math.max(0, Math.min(max, Math.round(num(x, 0))));
const list = x => Array.isArray(x) ? x.map(v => str(v, 120)).filter(Boolean) : String(x || '').split(/\s*[;,]\s*/).filter(Boolean);
const norm = s => String(s || '').toLowerCase().trim();
const sentences = text => text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 500);
const findAsset = (ws, name) => { const n = norm(name); return n ? (ws.assets || []).find(a => norm(a.name) === n) || (ws.assets || []).find(a => n.length > 3 && (norm(a.name).includes(n) || n.includes(norm(a.name)))) : null; };

/* ---------------- the targets ----------------
   id, label, feature (s = sensitive → local by default, m = more), screen (route), JSON shape for the model,
   columns of the review table [key, label, editable?], rules(text, ws) → items, apply(items, ws) → count. */
export const SECTIONS = [
  { id: 'assets', s: true, label: 'Information assets', route: 'assets', value: 'High',
    what: 'Systems, applications, data sets and services: owner, type, classification, C/I/A, hosting, vendor/product, dependencies.',
    shape: '{"items":[{"name":"","type":"application|server|data|network|cloud|service|hardware|iot","owner":"","classification":"Public|Internal|Confidential|Restricted","c":1-5,"i":1-5,"a":1-5,"hosting":"cloud|on-premises|hybrid|saas","vendor":"","product":"","depends_on":["<other asset names>"],"tag":"","source":""}]}',
    cols: [['name', 'Asset', true], ['type', 'Type', true], ['owner', 'Owner', true], ['classification', 'Classification', true], ['cia', 'C/I/A'], ['hosting', 'Hosting', true], ['product', 'Vendor / product', true], ['depends_on', 'Depends on']],
    rules(text) {
      const re = /\b(EHR|ERP|CRM|SAP\b[^.;,]{0,20}|Microsoft 365|Office 365|Active Directory|Entra ID|Salesforce|payroll system|billing system|scheduling system|patient portal|data cent(?:er|re)|VPN|firewall|backup (?:server|system)s?|MES|SCADA|PACS|LIS|website|e-?commerce platform)\b/gi;
      const seen = new Map();
      for (const s of sentences(text)) for (const m of s.matchAll(re)) { const k = m[0].trim(); if (!seen.has(norm(k))) seen.set(norm(k), { name: k, type: /data cent|server/i.test(k) ? 'server' : /VPN|firewall/i.test(k) ? 'network' : 'application', tag: 'FACT', source: s.slice(0, 160) }); }
      return [...seen.values()].slice(0, 40);
    },
    apply(items, ws) {
      ws.assets ||= []; let n = 0; const made = [];
      for (const it of items) {
        if (findAsset(ws, it.name)) continue;
        const a = blankAsset({ id: nextAssetId(ws), name: str(it.name, 120), type: ['application', 'server', 'data', 'network', 'hardware', 'iot', 'supplier', 'people', 'facility'].includes(it.type) ? it.type : (it.type === 'cloud' || it.type === 'service' ? 'application' : 'application'),
          owner: str(it.owner, 80), classification: ['Public', 'Internal', 'Confidential', 'Restricted'].includes(it.classification) ? it.classification : 'Internal',
          cia: { c: lvl(it.c || 3) || 3, i: lvl(it.i || 3) || 3, a: lvl(it.a || 3) || 3 }, vendor: str(it.vendor, 80), product: str(it.product, 80),
          location: str(it.hosting, 40), tags: it.hosting ? [norm(it.hosting)] : [], desc: it.source ? 'From documents: ' + str(it.source, 200) : '' });
        a.prov = prov(it); ws.assets.push(a); made.push([a, it]); n++;
      }
      for (const [a, it] of made) a.deps = list(it.depends_on).map(d => findAsset(ws, d)?.id).filter(x => x && x !== a.id);
      return n;
    } },
  { id: 'bia', s: true, label: 'Business impact (BIA)', route: 'assets', value: 'High',
    what: 'Recovery time (RTO), data-loss tolerance (RPO), maximum tolerable downtime, financial and operational impact, the processes each asset supports.',
    shape: '{"items":[{"asset":"<asset name>","rto_hours":0,"rpo_hours":0,"mtd_hours":0,"financial":0-5,"operational":0-5,"legal":0-5,"reputational":0-5,"safety":0-5,"processes":"","tag":"","source":""}]}',
    cols: [['asset', 'Asset', true], ['rto_hours', 'RTO (h)', true], ['rpo_hours', 'RPO (h)', true], ['mtd_hours', 'MTD (h)', true], ['impact', 'Impact F/O/L/R/S'], ['processes', 'Processes', true]],
    rules(text) {
      const out = [];
      for (const s of sentences(text)) {
        const rto = /\bRTO\b[^0-9]{0,20}(\d+(?:\.\d+)?)\s*(h|hours?|heures?|days?|jours?|min)/i.exec(s), rpo = /\bRPO\b[^0-9]{0,20}(\d+(?:\.\d+)?)\s*(h|hours?|heures?|days?|jours?|min)/i.exec(s);
        if (!rto && !rpo) continue;
        const h = m => !m ? '' : /day|jour/i.test(m[2]) ? +m[1] * 24 : /min/i.test(m[2]) ? +m[1] / 60 : +m[1];
        out.push({ asset: (/(?:for|of|pour|du|de la)\s+(?:the\s+)?([A-Z][\w\- ]{2,40})/.exec(s) || [])[1] || '', rto_hours: h(rto), rpo_hours: h(rpo), tag: 'FACT', source: s.slice(0, 200) });
      }
      return out.slice(0, 30);
    },
    apply(items, ws) {
      let n = 0;
      for (const it of items) {
        let a = findAsset(ws, it.asset);
        if (!a) { a = blankAsset({ id: nextAssetId(ws), name: str(it.asset || 'Service from documents', 120), type: 'application' }); a.prov = prov(it); (ws.assets ||= []).push(a); }
        const b = a.bia ||= {};
        if (it.rto_hours !== '' && it.rto_hours != null) b.rto = String(num(it.rto_hours));
        if (it.rpo_hours !== '' && it.rpo_hours != null) b.rpo = String(num(it.rpo_hours));
        if (it.mtd_hours !== '' && it.mtd_hours != null) b.mtd = String(num(it.mtd_hours));
        for (const [k, f] of [['fin', 'financial'], ['ops', 'operational'], ['legal', 'legal'], ['rep', 'reputational'], ['safety', 'safety']]) if (it[f] !== undefined && it[f] !== '') b[k] = lvl(it[f]);
        if (it.processes) b.processes = str(it.processes, 300);
        a.biaProv = prov(it); n++;
      }
      return n;
    } },
  { id: 'suppliers', s: false, label: 'Third parties', route: 'assets', value: 'Medium–high',
    what: 'Suppliers, what they provide, their access (remote, data, hosting), contract or certification status.',
    shape: '{"items":[{"name":"","provides":"","access":"remote|data|hosting|none","contract":"","certification":"","criticality":"High|Medium|Low","tag":"","source":""}]}',
    cols: [['name', 'Supplier', true], ['provides', 'Provides', true], ['access', 'Access', true], ['certification', 'Contract / certification', true], ['criticality', 'Criticality', true]],
    rules(text) {
      const out = new Map();
      for (const s of sentences(text)) {
        if (!/\b(vendor|supplier|provider|outsourc|contractor|fournisseur|prestataire|managed service|MSP|SaaS)\b/i.test(s)) continue;
        for (const m of s.matchAll(/\b([A-Z][A-Za-z0-9&.\-]+(?:\s[A-Z][A-Za-z0-9&.\-]+){0,3})\b/g)) {
          const nm = m[1]; if (nm.length < 3 || /^(The|A|An|Our|This|We|Le|La|Les|Un|Une|In|For|All|Each)$/.test(nm.split(' ')[0])) continue;
          if (!out.has(norm(nm))) out.set(norm(nm), { name: nm, provides: '', access: /remote|VPN|access/i.test(s) ? 'remote' : /host|cloud|SaaS/i.test(s) ? 'hosting' : '', tag: 'INFERENCE', source: s.slice(0, 200) });
        }
      }
      return [...out.values()].slice(0, 25);
    },
    apply(items, ws) {
      let n = 0;
      for (const it of items) {
        if (findAsset(ws, it.name)) continue;
        const a = blankAsset({ id: nextAssetId(ws), name: str(it.name, 120), type: 'supplier', desc: [it.provides && 'Provides: ' + str(it.provides, 200), it.access && 'Access: ' + it.access, it.contract && 'Contract: ' + str(it.contract, 120), it.certification && 'Certification: ' + str(it.certification, 120)].filter(Boolean).join(' · '),
          tags: ['third-party', it.access].filter(Boolean), cia: { c: 3, i: 3, a: it.criticality === 'High' ? 4 : 3 } });
        a.prov = prov(it); (ws.assets ||= []).push(a); n++;
      }
      return n;
    } },
  { id: 'controls', s: true, label: 'Existing controls → Existing safeguards', route: 'safeguards', value: 'High',
    what: 'Controls already in place, mapped to ISO/IEC 27002, NIST CSF or CIS, with stated maturity. They go to the inventory of existing safeguards — not to the treatment plan, which is for measures you propose to add.',
    shape: '{"items":[{"name":"","description":"","function":"Governance|Prevention|Detection|Response|Recovery","refs":["ISO22:8.5","CSF2:PR.AA-01","CIS81:6.3"],"maturity":0-5,"evidence":"","tag":"","source":""}]}',
    cols: [['name', 'Control', true], ['function', 'Function', true], ['refs', 'Framework references', true], ['maturity', 'Maturity', true], ['evidence', 'Evidence', true]],
    rules(text) {
      const D = [['Multi-factor authentication', /\b(MFA|multi-factor|two-factor|2FA|authentification (?:à|multi)facteur)/i, 'Prevention', ['ISO22:8.5', 'CIS81:6.3']],
        ['Endpoint detection and response (EDR)', /\b(EDR|XDR|endpoint detection|antivirus|anti-malware|antimalware)\b/i, 'Detection', ['ISO22:8.7', 'CIS81:10.1']],
        ['Backups', /\b(backups?|sauvegardes?)\b/i, 'Recovery', ['ISO22:8.13', 'CIS81:11.2']],
        ['Firewall / network filtering', /\b(firewalls?|pare-feu|IDS|IPS)\b/i, 'Prevention', ['ISO22:8.20', 'CIS81:13.1']],
        ['Security monitoring (SIEM / SOC)', /\b(SIEM|SOC|security operations cent|log monitoring|journalisation)\b/i, 'Detection', ['ISO22:8.16', 'CIS81:8.2']],
        ['Encryption', /\b(encrypt|chiffr)/i, 'Prevention', ['ISO22:8.24', 'CIS81:3.11']],
        ['Security awareness training', /\b(awareness|phishing simulation|training|sensibilisation)\b/i, 'Prevention', ['ISO22:6.3', 'CIS81:14.1']],
        ['Patch / vulnerability management', /\b(patch|vulnerability scan|correctif)/i, 'Prevention', ['ISO22:8.8', 'CIS81:7.1']],
        ['Privileged access management', /\b(PAM|privileged access|least privilege)\b/i, 'Prevention', ['ISO22:8.2', 'CIS81:5.4']],
        ['Incident response plan', /\b(incident response plan|IR plan|plan de réponse)/i, 'Response', ['ISO22:5.24', 'CIS81:17.4']],
        ['Business continuity / disaster recovery plan', /\b(business continuity|disaster recovery|DRP|BCP|continuité des affaires|reprise après sinistre)\b/i, 'Recovery', ['ISO22:5.30']]];
      const out = [];
      const ss = sentences(text);
      for (const [n, re, fn, refs] of D) { const s = ss.find(x => re.test(x) && !/\b(no|not|lack|without|absence|aucun|pas de|sans)\b/i.test(x)); if (s) out.push({ name: n, function: fn, refs, evidence: s.slice(0, 200), tag: 'INFERENCE', source: s.slice(0, 200) }); }
      return out;
    },
    /* 1.5.5 — these go to the inventory of what is in force, not to the treatment portfolio. The
       capability contribution is seeded from the stated function and marked for review: a function is
       a hint about resilience, not a measurement of it. */
    apply(items, ws) {
      ws.safeguards ||= []; let n = 0;
      const all = new Set(K.controls().map(c => c.key));
      const FN_CAP = { Governance: {}, Prevention: { prevent: 2 }, Detection: { detect: 2 },
                       Response: { respond: 2, contain: 1 }, Recovery: { recover: 2, continuity: 1 } };
      const FN_KIND = { Governance: 'governance', Prevention: 'technical', Detection: 'technical',
                        Response: 'process', Recovery: 'technical' };
      for (const it of items) {
        if ((ws.safeguards || []).some(g => norm(g.name) === norm(it.name))) continue;
        const refs = [...new Set(list(it.refs).map(normRef).filter(r => all.has(r)))];
        const fn = ['Governance', 'Prevention', 'Detection', 'Response', 'Recovery'].includes(it.function) ? it.function : 'Prevention';
        const mat = it.maturity !== undefined && it.maturity !== '' ? lvl(it.maturity) : null;
        const g = SG.blank({
          name: str(it.name, 120), desc: str(it.description, 400), kind: FN_KIND[fn] || 'technical',
          // The documents say it exists; they rarely say it covers everything. Anything below a stated
          // maturity of 3 is recorded as partly in place rather than claimed as fully operating.
          state: mat !== null && mat < 3 ? 'partial' : 'in-place',
          ctl: refs, cap: { ...(FN_CAP[fn] || {}) }, conf: 'Low',
          evidence: str(it.evidence || it.source, 300),
          note: `Found in the documents${mat !== null ? ` — stated maturity ${mat}/5` : ''}. Review its scope, its owner, `
              + `its contribution to each resilience capability and when it was last shown to work.`,
        }, ws);
        g.prov = prov(it); ws.safeguards.push(g); n++;
      }
      return n;
    } },
  { id: 'compliance', s: false, label: 'Compliance', route: 'compliance', value: 'Medium–high',
    what: 'Applicable frameworks, maturity per control, audit findings as gaps.',
    shape: '{"items":[{"framework":"ISO22|CSF2|NIST-53|CIS81","control":"<control id, e.g. 5.15 or PR.AA-01>","status":"implemented|partial|not-started|na","maturity":0-5,"finding":"","tag":"","source":""}]}',
    cols: [['framework', 'Framework', true], ['control', 'Control', true], ['status', 'Status', true], ['maturity', 'Maturity', true], ['finding', 'Finding (gap)', true]],
    rules: null,
    apply(items, ws) {
      const C = ws.compliance ||= { frameworks: [], soa: {}, checklists: {} };
      const all = new Map(K.controls().map(c => [c.key, c])); let n = 0;
      for (const it of items) {
        const key = `${str(it.framework, 20)}:${str(it.control, 30)}`;
        if (!all.has(key)) continue;
        if (!C.frameworks.includes(it.framework)) C.frameworks.push(it.framework);
        const r = C.soa[key] ||= {};
        if (['implemented', 'partial', 'not-started', 'na'].includes(it.status)) r.status = it.status;
        if (it.maturity !== '' && it.maturity !== undefined) r.maturity = lvl(it.maturity);
        if (it.finding) r.notes = [r.notes, 'Finding (documents): ' + str(it.finding, 300)].filter(Boolean).join(' · ');
        r.prov = prov(it); n++;
      }
      return n;
    } },
  { id: 'incidents', s: true, label: 'Incidents', route: 'org/evidence', value: 'High',
    what: 'Past incidents: date, type, affected asset, impact, cause — evidence for Pb(A) and Pb(ψ,A).',
    shape: '{"items":[{"date":"YYYY-MM or YYYY-MM-DD","type":"","asset":"","impact":"","cause":"","tag":"","source":""}]}',
    cols: [['date', 'Date', true], ['type', 'Type', true], ['asset', 'Asset', true], ['impact', 'Impact', true], ['cause', 'Cause', true]],
    rules(text) {
      const out = [];
      for (const s of sentences(text)) {
        if (!/\b(incident|breach|ransomware|phishing|outage|compromis|attack|attaque|panne|fuite|intrusion)\b/i.test(s)) continue;
        const d = /\b((?:19|20)\d{2}(?:-\d{2})?(?:-\d{2})?)|\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)[a-zé]*\.?\s+(?:19|20)\d{2})/i.exec(s);
        if (!d) continue;
        out.push({ date: d[0], type: (/ransomware|phishing|breach|outage|DDoS|malware|fraud|intrusion|panne|fuite/i.exec(s) || ['incident'])[0], impact: '', cause: '', tag: 'FACT', source: s.slice(0, 220) });
      }
      return out.slice(0, 30);
    },
    apply(items, ws) {
      ws.incidents ||= []; let n = 0;
      for (const it of items) { ws.incidents.push({ id: 'INC-' + String(ws.incidents.length + 1).padStart(3, '0'), date: str(it.date, 20), type: str(it.type, 80), asset: str(it.asset, 120), impact: str(it.impact, 300), cause: str(it.cause, 300), prov: prov(it) }); n++; }
      return n;
    } },
  { id: 'weaknesses', s: true, label: 'Vulnerabilities (named weaknesses)', route: 'vulns', value: 'High',
    what: 'End-of-life systems, missing MFA, flat network… with the affected asset, the source sentence and a CWE proposal. They enter the vulnerability register as weaknesses.',
    shape: '{"items":[{"weakness":"","asset":"","cwe":"CWE-<n> or empty","tag":"","source":"<the sentence>"}]}',
    cols: [['weakness', 'Weakness', true], ['asset', 'Asset', true], ['cwe', 'CWE', true], ['source', 'Source sentence']],
    rules(text) {
      const P = [[/\b(end[- ]of[- ]life|EOL|unsupported|out of support|Windows (?:7|XP|Server 2008|Server 2012)|fin de vie|non supporté)/i, 'End-of-life or unsupported system', 'CWE-1104'],
        [/\b(no|without|lack of|missing|absence of|sans|pas d['e])\s+(MFA|multi-factor|two-factor|2FA)/i, 'No multi-factor authentication', 'CWE-308'],
        [/\b(flat network|no segmentation|not segmented|réseau plat|sans segmentation)/i, 'Flat network — no segmentation', 'CWE-653'],
        [/\b(shared (?:accounts?|passwords?)|generic accounts?|comptes? partagés?)/i, 'Shared or generic accounts', 'CWE-1391'],
        [/\b(default (?:passwords?|credentials)|mots? de passe par défaut)/i, 'Default credentials', 'CWE-1392'],
        [/\b(unpatched|not patched|missing patches|patch backlog|non corrigé)/i, 'Unpatched systems', 'CWE-1395'],
        [/\b(no (?:offline|immutable) backups?|backups? (?:are )?not tested|untested backups?|sauvegardes? non testées?)/i, 'Backups not isolated or not tested', 'CWE-693'],
        [/\b(plain ?text|unencrypted|not encrypted|non chiffré)/i, 'Sensitive data not encrypted', 'CWE-311'],
        [/\b(excessive privileges?|too many admins?|local admin rights|droits d'administrateur)/i, 'Excessive privileges', 'CWE-250'],
        [/\b(no logging|logs? (?:are )?not (?:collected|reviewed)|sans journalisation)/i, 'Insufficient logging and monitoring', 'CWE-778'],
        [/\b(exposed RDP|RDP (?:open|exposed)|open to the internet|exposé à internet)/i, 'Service exposed to the internet', 'CWE-284']];
      const out = [];
      for (const s of sentences(text)) for (const [re, w, c] of P) if (re.test(s) && !out.some(o => o.weakness === w)) out.push({ weakness: w, asset: '', cwe: c, tag: 'FACT', source: s.slice(0, 220) });
      return out;
    },
    apply(items, ws) {
      ws.vulns ||= []; let n = 0;
      for (const it of items) {
        if (ws.vulns.some(v => v.kind === 'Weakness' && norm(v.title) === norm(it.weakness) && norm(v.asset) === norm(it.asset))) continue;
        const k = ws.vulns.filter(v => v.kind === 'Weakness').length + 1;
        ws.vulns.push({ id: 'W-' + String(k).padStart(3, '0'), kind: 'Weakness', title: str(it.weakness, 160), product: '', asset: str(it.asset, 120), exposed: false,
          source: 'Context documents', added: today(), cwe: /^CWE-\d+$/.test(it.cwe || '') ? [it.cwe] : [], notes: it.source ? 'Source: ' + str(it.source, 300) : '', prov: prov(it) });
        n++;
      }
      return n;
    } },
  { id: 'scenarios', s: false, label: 'Candidate scenarios', route: 'batch', value: 'High',
    what: 'Causal chains the documents describe or imply. They land in the Batch scenarios grid marked [Docs], with default parameters at Low confidence.',
    shape: '{"items":[{"name":"","statement":"<threat source → weakness → asset → event → consequence>","threat_source":"","asset":"","event":"","consequence":"","weakness":"","attack":["T1566"],"tag":"","source":""}]}',
    cols: [['name', 'Scenario', true], ['statement', 'Causal chain', true], ['threat_source', 'Threat source', true], ['asset', 'Asset', true]],
    rules: null,
    apply(items, ws) {
      ws.batchDraft ||= []; let n = 0;
      for (const it of items) {
        ws.batchDraft.push({ pick: true, ai: true, docs: true, name: str(it.name || 'Scenario from documents', 100) + ' [Docs]', statement: str(it.statement, 600), threat_source: str(it.threat_source, 120), assets: str(it.asset, 160),
          vulns: str(it.weakness, 200), attack: list(it.attack).filter(t => /^T\d{4}/.test(t)), cwe: [], cves: [],
          params: Object.fromEntries(PARAMS.map(k => [k, 0.5])), cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', cvss_score: null,
          cvss_note: 'Default vector — set it in the scenario editor.', red_p: 0.5, red_i: 0.5, owner: '', pattern: 'docs',
          rat: Object.fromEntries(PARAMS.map(k => [k, `Default — scenario taken from the documents (${it.tag || 'INFERENCE'}: ${str(it.source, 120)}). Analytical estimate, validation required.`])),
          conf: Object.fromEntries(PARAMS.map(k => [k, 'Low'])), prov: prov(it) });
        n++;
      }
      return n;
    } },
  { id: 'evidence', s: false, label: 'Parameter evidence', route: 'scenario', value: 'Medium',
    what: 'For each scenario parameter, the sentences that support a value — added to Evidence and Rationale, never as a number.',
    shape: '{"items":[{"scenario":"S1","param":"PbA|Pbx|De|Dm|Th|Mu","evidence":"<quoted sentence>","rationale":"<what it suggests, without a number>","tag":"","source":""}]}',
    cols: [['scenario', 'Scenario', true], ['param', 'Parameter', true], ['evidence', 'Evidence', true], ['rationale', 'Rationale', true]],
    rules: null, needsScenarios: true,
    apply(items, ws) {
      let n = 0;
      for (const it of items) {
        const s = ws.assessment.SCEN.find(x => x.id === it.scenario); const k = it.param;
        if (!s || !PARAMS.includes(k)) continue;
        const p = s.params[k] ||= { v: 0.5, rat: '', ev: '', conf: 'Low' };
        p.ev = [p.ev, `[Docs, ${it.tag || 'FACT'}] ${str(it.evidence, 300)}`].filter(Boolean).join('\n');
        if (it.rationale) p.rat = [p.rat, `[Docs] ${str(it.rationale, 300)}`].filter(Boolean).join('\n');
        n++;
      }
      return n;
    } },
  { id: 'risks', s: false, label: 'Existing risk register', route: 'riskreg', value: 'Medium',
    what: 'Risks already owned by management: owner, rating, treatment decision, acceptances.',
    shape: '{"items":[{"title":"","owner":"","category":"Operational|Strategic|Compliance|Financial|Reputational|Technology","likelihood":1-5,"impact":1-5,"treatment":"Mitigate|Transfer|Avoid|Accept","accepted_by":"","accepted_on":"","tag":"","source":""}]}',
    cols: [['title', 'Risk', true], ['owner', 'Owner', true], ['likelihood', 'L', true], ['impact', 'I', true], ['treatment', 'Treatment', true], ['accepted_by', 'Accepted by', true]],
    rules: null,
    apply(items, ws) {
      ws.risks ||= []; let n = 0;
      for (const it of items) {
        if (ws.risks.some(r => norm(r.title) === norm(it.title))) continue;
        const l = lvl(it.likelihood || 3) || 3, i = lvl(it.impact || 3) || 3;
        const r = blankRisk({ title: str(it.title, 160), owner: str(it.owner, 80), category: str(it.category, 40) || 'Operational', inherent: { l, i }, current: { l, i },
          treatment: ['Mitigate', 'Transfer', 'Avoid', 'Accept'].includes(it.treatment) ? it.treatment : 'Mitigate', desc: it.source ? 'From documents: ' + str(it.source, 300) : '' });
        if (it.accepted_by) r.acceptance = { by: str(it.accepted_by, 80), date: str(it.accepted_on, 20), rationale: 'Recorded in the documents — confirm.' };
        r.prov = prov(it); ws.risks.push(r); n++;
      }
      return n;
    } },
  { id: 'budget', s: false, label: 'Budget', route: 'budget', value: 'Medium',
    what: 'Planned or approved security projects with costs and years (initiatives), and the current spend broken down by staff, tools and services.',
    shape: '{"items":[{"kind":"project|spend","name":"","initial":0,"recurring":0,"year":2026,"status":"planned|approved","staff":0,"tools":0,"services":0,"tag":"","source":""}]}',
    cols: [['kind', 'Kind', true], ['name', 'Project', true], ['initial', 'One-time', true], ['recurring', 'Recurring', true], ['year', 'Year', true], ['split', 'Staff / tools / services']],
    rules(text) {
      const out = [];
      for (const s of sentences(text)) {
        const m = /(project|initiative|programme|program|projet|budget(?:ed)? for)\b[^.]{0,80}?(?:\$|CAD\s?|USD\s?)\s?(\d[\d,. ]*)\s*(k|K|M|million|thousand)?/i.exec(s);
        if (!m) continue;
        let v = num(m[2]); if (/k|thousand/i.test(m[3] || '')) v *= 1e3; if (/M|million/.test(m[3] || '')) v *= 1e6;
        out.push({ kind: 'project', name: s.slice(0, 80), initial: Math.round(v), recurring: 0, year: (/(20\d{2})/.exec(s) || [])[1] || '', tag: 'FACT', source: s.slice(0, 200) });
      }
      return out.slice(0, 20);
    },
    apply(items, ws) {
      let n = 0; const A = ws.assessment;
      for (const it of items) {
        if (it.kind === 'spend') { ws.budget ||= {}; ws.budget.breakdown = { staff: num(it.staff), tools: num(it.tools), services: num(it.services), prov: prov(it) }; n++; continue; }
        const id = 'I' + String((A.INITIATIVES || []).length + 1);
        A.INITIATIVES.push(initArr({ id, name: str(it.name, 120), desc: 'From documents' + (it.status ? ` (${it.status})` : '') + (it.source ? ': ' + str(it.source, 200) : ''), scenarios: [], owner: '', priority: 'Medium',
          initial: num(it.initial), recurring: num(it.recurring), start: it.year ? String(it.year) : '', end: '', success: '', dependencies: '', type: 'Mitigate' }));
        n++;
      }
      return n;
    } },
  { id: 'kris', s: false, label: 'KRIs', route: 'dashboard', value: 'Medium',
    what: 'Metrics the organization already tracks, with current values and targets — the current value becomes the first reading on the KRI dashboard.',
    shape: '{"items":[{"name":"","value":0,"unit":"%|days|count","date":"YYYY-MM-DD","target":"","warning":"","critical":"","owner":"","frequency":"Monthly","tag":"","source":""}]}',
    cols: [['name', 'Indicator', true], ['value', 'Value', true], ['unit', 'Unit', true], ['target', 'Target', true], ['date', 'Date', true]],
    rules(text) {
      const out = [];
      for (const s of sentences(text)) {
        const m = /(\d{1,3}(?:[.,]\d+)?)\s?%\s+(?:of\s+)?([a-z][^.,;]{8,80})/i.exec(s);
        if (!m || !/\b(MFA|patch|phishing|backup|EDR|coverage|accounts?|vulnerabilit|devices?|endpoints?|staff|employees|systems?)\b/i.test(m[2])) continue;
        out.push({ name: m[2].replace(/\s+(are|is|were|was|have|has)\b.*$/i, '').slice(0, 70), value: num(m[1].replace(',', '.')), unit: '%', date: today(), tag: 'FACT', source: s.slice(0, 200) });
      }
      return out.slice(0, 15);
    },
    apply(items, ws) {
      const A = ws.assessment; let n = 0; ws.kriHistory ||= [];
      for (const it of items) {
        let row = A.KRIS.find(k => norm(k[1]) === norm(it.name));
        if (!row) { row = ['KRI-' + String(A.KRIS.length + 1).padStart(2, '0'), str(it.name, 100), '', 'From documents', 'Context documents', str(it.owner, 60), str(it.frequency, 20) || 'Monthly', str(it.target, 30), str(it.warning, 30), str(it.critical, 30)]; A.KRIS.push(row); }
        if (it.value !== '' && it.value !== undefined && Number.isFinite(num(it.value, NaN))) {
          const date = /^\d{4}-\d{2}(-\d{2})?$/.test(it.date || '') ? (it.date.length === 7 ? it.date + '-01' : it.date) : today();
          let h = ws.kriHistory.find(x => x.date === date && x.note === 'From documents');
          if (!h) { h = { date, values: {}, note: 'From documents' }; ws.kriHistory.push(h); }
          h.values[row[0]] = num(it.value);
        }
        n++;
      }
      return n;
    } },
  { id: 'people', s: false, label: 'People and roles', route: 'org/evidence', value: 'Medium',
    what: 'Named roles (CISO, risk owner, privacy officer, process owners) — proposed as owners and, in multi-user mode, as users with a starting RACI template.',
    shape: '{"items":[{"role":"","name":"","responsibilities":"","raci_template":"viewer|analyst|owner|manager","tag":"","source":""}]}',
    cols: [['role', 'Role', true], ['name', 'Name', true], ['responsibilities', 'Responsibilities', true], ['raci_template', 'Starting rights', true]],
    rules(text) {
      const R = /\b(CISO|CIO|CTO|CEO|CFO|COO|DPO|privacy officer|risk owner|risk manager|IT manager|IT director|security (?:officer|manager|lead|analyst)|compliance officer|internal auditor|process owner|responsable de la sécurité|directeur (?:des )?TI|RSSI)\b/gi;
      const out = new Map();
      for (const s of sentences(text)) for (const m of s.matchAll(R)) {
        const role = m[0]; if (out.has(norm(role))) continue;
        const nm = (new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[,:\\s]+(?:is\\s+)?((?:[A-Z][a-zé\\-]+\\s){1,2}[A-Z][a-zé\\-]+)').exec(s) || [])[1] || '';
        out.set(norm(role), { role, name: nm.trim(), responsibilities: '', raci_template: /CISO|security|RSSI|risk manager/i.test(role) ? 'analyst' : /CEO|CFO|COO|CIO|director|directeur|risk owner/i.test(role) ? 'owner' : 'viewer', tag: nm ? 'FACT' : 'INFERENCE', source: s.slice(0, 200) });
      }
      return [...out.values()];
    },
    apply(items, ws) {
      ws.org.roles ||= []; let n = 0;
      for (const it of items) {
        if (ws.org.roles.some(r => norm(r.role) === norm(it.role) && norm(r.name) === norm(it.name))) continue;
        ws.org.roles.push({ role: str(it.role, 80), name: str(it.name, 80), responsibilities: str(it.responsibilities, 300), raci_template: it.raci_template || 'viewer', prov: prov(it) }); n++;
      }
      return n;
    } },
  { id: 'classroom', s: false, label: 'Classroom setting', route: 'org/class', value: 'Low effort',
    what: 'Course, case title, team, due date, deliverables — from the assignment document.',
    shape: '{"items":[{"course":"","case_title":"","team":"","members":"","instructor":"","due":"YYYY-MM-DD","deliverables":"","tag":"","source":""}]}',
    cols: [['course', 'Course', true], ['case_title', 'Case title', true], ['instructor', 'Instructor', true], ['due', 'Due', true], ['deliverables', 'Deliverables', true]],
    rules(text) {
      const g = re => (re.exec(text) || [])[1]?.trim() || '';
      const it = { course: g(/\b(?:Course|Cours)\s*[:\-]\s*([^\n]{3,80})/i) || g(/\b([A-Z]{2,4}\s?\d{3,4}[A-Z]?)\b/), case_title: g(/\b(?:Case(?: study)?|Étude de cas|Business case)\s*[:\-]\s*([^\n]{3,100})/i),
        instructor: g(/\b(?:Instructor|Professor|Professeur|Enseignant)\s*[:\-]\s*([^\n]{3,60})/i), due: g(/\b(?:Due(?: date)?|Date de remise|Échéance)\s*[:\-]\s*([^\n]{3,40})/i),
        deliverables: g(/\b(?:Deliverables?|Livrables?)\s*[:\-]\s*([^\n]{3,200})/i), tag: 'FACT', source: 'Assignment text' };
      return Object.values(it).filter(v => v && v !== 'FACT' && v !== 'Assignment text').length ? [it] : [];
    },
    apply(items, ws) {
      const it = items[0]; if (!it) return 0;
      ws.classroom ||= { course: '', case_title: '', team: '', members: '', instructor: '', due: '', notes: '' };
      for (const k of ['course', 'case_title', 'team', 'members', 'instructor', 'due']) if (it[k]) ws.classroom[k] = str(it[k], 160);
      if (it.deliverables) ws.classroom.notes = [ws.classroom.notes, 'Deliverables: ' + str(it.deliverables, 400)].filter(Boolean).join('\n');
      ws.classroom.prov = prov(it);
      return 1;
    } },
];
/** Framework reference as the catalogue keys it: ISO22:8.5 · CSF2:PR.AA-01 · CIS81:CIS 6 · NIST-53:AC-02(01). */
export function normRef(r) {
  let x = String(r || '').trim().replace(/\s*:\s*/, ':');
  let m = /^(?:CIS(?:81|8|\s?v?8(?:\.1)?)?)[:\s]+(?:CIS\s?)?(\d{1,2})(?:\.\d+)?$/i.exec(x);
  if (m) return 'CIS81:CIS ' + Number(m[1]);
  m = /^(?:NIST-53|SP800-53|800-53|NIST)[:\s]+([A-Z]{2})-?(\d{1,2})(?:\((\d{1,2})\))?$/i.exec(x);
  if (m) return `NIST-53:${m[1].toUpperCase()}-${m[2].padStart(2, '0')}${m[3] ? `(${m[3].padStart(2, '0')})` : ''}`;
  m = /^(?:ISO22|ISO27002|ISO\/IEC27002|ISO)[:\s]+(\d+\.\d+)$/i.exec(x.replace(/\s+/g, ''));
  if (m) return 'ISO22:' + m[1];
  m = /^(?:CSF2|CSF|NISTCSF)[:\s]+([A-Z]{2}\.[A-Z]{2}-\d{2})$/i.exec(x.replace(/\s+/g, ''));
  if (m) return 'CSF2:' + m[1].toUpperCase();
  return x;
}
export const SECTION = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
export const taskOf = sec => (sec.s ? 'extract_s_' : 'extract_m_') + sec.id;
function prov(it) { return { tag: tagOf(it.tag), source: str(it.source, 300), method: it._method || 'ai', date: today() }; }

/* ---------------- AI tasks (one per target) ---------------- */
const RULES = `Provenance tag for every item, exactly one of: FACT (explicitly in the documents), INFERENCE (derived from facts),
ASSUMPTION (plausible because information is missing), EXTERNAL (external evidence, give the URL), UNKNOWN (still to collect).
"source" is the document name and a short quotation (at most 25 words) that supports the item.
Values are concise and normalized for machine ingestion (no marketing language, numbers as plain digits).
Never invent facts: only list what the documents state or clearly imply. Return an empty list rather than guessing.`;
for (const sec of SECTIONS) {
  AI.TASKS[taskOf(sec)] = {
    label: 'Import from documents — ' + sec.label,
    build(ws, { text = '', fictional = false } = {}) {
      const scen = sec.needsScenarios ? ['', 'SCENARIOS of the register (id | name | causal chain):', ...ws.assessment.SCEN.map(s => `${s.id} | ${str(s.name, 80)} | ${str(s.statement, 220)}`)] : [];
      const assets = ['bia', 'scenarios', 'weaknesses', 'incidents'].includes(sec.id) && (ws.assets || []).length ? ['', 'Information assets already recorded (reuse these names):', (ws.assets || []).slice(0, 80).map(a => a.name).join('; ')] : [];
      const body = [
        `Extract from the documents below: ${sec.label}.`, sec.what, '',
        RULES, fictional ? 'The organization is an educational, fictional business case.' : '',
        sec.id === 'evidence' ? 'Never propose a numeric value for a parameter. Quote the evidence and say what it suggests (higher, lower, uncertain).' : '',
        sec.id === 'controls' ? 'Only controls the documents say are in place today. Framework references must be real identifiers: ISO22:<control> (ISO/IEC 27002:2022, e.g. 8.5), CSF2:<subcategory> (e.g. PR.AA-01), CIS81:<control number> (e.g. 6), NIST-53:<control> (e.g. AC-02).' : '',
        ...scen, ...assets, '',
        'Answer with JSON only, in this shape:', sec.shape, '', 'DOCUMENTS:', text,
      ].filter(x => x !== '');
      return { system: 'You are a senior cybersecurity risk analyst who extracts structured, sourced facts from organizational documents for a risk assessment. You never invent facts and never calculate risk.',
               prompt: body.join('\n'), max_tokens: 8000, json: true, keepLanguage: true };
    },
  };
}

/** Parse a model answer into review items (tags normalized, method recorded). */
export function parseAI(sec, text) {
  const j = AI.parseJson(text) || {};
  const items = (Array.isArray(j) ? j : j.items || j[Object.keys(j)[0]] || []).filter(x => x && typeof x === 'object');
  return { items: items.map(x => ({ ...x, tag: tagOf(x.tag), _method: 'ai' })), truncated: !!j.__truncated };
}
/** Rules method (no AI). Returns null when this target has no rules. */
export async function byRules(sec, ws = S.ws) {
  if (!sec.rules) return null;
  const c = await corpus(ws, 400000);
  return { items: sec.rules(c.text, ws).map(x => ({ ...x, _method: 'rules' })) };
}
/** Apply the ticked items and record the import. */
export function apply(sec, items, ws = S.ws, by = '') {
  const n = sec.apply(items, ws);
  (ws.importLog ||= []).unshift({ at: new Date().toISOString(), section: sec.id, label: sec.label, added: n, offered: items.length, method: items[0]?._method || '', by });
  ws.importLog = ws.importLog.slice(0, 300);
  touch();
  return n;
}
/** A short text summary of one item for the review table. */
export function cell(sec, it, key) {
  if (key === 'cia') return [it.c, it.i, it.a].map(v => v || '–').join('/');
  if (key === 'impact') return ['financial', 'operational', 'legal', 'reputational', 'safety'].map(k => it[k] ?? '–').join('/');
  if (key === 'split') return it.kind === 'spend' ? [it.staff, it.tools, it.services].map(v => v || 0).join(' / ') : '';
  const v = it[key];
  return Array.isArray(v) ? v.join('; ') : v ?? '';
}
export function setCell(it, key, v) {
  if (['depends_on', 'refs', 'attack'].includes(key)) it[key] = list(v); else it[key] = v;
}
