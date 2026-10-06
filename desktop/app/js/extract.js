/* extract.js — local text extraction from uploaded context documents. Nothing is uploaded anywhere.
   Supports .txt .md .csv .json .html, .docx .xlsx .pptx (Office Open XML) and best-effort .pdf.
   Uses the browser's native DecompressionStream; no third-party code.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

async function inflate(bytes, raw = true) {
  const ds = new DecompressionStream(raw ? 'deflate-raw' : 'deflate');
  const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
  return new Uint8Array(await out.arrayBuffer());
}
const dec = new TextDecoder('utf-8');

/** Minimal ZIP reader (central directory; stored and deflated entries). */
export async function unzip(buf) {
  const b = new Uint8Array(buf), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a ZIP container');
  const n = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true);
  const files = {};
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const off = dv.getUint32(p + 42, true);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nlen));
    files[name] = { method, csize, off };
    p += 46 + nlen + xlen + clen;
  }
  return {
    names: Object.keys(files),
    async read(name) {
      const f = files[name]; if (!f) return null;
      const lh = f.off, nl = dv.getUint16(lh + 26, true), xl = dv.getUint16(lh + 28, true);
      const data = b.subarray(lh + 30 + nl + xl, lh + 30 + nl + xl + f.csize);
      return f.method === 0 ? data : await inflate(data);
    },
    async text(name) { const d = await this.read(name); return d ? dec.decode(d) : null; },
  };
}

const xmlText = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

async function docx(buf) {
  const z = await unzip(buf);
  const x = await z.text('word/document.xml'); if (!x) throw new Error('word/document.xml not found');
  return xmlText(x.replace(/<w:tab\/>/g, '\t').replace(/<\/w:p>/g, '\n').replace(/<w:br\/>/g, '\n').replace(/<\/w:tc>/g, '\t'))
    .replace(/\n{3,}/g, '\n\n').trim();
}
async function xlsx(buf) {
  const z = await unzip(buf);
  const ss = await z.text('xl/sharedStrings.xml');
  const strings = ss ? [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => xmlText(m[1])) : [];
  const wb = await z.text('xl/workbook.xml') || '';
  const names = [...wb.matchAll(/<sheet [^>]*name="([^"]+)"/g)].map(m => m[1]);
  const sheets = z.names.filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const out = [];
  for (let i = 0; i < sheets.length; i++) {
    const x = await z.text(sheets[i]);
    out.push('## ' + (names[i] || sheets[i]));
    for (const row of x.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells = [];
      for (const c of row[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const t = (c[1].match(/t="(\w+)"/) || [])[1];
        const v = ((c[2] || '').match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        const is = ((c[2] || '').match(/<is>([\s\S]*?)<\/is>/) || [])[1];
        cells.push(t === 's' ? strings[Number(v)] ?? '' : is ? xmlText(is) : v ?? '');
      }
      if (cells.some(Boolean)) out.push(cells.join('\t'));
    }
  }
  return out.join('\n');
}
async function pptx(buf) {
  const z = await unzip(buf);
  const slides = z.names.filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const out = [];
  for (const s of slides) {
    const x = await z.text(s);
    out.push('## Slide ' + s.match(/\d+/)[0], xmlText(x.replace(/<\/a:p>/g, '\n')).trim());
  }
  return out.join('\n');
}

/** Best-effort PDF text: inflates FlateDecode streams and reads Tj/TJ string operators.
 *  Works for most text PDFs produced by office suites; scanned or CID-encoded PDFs yield little. */
async function pdf(buf) {
  const b = new Uint8Array(buf);
  const latin = new TextDecoder('latin1');
  const s = latin.decode(b);
  const parts = [];
  const re = /stream\r?\n/g; let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf('endstream', start); if (end < 0) break;
    const dict = s.slice(Math.max(0, m.index - 400), m.index);
    let data = b.subarray(start, end);
    if (/\/Subtype\s*\/Image/.test(dict.slice(dict.lastIndexOf('<<')))) { re.lastIndex = end; continue; }
    const dd = dict.slice(dict.lastIndexOf('<<'));
    if (/ASCII85Decode/.test(dd)) data = a85(data);
    if (/ASCIIHexDecode/.test(dd)) data = ahx(data);
    if (/FlateDecode/.test(dd)) {
      try { data = await inflate(data, false); } catch { re.lastIndex = end; continue; }
    }
    const txt = latin.decode(data);
    if (/\b(Tj|TJ)\b/.test(txt)) parts.push(pdfOps(txt));
    re.lastIndex = end;
  }
  return parts.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function a85(b) {
  const s = new TextDecoder('latin1').decode(b).replace(/\s+/g, '').replace(/^<~/, '').replace(/~>.*$/, '');
  const out = []; let tuple = [], i = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === 'z' && tuple.length === 0) { out.push(0, 0, 0, 0); continue; }
    const v = c.charCodeAt(0) - 33; if (v < 0 || v > 84) continue;
    tuple.push(v);
    if (tuple.length === 5) { let n = 0; for (const t of tuple) n = n * 85 + t; out.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255); tuple = []; }
  }
  if (tuple.length) { const k = tuple.length; while (tuple.length < 5) tuple.push(84); let n = 0; for (const t of tuple) n = n * 85 + t; const bytes = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; out.push(...bytes.slice(0, k - 1)); }
  return new Uint8Array(out);
}
function ahx(b) {
  const s = new TextDecoder('latin1').decode(b).replace(/[^0-9a-fA-F]/g, '');
  const out = new Uint8Array(Math.floor(s.length / 2)); for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
  return out;
}
function pdfStr(x) {
  return x.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, e) => ({ n: '\n', r: '', t: '\t', b: '', f: '', '(': '(', ')': ')', '\\': '\\' }[e] ?? String.fromCharCode(parseInt(e, 8))));
}
function pdfOps(t) {
  let out = '';
  const re = /\((?:\\.|[^\\)])*\)\s*Tj|\[(?:[^\]]*)\]\s*TJ|T\*|\bTd\b|\bTD\b|\bET\b|'|"/g; let m;
  while ((m = re.exec(t))) {
    const tok = m[0];
    if (tok.endsWith('Tj')) out += pdfStr(tok.slice(1, tok.lastIndexOf(')')));
    else if (tok.endsWith('TJ')) {
      for (const p of tok.matchAll(/\((?:\\.|[^\\)])*\)|(-?\d+(?:\.\d+)?)/g)) {
        if (p[0].startsWith('(')) out += pdfStr(p[0].slice(1, -1));
        else if (Number(p[1]) < -200) out += ' ';
      }
    } else if (tok === 'ET' || tok === 'T*' || tok === 'Td' || tok === 'TD') out += tok === 'ET' ? '\n' : ' ';
  }
  return out;
}

export async function extractText(file) {
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop();
  const buf = await file.arrayBuffer();
  let text = '', method = ext;
  if (['txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'log'].includes(ext)) text = dec.decode(buf);
  else if (['html', 'htm'].includes(ext)) text = new DOMParser().parseFromString(dec.decode(buf), 'text/html').body.innerText;
  else if (ext === 'docx') text = await docx(buf);
  else if (ext === 'xlsx' || ext === 'xlsm') text = await xlsx(buf);
  else if (ext === 'pptx') text = await pptx(buf);
  else if (ext === 'pdf') text = await pdf(buf);
  else throw new Error('Unsupported file type .' + ext + ' — use .docx, .xlsx, .pptx, .pdf, .txt, .md, .csv or .json');
  const printable = text.length ? (text.match(/[\p{L}\p{N}\p{P}\s]/gu) || []).length / text.length : 0;
  const quality = !text.trim() ? 'empty' : printable < 0.85 ? 'poor' : 'good';
  return { text, method, quality, chars: text.length, words: (text.match(/\S+/g) || []).length };
}

/* ---------------- context hints: deterministic keyword scan, no AI ---------------- */
const REGS = [
  ['Quebec Law 25', /\b(law|loi)\s*25\b|bill\s*64\b/i], ['PIPEDA', /\bPIPEDA\b/i], ['PHIPA (Ontario)', /\bPHIPA\b/i],
  ['GDPR', /\bGDPR\b|RGPD/i], ['HIPAA', /\bHIPAA\b/i], ['PCI DSS', /\bPCI[\s-]?DSS\b/i], ['SOX', /\bSarbanes|\bSOX\b/i],
  ['NIS2', /\bNIS\s?2\b/i], ['DORA', /\bDORA\b/], ['OSFI B-13', /\bB-13\b|\bOSFI\b/i], ['ISO/IEC 27001', /ISO\s*\/?\s*(IEC)?\s*27001/i],
  ['NIST CSF', /NIST\s*(CSF|Cybersecurity Framework)/i], ['SOC 2', /\bSOC\s?2\b/i], ['CMMC', /\bCMMC\b/], ['FERPA', /\bFERPA\b/],
];
const TECH = [
  'Microsoft 365', 'Office 365', 'Azure', 'Entra ID', 'Active Directory', 'AWS', 'Google Cloud', 'Google Workspace', 'Salesforce', 'SAP',
  'Oracle', 'VMware', 'Citrix', 'Fortinet', 'FortiGate', 'Palo Alto', 'Cisco', 'Ivanti', 'Pulse Secure', 'SonicWall', 'Check Point',
  'VPN', 'RDP', 'Exchange', 'SharePoint', 'Teams', 'Zoom', 'Okta', 'CrowdStrike', 'SentinelOne', 'Defender', 'Splunk', 'Veeam',
  'Kubernetes', 'Docker', 'GitHub', 'GitLab', 'Jira', 'ServiceNow', 'Workday', 'EHR', 'ERP', 'CRM', 'SCADA', 'PLC', 'IoT', 'Wi-Fi',
  'MOVEit', 'Confluence', 'WordPress', 'Linux', 'Windows Server', 'macOS', 'iPad', 'Android', 'Cloud storage', 'SD-WAN', 'Firewall', 'IDS', 'IPS',
];
const SECTORS = [
  ['Healthcare', /\b(hospital|clinic|patient|health|medical|EHR|pharmac)/i], ['Financial services', /\b(bank|credit union|insurance|payments?|fintech|investment)\b/i],
  ['Higher education', /\b(university|college|students?|faculty|campus)\b/i], ['Manufacturing', /\b(manufactur|plant|factory|production line|OT\b)/i],
  ['Retail / e-commerce', /\b(retail|e-?commerce|store|shop|point of sale|POS)\b/i], ['Public sector', /\b(municipal|government|ministry|agency|public sector)\b/i],
  ['Transportation and logistics', /\b(logistics|transport(ation)?|warehouses?|freight|shipping|fleet)\b/i], ['Energy / utilities', /\b(utility|utilities|electric|grid|pipeline|water treatment)\b/i], ['Technology / SaaS', /\b(SaaS|software company|platform|startup)\b/i],
];
export function hints(text) {
  const out = { regulations: [], technologies: [], sectors: [], cves: [], money: [], crown: [] };
  for (const [n, r] of REGS) if (r.test(text)) out.regulations.push(n);
  for (const t of TECH) if (new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text)) out.technologies.push(t);
  const sc = SECTORS.map(([n, r]) => [n, (text.match(new RegExp(r.source, 'gi')) || []).length]).filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1]);
  out.sectors = sc.slice(0, 3).map(x => x[0]);
  out.cves = [...new Set((text.match(/CVE-\d{4}-\d{4,}/gi) || []).map(s => s.toUpperCase()))];
  out.money = [...new Set(text.match(/(?:\$|CAD|USD|€)\s?\d[\d,. ]*(?:\s?(?:million|M|k|K|thousand|billion|B))?/g) || [])].slice(0, 12);
  const crownRe = /\b(EHR|ERP|CRM|patient records?|customer data|payment(?: system)?s?|billing|payroll|scheduling|data cent(?:er|re)|core banking|production systems?|website|e-?commerce platform|student information system|research data)\b/gi;
  out.crown = [...new Set((text.match(crownRe) || []).map(s => s.replace(/\b\w/g, c => c.toUpperCase())))].slice(0, 12);
  return out;
}
