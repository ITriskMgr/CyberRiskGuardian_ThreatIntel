/* xlsx.js — minimal, dependency-free Office Open XML (.xlsx) writer: inline strings, numbers, formulas with
   cached values, styles, column widths, frozen panes, conditional formatting. Runs offline in the browser.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

const X = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
export const col = n => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };  // 0 -> A
export const ref = (r, c) => col(c) + (r + 1);   // zero-based

/* ---------------- styles ---------------- */
class Styles {
  constructor() {
    this.fonts = ['<font><sz val="10"/><name val="Arial"/></font>'];
    this.fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
    this.borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>',
      '<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>'];
    this.numFmts = []; this.xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>']; this.map = new Map();
    this.dxfs = [];
  }
  idx(arr, xml) { let i = arr.indexOf(xml); if (i < 0) { arr.push(xml); i = arr.length - 1; } return i; }
  get(o = {}) {
    const key = JSON.stringify(o); if (this.map.has(key)) return this.map.get(key);
    const font = this.idx(this.fonts, `<font>${o.bold ? '<b/>' : ''}${o.italic ? '<i/>' : ''}<sz val="${o.size || 10}"/>${o.color ? `<color rgb="FF${o.color}"/>` : ''}<name val="Arial"/></font>`);
    const fill = o.fill ? this.idx(this.fills, `<fill><patternFill patternType="solid"><fgColor rgb="FF${o.fill}"/><bgColor indexed="64"/></patternFill></fill>`) : 0;
    const border = o.border === false ? 0 : 1;
    let fmt = 0;
    const builtin = { '0': 1, '0.00': 2, '#,##0': 3, '#,##0.00': 4, '0%': 9, '0.00%': 10 };
    if (o.fmt) { if (builtin[o.fmt] !== undefined) fmt = builtin[o.fmt]; else { let i = this.numFmts.indexOf(o.fmt); if (i < 0) { this.numFmts.push(o.fmt); i = this.numFmts.length - 1; } fmt = 164 + i; } }
    const align = o.wrap || o.valign || o.halign ? `<alignment${o.wrap ? ' wrapText="1"' : ''} vertical="${o.valign || 'top'}"${o.halign ? ` horizontal="${o.halign}"` : ''}/>` : '';
    this.xfs.push(`<xf numFmtId="${fmt}" fontId="${font}" fillId="${fill}" borderId="${border}" xfId="0"${fmt ? ' applyNumberFormat="1"' : ''}${font ? ' applyFont="1"' : ''}${fill ? ' applyFill="1"' : ''}${border ? ' applyBorder="1"' : ''}${align ? ' applyAlignment="1">' + align + '</xf>' : '/>'}`);
    const i = this.xfs.length - 1; this.map.set(key, i); return i;
  }
  dxf(fill) { this.dxfs.push(`<dxf><fill><patternFill><bgColor rgb="FF${fill}"/></patternFill></fill></dxf>`); return this.dxfs.length - 1; }
  xml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
      (this.numFmts.length ? `<numFmts count="${this.numFmts.length}">${this.numFmts.map((f, i) => `<numFmt numFmtId="${164 + i}" formatCode="${X(f)}"/>`).join('')}</numFmts>` : '') +
      `<fonts count="${this.fonts.length}">${this.fonts.join('')}</fonts><fills count="${this.fills.length}">${this.fills.join('')}</fills>` +
      `<borders count="${this.borders.length}">${this.borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
      `<cellXfs count="${this.xfs.length}">${this.xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
      `<dxfs count="${this.dxfs.length}">${this.dxfs.join('')}</dxfs></styleSheet>`;
  }
}

/* ---------------- sheet ---------------- */
export class Sheet {
  constructor(wb, name) { this.wb = wb; this.name = name.slice(0, 31); this.cells = new Map(); this.widths = {}; this.freeze = null; this.cf = []; this.maxR = 0; this.maxC = 0; this.merges = []; }
  /** set(r, c, value, style) — value: number | string | {f, v} (formula with cached value). Zero-based r/c. */
  set(r, c, value, style = {}) {
    this.cells.set(r * 16384 + c, { r, c, value, s: this.wb.styles.get(style) });
    this.maxR = Math.max(this.maxR, r); this.maxC = Math.max(this.maxC, c); return this;
  }
  width(c, w) { this.widths[c] = w; return this; }
  widthsFrom(arr) { arr.forEach((w, i) => { this.widths[i] = w; }); return this; }
  row(r, values, style = {}) { values.forEach((v, i) => { if (v !== undefined) this.set(r, i, v, typeof style === 'function' ? style(i, v) : style); }); return this; }
  condFormat(sqref, rules) { this.cf.push({ sqref, rules }); return this; }
  xml() {
    const rows = new Map();
    for (const cell of this.cells.values()) { if (!rows.has(cell.r)) rows.set(cell.r, []); rows.get(cell.r).push(cell); }
    const rowXml = [...rows.keys()].sort((a, b) => a - b).map(r => {
      const cs = rows.get(r).sort((a, b) => a.c - b.c).map(({ c, value, s }) => {
        const a = ref(r, c), st = s ? ` s="${s}"` : '';
        if (value === null || value === undefined || value === '') return `<c r="${a}"${st}/>`;
        if (typeof value === 'object' && value.f !== undefined) {
          const f = `<f>${X(String(value.f).replace(/^=/, ''))}</f>`;
          if (value.v === undefined || value.v === null || (typeof value.v === 'number' && !Number.isFinite(value.v))) return `<c r="${a}"${st}>${f}</c>`;
          if (typeof value.v === 'number') return `<c r="${a}"${st}>${f}<v>${value.v}</v></c>`;
          if (typeof value.v === 'boolean') return `<c r="${a}"${st} t="b">${f}<v>${value.v ? 1 : 0}</v></c>`;
          return `<c r="${a}"${st} t="str">${f}<v>${X(value.v)}</v></c>`;
        }
        if (typeof value === 'number') return Number.isFinite(value) ? `<c r="${a}"${st}><v>${value}</v></c>` : `<c r="${a}"${st}/>`;
        if (typeof value === 'boolean') return `<c r="${a}"${st} t="b"><v>${value ? 1 : 0}</v></c>`;
        return `<c r="${a}"${st} t="inlineStr"><is><t xml:space="preserve">${X(value)}</t></is></c>`;
      }).join('');
      return `<row r="${r + 1}">${cs}</row>`;
    }).join('');
    const cols = Object.keys(this.widths).length ? `<cols>${Object.entries(this.widths).sort((a, b) => a[0] - b[0]).map(([c, w]) => `<col min="${+c + 1}" max="${+c + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
    let pane = '';
    if (this.freeze) {
      const [fr, fc] = this.freeze;
      pane = `<pane${fc ? ` xSplit="${fc}"` : ''}${fr ? ` ySplit="${fr}"` : ''} topLeftCell="${ref(fr, fc)}" activePane="${fr && fc ? 'bottomRight' : fr ? 'bottomLeft' : 'topRight'}" state="frozen"/>`;
    }
    let prio = 1;
    const cf = this.cf.map(({ sqref, rules }) => `<conditionalFormatting sqref="${sqref}">${rules.map(r => `<cfRule type="cellIs" dxfId="${r.dxf}" priority="${prio++}" operator="${r.op}">${r.formulas.map(f => `<formula>${X(f)}</formula>`).join('')}</cfRule>`).join('')}</conditionalFormatting>`).join('');
    const merges = this.merges.length ? `<mergeCells count="${this.merges.length}">${this.merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      `<dimension ref="A1:${ref(this.maxR, this.maxC)}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="13"/>` +
      cols + `<sheetData>${rowXml}</sheetData>` + merges + cf + `<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>`;
  }
}

export class Workbook {
  constructor({ title = 'CyberRiskGuardian', author = 'CyberRiskGuardian Desktop' } = {}) { this.sheets = []; this.styles = new Styles(); this.title = title; this.author = author; }
  sheet(name) { const s = new Sheet(this, name); this.sheets.push(s); return s; }
  files() {
    const n = this.sheets.length, now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const f = {};
    f['[Content_Types].xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
      this.sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
      `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
    f['_rels/.rels'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
    f['docProps/core.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${X(this.title)}</dc:title><dc:creator>${X(this.author)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
    f['docProps/app.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>CyberRiskGuardian Desktop</Application></Properties>`;
    f['xl/workbook.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>` +
      this.sheets.map((s, i) => `<sheet name="${X(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + `</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;
    f['xl/_rels/workbook.xml.rels'] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
      this.sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
      `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    this.sheets.forEach((s, i) => { f[`xl/worksheets/sheet${i + 1}.xml`] = s.xml(); });
    f['xl/styles.xml'] = this.styles.xml();
    return f;
  }
  async blob() { return new Blob([await zip(this.files())], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }
  async bytes() { return zip(this.files()); }
}

/* ---------------- zip (deflate via CompressionStream when available) ---------------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function deflate(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  try { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); } catch { return null; }
}
export async function zip(files) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = typeof content === 'string' ? enc.encode(content) : content;
    const nm = enc.encode(name), crc = crc32(data);
    const comp = await deflate(data); const method = comp && comp.length < data.length ? 8 : 0; const body = method ? comp : data;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, method, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, body.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nm, body);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, method, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), nm);
    off += 30 + nm.length + body.length;
  }
  const csize = central.reduce((s, p) => s + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, Object.keys(files).length, true); end.setUint16(10, Object.keys(files).length, true);
  end.setUint32(12, csize, true); end.setUint32(16, off, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0)); let p = 0;
  for (const a of all) { out.set(a, p); p += a.length; }
  return out;
}
