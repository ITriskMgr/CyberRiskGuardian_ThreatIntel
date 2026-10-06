/* md.js — just enough Markdown to render the shipped guides in their own window (1.5.6).

   Why not a library: the package has no dependencies and works offline from a folder of files, so a
   CDN is not an option and bundling a parser for two pages is not worth it. This handles exactly the
   Markdown the guides use — ATX headings, paragraphs, bullet and numbered lists, pipe tables, fenced
   and inline code, bold, italic, links and horizontal rules — and nothing else.

   Everything is built with DOM nodes and text nodes, never innerHTML, so content inside the guide
   cannot become markup. Inline spans are produced by one tokenizer that escapes as it goes.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

const el = (tag, ...kids) => {
  const n = document.createElement(tag);
  for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
  return n;
};

/** Inline markup of one line: `code`, **bold**, *italic*, [text](url). Returns an array of nodes. */
export function inline(src) {
  const out = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|(?<![\w*])\*([^*\n]+)\*(?![\w*])|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)<>,;]+)/g;
  let last = 0, m;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    if (m[1] !== undefined) out.push(el('code', m[1]));
    else if (m[2] !== undefined) out.push(el('b', ...inline(m[2])));
    else if (m[3] !== undefined) out.push(el('i', ...inline(m[3])));
    else if (m[4] !== undefined) { const a = el('a', ...inline(m[4])); a.href = m[5]; link(a); out.push(a); }
    else { const a = el('a', m[6]); a.href = m[6]; link(a); out.push(a); }
    last = re.lastIndex;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}
function link(a) {
  if (/^https?:/i.test(a.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
}

const isRule = l => /^(\s*)([-*_])\s*\2\s*\2[\s\2]*$/.test(l);
const bullet = l => /^\s{0,3}[-*+]\s+(.*)$/.exec(l);
const numbered = l => /^\s{0,3}(\d+)[.)]\s+(.*)$/.exec(l);
const tableRow = l => /^\s*\|(.+)\|\s*$/.exec(l);
const divider = l => /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(l) && l.includes('-');
const cells = l => tableRow(l)[1].split('|').map(c => c.trim());

/** Render Markdown text into a container element. Headings get ids so a table of contents can link
    (levels 1 to 3 are returned: in the user guide level 3 is one screen of the application). */
export function render(text, into) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const nodes = [];
  const heads = [];
  const seen = new Map();
  let i = 0;

  const slug = s => {
    let base = s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'section';
    const n = (seen.get(base) || 0) + 1; seen.set(base, n);
    return n > 1 ? base + '-' + n : base;
  };

  while (i < lines.length) {
    const l = lines[i];

    if (!l.trim()) { i++; continue; }

    if (/^```/.test(l)) {                                  // fenced code
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      nodes.push(el('pre', el('code', buf.join('\n'))));
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(l);
    if (h) {
      const level = h[1].length;
      const node = el('h' + Math.min(level, 6), ...inline(h[2].replace(/\s+#+\s*$/, '')));
      node.id = slug(h[2]);
      if (level <= 3) heads.push({ id: node.id, text: h[2], level });   // 1 and 2 are sections, 3 are the screens
      nodes.push(node);
      i++;
      continue;
    }

    if (isRule(l)) { nodes.push(el('hr')); i++; continue; }

    if (tableRow(l) && i + 1 < lines.length && divider(lines[i + 1])) {
      const head = cells(l);
      i += 2;
      const tbl = el('table', el('thead', el('tr', head.map(c => el('th', ...inline(c))))));
      const body = el('tbody');
      while (i < lines.length && tableRow(lines[i])) {
        body.append(el('tr', cells(lines[i]).map(c => el('td', ...inline(c)))));
        i++;
      }
      tbl.append(body);
      nodes.push(tbl);
      continue;
    }

    if (bullet(l) || numbered(l)) {
      const ordered = !bullet(l);
      const list = el(ordered ? 'ol' : 'ul');
      while (i < lines.length) {
        const m = ordered ? numbered(lines[i]) : bullet(lines[i]);
        if (!m) break;
        const parts = [m[ordered ? 2 : 1]];
        i++;
        while (i < lines.length && lines[i].trim() && !bullet(lines[i]) && !numbered(lines[i])
               && !/^(#{1,6})\s/.test(lines[i]) && !tableRow(lines[i]) && /^\s{2,}/.test(lines[i])) {
          parts.push(lines[i].trim()); i++;                 // a wrapped continuation line
        }
        list.append(el('li', ...inline(parts.join(' '))));
      }
      nodes.push(list);
      continue;
    }

    if (/^\s*>\s?/.test(l)) {                               // block quote
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      nodes.push(el('blockquote', ...inline(buf.join(' '))));
      continue;
    }

    const buf = [l];                                        // paragraph: lines until a blank or a block start
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s|^```/.test(lines[i])
           && !bullet(lines[i]) && !numbered(lines[i]) && !tableRow(lines[i]) && !isRule(lines[i])) {
      buf.push(lines[i++]);
    }
    nodes.push(el('p', ...inline(buf.join('\n'))));
  }

  if (into) into.append(...nodes);
  return { nodes, headings: heads };
}
