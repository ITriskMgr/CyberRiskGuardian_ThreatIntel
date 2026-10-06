/* charts.js — small dependency-free SVG charts (lines with thresholds, sparklines, budget band chart,
   arbitrage frontier). One y-axis per chart; colors come from CSS tokens so light and dark both work.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
  for (const k of kids.flat()) if (k !== null && k !== undefined) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
}
function ticks(min, max, n = 5) {
  if (max === min) { max = min + 1; }
  const span = max - min, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || mag * 10;
  const out = []; for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}
let tip;
function tooltip() { if (!tip) { tip = document.createElement('div'); tip.className = 'charttip'; document.body.append(tip); } return tip; }
export function showTip(e, html) { const t = tooltip(); t.innerHTML = html; t.style.display = 'block'; const x = Math.min(e.clientX + 14, innerWidth - t.offsetWidth - 8); t.style.left = x + 'px'; t.style.top = (e.clientY + 14) + 'px'; }
export function hideTip() { if (tip) tip.style.display = 'none'; }
const fmt = v => Math.abs(v) >= 1000 ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 }) : Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 });

/** Line chart over dates. series: [{name, color, points:[{x: 'YYYY-MM-DD', y}]}]; refs: [{y, label, color}] */
export function lineChart({ series, refs = [], width = 720, height = 240, yLabel = '', yFmt = fmt }) {
  const m = { l: 56, r: 16, t: 14, b: 30 }, W = width - m.l - m.r, H = height - m.t - m.b;
  const xs = series.flatMap(s => s.points.map(p => +new Date(p.x)));
  const ys = series.flatMap(s => s.points.map(p => p.y)).concat(refs.map(r => r.y)).filter(Number.isFinite);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) { x0 -= 864e5 * 15; x1 += 864e5 * 15; }
  let y0 = Math.min(0, ...ys), y1 = Math.max(...ys); if (y0 === y1) y1 = y0 + 1; y1 += (y1 - y0) * 0.08;
  const X = v => m.l + (v - x0) / (x1 - x0) * W, Y = v => m.t + H - (v - y0) / (y1 - y0) * H;
  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img', 'aria-label': yLabel });
  const g = svg('g', { class: 'grid' });
  for (const t of ticks(y0, y1)) { g.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(t), y2: Y(t) })); root.append(svg('text', { x: m.l - 6, y: Y(t) + 4, 'text-anchor': 'end' }, yFmt(t))); }
  root.prepend(g);
  const nx = Math.min(6, Math.max(2, xs.length));
  for (let i = 0; i < nx; i++) { const v = x0 + (x1 - x0) * i / (nx - 1); root.append(svg('text', { x: X(v), y: height - 8, 'text-anchor': i === 0 ? 'start' : i === nx - 1 ? 'end' : 'middle' }, new Date(v).toISOString().slice(0, 10))); }
  root.append(svg('line', { x1: m.l, x2: m.l + W, y1: m.t + H, y2: m.t + H, style: 'stroke:var(--line)' }));
  for (const r of refs) {
    root.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(r.y), y2: Y(r.y), style: `stroke:${r.color || 'var(--muted)'};stroke-width:1.5;stroke-dasharray:5 4` }));
    root.append(svg('text', { x: m.l + W - 4, y: Y(r.y) - 4, 'text-anchor': 'end', style: `fill:${r.color || 'var(--muted)'}` }, r.label));
  }
  for (const s of series) {
    const pts = s.points.slice().sort((a, b) => new Date(a.x) - new Date(b.x));
    if (pts.length > 1) root.append(svg('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + X(+new Date(p.x)) + ' ' + Y(p.y)).join(' '), style: `fill:none;stroke:${s.color};stroke-width:2;stroke-linejoin:round` }));
    for (const p of pts) {
      const c = svg('circle', { cx: X(+new Date(p.x)), cy: Y(p.y), r: 4.5, style: `fill:${s.color};stroke:var(--surface);stroke-width:2` });
      const hit = svg('circle', { cx: X(+new Date(p.x)), cy: Y(p.y), r: 12, style: 'fill:transparent;cursor:default' });
      hit.addEventListener('mousemove', e => showTip(e, `<b>${p.x}</b>${s.name}: ${yFmt(p.y)}${p.note ? '<br>' + p.note : ''}`));
      hit.addEventListener('mouseleave', hideTip);
      root.append(c, hit);
    }
  }
  return root;
}

export function sparkline(values, color = 'var(--series-1)', w = 120, h = 30) {
  const root = svg('svg', { viewBox: `0 0 ${w} ${h}`, class: 'spark', 'aria-hidden': 'true' });
  if (values.length < 2) { root.append(svg('text', { x: 0, y: h / 2 + 4, style: 'font-size:10px;fill:var(--muted)' }, values.length ? 'one point' : 'no history')); return root; }
  const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  const X = i => 3 + i * (w - 6) / (values.length - 1), Y = v => h - 4 - (v - lo) / span * (h - 8);
  root.append(svg('path', { d: values.map((v, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(v)).join(' '), style: `fill:none;stroke:${color};stroke-width:1.8` }));
  root.append(svg('circle', { cx: X(values.length - 1), cy: Y(values[values.length - 1]), r: 3, style: `fill:${color}` }));
  return root;
}

/** Budget positioning chart: x = appetite (risk-averse 0.1 → risk-seeking 0.9), y = cyber budget as % of IT.
 *  Shaded bands, the guideline curve, and points for the current spend and each arbitrage option.
 *  A point whose spend is outside the 4–12% band has no implied appetite; it sits in the margin zone
 *  ("above ceiling" left, "below floor" right) rather than being forced onto the curve. */
export function bandChart({ target, anchors, band, points, width = 760, height = 340 }) {
  const m = { l: 52, r: 18, t: 30, b: 44 }, W = width - m.l - m.r, H = height - m.t - m.b;
  const ymax = Math.max(0.14, ...points.map(p => p.y)) * 1.08;
  const X = a => m.l + (a - 0.0) / 1.0 * W, Y = v => m.t + H - v / ymax * H;
  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img', 'aria-label': 'Cybersecurity budget positioning from risk-averse to risk-seeking' });
  const zones = [[0, 0.1, 'Above 12%', 'var(--muted)', 0.05, true], [0.1, anchors.max, 'Risk averse', 'var(--series-1)', 0.16], [anchors.max, anchors.min, 'Neutral zone', 'var(--muted)', 0.08],
    [anchors.min, 0.9, 'Risk seeking', 'var(--series-2)', 0.16], [0.9, 1.0, 'Below 4%', 'var(--bad)', 0.07, true]];
  for (const [a, b, lab, col, op, small] of zones) {
    root.append(svg('rect', { x: X(a), y: m.t, width: X(b) - X(a), height: H, style: `fill:${col};opacity:${op}` }));
    root.append(svg('text', { x: (X(a) + X(b)) / 2, y: m.t - 10, 'text-anchor': 'middle', style: small ? 'font-size:10px' : 'font-weight:600;fill:var(--ink)' }, lab));
  }
  for (const v of [band.max, band.median, band.min]) root.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(v), y2: Y(v), style: 'stroke:var(--line);stroke-dasharray:2 3' }));
  for (const t of ticks(0, ymax, 6)) root.append(svg('text', { x: m.l - 6, y: Y(t) + 4, 'text-anchor': 'end' }, (t * 100).toFixed(0) + '%'));
  for (const a of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) root.append(svg('text', { x: X(a), y: m.t + H + 16, 'text-anchor': 'middle' }, a.toFixed(1)));
  root.append(svg('text', { x: m.l + W / 2, y: height - 6, 'text-anchor': 'middle' }, 'Risk appetite implied by the spend  ←  more averse · more seeking  →'));
  root.append(svg('line', { x1: m.l, x2: m.l + W, y1: m.t + H, y2: m.t + H, style: 'stroke:var(--line)' }));
  const curve = []; for (let a = 0.1; a <= 0.9001; a += 0.01) curve.push([X(a), Y(target(a))]);
  root.append(svg('path', { d: curve.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '), style: 'fill:none;stroke:var(--ink);stroke-width:2' }));
  root.append(svg('text', { x: X(0.115), y: Y(band.max) + 16, style: 'fill:var(--ink)' }, `Guideline ${(band.max * 100).toFixed(0)}% · ${(band.median * 100).toFixed(1)}% · ${(band.min * 100).toFixed(0)}%`));
  // place points; spread the ones that share a margin zone
  const zoneCount = { floor: 0, ceil: 0 };
  const placed = points.map(p => {
    let ax = p.x;
    if (ax === null || ax === undefined) { const z = p.y > band.max ? 'ceil' : 'floor'; const k = zoneCount[z]++; ax = z === 'ceil' ? 0.025 + k * 0.022 : 0.915 + k * 0.022; }
    return Object.assign({}, p, { px: X(Math.max(0.01, Math.min(0.99, ax))), py: Y(p.y) });
  });
  // label collision avoidance: stack labels that would overlap
  const lab = placed.filter(p => p.label).sort((a, b) => a.py - b.py);
  const boxes = [];
  for (const p of lab) {
    let ly = p.py + (p.dy ?? 4);
    const w = p.label.length * 6.6 + 4; let lx = p.px + 10; if (lx + w > width - 4) lx = p.px - 10 - w;
    let guard = 0;
    while (boxes.some(b => Math.abs(b.y - ly) < 13 && lx < b.x + b.w && lx + w > b.x) && guard++ < 20) ly += 13;
    boxes.push({ x: lx, y: ly, w }); p.lx = lx; p.ly = ly;
  }
  for (const p of placed) {
    const { px: x, py: y } = p;
    const shape = p.shape === 'diamond' ? svg('path', { d: `M${x} ${y - 7}L${x + 7} ${y}L${x} ${y + 7}L${x - 7} ${y}Z`, style: `fill:${p.color};stroke:var(--surface);stroke-width:2` })
      : svg('circle', { cx: x, cy: y, r: 6.5, style: `fill:${p.color};stroke:var(--surface);stroke-width:2` });
    root.append(shape);
    if (p.label) {
      if (Math.abs(p.ly - (y + 4)) > 6) root.append(svg('line', { x1: x, y1: y, x2: p.lx > x ? p.lx - 2 : p.lx + p.label.length * 6.6 + 2, y2: p.ly - 4, style: 'stroke:var(--muted);stroke-width:1' }));
      root.append(svg('text', { x: p.lx, y: p.ly, style: 'fill:var(--ink);font-weight:600' }, p.label));
    }
    const hit = svg('circle', { cx: x, cy: y, r: 14, style: 'fill:transparent' });
    hit.addEventListener('mousemove', e => showTip(e, p.tip || p.label)); hit.addEventListener('mouseleave', hideTip);
    root.append(hit);
  }
  return root;
}

/** Arbitrage frontier: cumulative Year-1 treatment cost (x) vs portfolio residual risk (y), with budget envelopes. */
export function frontierChart({ steps, envelopes, width = 760, height = 320, money = fmt }) {
  const m = { l: 64, r: 18, t: 18, b: 40 }, W = width - m.l - m.r, H = height - m.t - m.b;
  const xmax = Math.max(1, ...steps.map(s => s.cost), ...envelopes.map(e => e.x)) * 1.04;
  const ymax = Math.max(1, ...steps.map(s => s.res)) * 1.06;
  const X = v => m.l + v / xmax * W, Y = v => m.t + H - v / ymax * H;
  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img', 'aria-label': 'Residual risk as treatment funding increases' });
  for (const t of ticks(0, ymax, 5)) { root.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(t), y2: Y(t), style: 'stroke:var(--line);stroke-dasharray:2 3' })); root.append(svg('text', { x: m.l - 6, y: Y(t) + 4, 'text-anchor': 'end' }, fmt(t))); }
  for (const t of ticks(0, xmax, 6)) root.append(svg('text', { x: X(t), y: m.t + H + 16, 'text-anchor': 'middle' }, money(t)));
  root.append(svg('text', { x: m.l + W / 2, y: height - 4, 'text-anchor': 'middle' }, 'Cumulative Year-1 treatment cost (scenarios funded in cost-effectiveness order)'));
  root.append(svg('line', { x1: m.l, x2: m.l + W, y1: m.t + H, y2: m.t + H, style: 'stroke:var(--line)' }));
  envelopes.forEach((e, i) => {
    if (e.x <= 0) return;
    root.append(svg('line', { x1: X(e.x), x2: X(e.x), y1: m.t, y2: m.t + H, style: `stroke:${e.color};stroke-width:1.5;stroke-dasharray:5 4` }));
    const right = X(e.x) > m.l + W * 0.72;
    root.append(svg('text', { x: X(e.x) + (right ? -4 : 4), y: m.t + 12 + i * 14, 'text-anchor': right ? 'end' : 'start', style: `fill:var(--ink)` }, e.label));
  });
  const d = steps.map((s, i) => (i ? `H${X(s.cost)}V${Y(s.res)}` : `M${X(s.cost)} ${Y(s.res)}`)).join('');
  root.append(svg('path', { d, style: 'fill:none;stroke:var(--series-1);stroke-width:2' }));
  steps.forEach((s, i) => {
    if (!i) return;
    const c = svg('circle', { cx: X(s.cost), cy: Y(s.res), r: 4.5, style: `fill:${s.above ? 'var(--bad)' : 'var(--series-1)'};stroke:var(--surface);stroke-width:2` });
    const hit = svg('circle', { cx: X(s.cost), cy: Y(s.res), r: 11, style: 'fill:transparent' });
    hit.addEventListener('mousemove', e => showTip(e, `<b>${s.id} — ${s.name}</b>Cost ${money(s.step)} · reduces ${fmt(s.gain)}<br>Cumulative ${money(s.cost)} · residual ${fmt(s.res)}<br>CE ${s.ce.toFixed(2)} per $1k`));
    hit.addEventListener('mouseleave', hideTip);
    root.append(c, hit);
    if (i <= 5) root.append(svg('text', { x: X(s.cost) + (i % 2 ? 7 : -7), y: Y(s.res) + (i % 2 ? -8 : 16), 'text-anchor': i % 2 ? 'start' : 'end', style: 'fill:var(--ink);font-size:10.5px' }, s.id));
  });
  return root;
}

/** Semicircular gauge with threshold bands. dir 'down' = lower is better.
 *  Returns null when the indicator has no thresholds (the caller shows a value tile instead). */
export function gauge({ value, target, warn, crit, dir = 'down', unit = '', fmt = v => String(v), width = 200 }) {
  if ((warn === null || warn === undefined) && (crit === null || crit === undefined)) return null;
  const vals = [value, target, warn, crit].filter(Number.isFinite);
  let max = unit === '%' ? (Math.max(...vals) > 30 ? 100 : Math.ceil(Math.max(...vals) * 1.5)) : Math.max(...vals) * 1.35 || 1;
  if (unit === 'count') max = Math.max(5, Math.ceil(Math.max(...vals) * 1.5));
  if (unit === 'ratio') max = Math.max(1.6, Math.max(...vals) * 1.2);
  const min = 0;
  const h = width * 0.62, cx = width / 2, cy = width * 0.52, r = width * 0.4, sw = width * 0.085;
  const ang = v => Math.PI * (1 - (Math.max(min, Math.min(max, v)) - min) / (max - min));   // π (left) → 0 (right)
  const pt = (v, rr = r) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (a, b, color) => {
    if (!(b > a)) return null;
    const [x1, y1] = pt(a), [x2, y2] = pt(b);
    return svg('path', { d: `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`, style: `fill:none;stroke:${color};stroke-width:${sw};opacity:.85` });
  };
  const w = Number.isFinite(warn) ? warn : crit, c = Number.isFinite(crit) ? crit : warn;
  const bands = dir === 'down'
    ? [[min, w, 'var(--good)'], [w, c, 'var(--warn)'], [c, max, 'var(--bad)']]
    : [[min, c, 'var(--bad)'], [c, w, 'var(--warn)'], [w, max, 'var(--good)']];
  const root = svg('svg', { viewBox: `0 0 ${width} ${h}`, class: 'chart gauge', role: 'img', 'aria-label': `value ${fmt(value)}` });
  root.append(svg('path', { d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, style: `fill:none;stroke:var(--line);stroke-width:${sw}` }));
  for (const [a, b, col] of bands) { const p = arc(Math.max(min, a), Math.min(max, b), col); if (p) root.append(p); }
  if (Number.isFinite(target)) { const [x1, y1] = pt(target, r - sw * 0.75), [x2, y2] = pt(target, r + sw * 0.75); root.append(svg('line', { x1, y1, x2, y2, style: 'stroke:var(--ink);stroke-width:2.5' })); }
  if (Number.isFinite(value)) {
    const [nx, ny] = pt(value, r - sw * 0.2);
    root.append(svg('line', { x1: cx, y1: cy, x2: nx, y2: ny, style: 'stroke:var(--ink);stroke-width:3;stroke-linecap:round' }), svg('circle', { cx, cy, r: 5, style: 'fill:var(--ink)' }));
  }
  root.append(svg('text', { x: cx - r, y: cy + 16, 'text-anchor': 'middle' }, fmt(min)), svg('text', { x: cx + r, y: cy + 16, 'text-anchor': 'middle' }, fmt(max)));
  return root;
}

/** Multi-year cybersecurity budget as % of IT budget: stacked baseline + committed initiatives, planned spend
 *  and actual spend markers, guideline lines at 4% / 7.8% / 12% and the appetite-consistent target. One axis (%). */
export function yearsChart({ years, band, target, width = 760, height = 300, money = fmt }) {
  const m = { l: 50, r: 120, t: 16, b: 36 }, W = width - m.l - m.r, H = height - m.t - m.b;
  const pct = (v, it) => it > 0 ? v / it : 0;
  const ymax = Math.max(0.14, ...years.flatMap(y => [pct(y.baseline + y.committed, y.it), pct(y.planned, y.it), pct(y.actual || 0, y.it)])) * 1.1;
  const Y = v => m.t + H - v / ymax * H;
  const slot = W / Math.max(1, years.length), bw = Math.min(46, slot * 0.42);
  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'chart', role: 'img', 'aria-label': 'Cybersecurity budget by year as a share of the IT budget' });
  for (const t of ticks(0, ymax, 5)) { root.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(t), y2: Y(t), style: 'stroke:var(--line);stroke-dasharray:2 3' })); root.append(svg('text', { x: m.l - 6, y: Y(t) + 4, 'text-anchor': 'end' }, (t * 100).toFixed(0) + '%')); }
  const lines = [[band.min, '4% risk seeking', 'var(--series-2)'], [band.median, '7.8% neutral', 'var(--muted)'], [band.max, '12% risk averse', 'var(--series-1)'], [target, `target ${(target * 100).toFixed(1)}%`, 'var(--ink)']];
  const used = [];
  for (const [v, lab, col] of lines) {
    root.append(svg('line', { x1: m.l, x2: m.l + W, y1: Y(v), y2: Y(v), style: `stroke:${col};stroke-width:${col === 'var(--ink)' ? 2 : 1.5};stroke-dasharray:${col === 'var(--ink)' ? '0' : '5 4'}` }));
    let ly = Y(v) + 4; while (used.some(u => Math.abs(u - ly) < 12)) ly += 12; used.push(ly);
    root.append(svg('text', { x: m.l + W + 6, y: ly, style: `fill:var(--ink)` }, lab));
  }
  years.forEach((y, i) => {
    const cx = m.l + slot * (i + 0.5), x = cx - bw / 2;
    const b0 = pct(y.baseline, y.it), c0 = pct(y.committed, y.it);
    const segs = [[0, b0, 'var(--muted)', 'Baseline (run)', y.baseline], [b0, b0 + c0, 'var(--series-1)', 'Committed initiatives', y.committed]];
    for (const [a, bb, col, lab, v] of segs) {
      if (bb <= a) continue;
      const r = svg('rect', { x, y: Y(bb), width: bw, height: Math.max(1, Y(a) - Y(bb) - (a > 0 ? 2 : 0)), rx: 3, style: `fill:${col};opacity:${col === 'var(--muted)' ? 0.45 : 0.9}` });
      r.addEventListener('mousemove', e => showTip(e, `<b>${y.year} · ${lab}</b>${money(v)} · ${(pct(v, y.it) * 100).toFixed(2)}% of IT`)); r.addEventListener('mouseleave', hideTip);
      root.append(r);
    }
    if (y.planned > 0) { const yy = Y(pct(y.planned, y.it)); root.append(svg('line', { x1: x - 6, x2: x + bw + 6, y1: yy, y2: yy, style: 'stroke:var(--series-2);stroke-width:3' })); }
    if (y.actual > 0) { const yy = Y(pct(y.actual, y.it)); const d = svg('path', { d: `M${cx} ${yy - 7}L${cx + 7} ${yy}L${cx} ${yy + 7}L${cx - 7} ${yy}Z`, style: 'fill:var(--ink);stroke:var(--surface);stroke-width:2' });
      d.addEventListener('mousemove', e => showTip(e, `<b>${y.year} · actual</b>${money(y.actual)} · ${(pct(y.actual, y.it) * 100).toFixed(2)}% of IT`)); d.addEventListener('mouseleave', hideTip); root.append(d); }
    root.append(svg('text', { x: cx, y: m.t + H + 18, 'text-anchor': 'middle', style: y.selected ? 'fill:var(--ink);font-weight:700' : '' }, String(y.year) + (y.it > 0 ? '' : ' (no IT budget)')));
  });
  root.append(svg('line', { x1: m.l, x2: m.l + W, y1: m.t + H, y2: m.t + H, style: 'stroke:var(--line)' }));
  return root;
}
