// guide_parts.mjs — the parts of USER-GUIDE.md that come from the application's own data (1.5.7):
// the table of the process steps and the guidelines in detail. Run with node from the app folder:
//   node tools/guide_parts.mjs > /tmp/parts.md
// so the guide never describes a step or a guideline differently from the Process screen.
import { readFileSync } from 'fs';
const load = async p => import('data:text/javascript;base64,' + Buffer.from(readFileSync(p, 'utf8')
  .replace(/^import .*$/mg, '').replace(/^export \{ GUIDELINES \};$/m, '')).toString('base64'));
globalThis.self = {}; globalThis.CRG = { BAND_HIGH: 1.1 };
const G = (await load('js/guidelines.js')).GUIDELINES;
const src = readFileSync('js/process.js', 'utf8');
const steps = [...src.matchAll(/\{ id: '(\w+)', n: (\d+), title: '([^']+)',[\s\S]*?done: '([^']+)',\s*screens: (\[[^\n]*\]),/g)]
  .map(m => ({ n: +m[2], title: m[3], done: m[4], screens: eval(m[5]).map(x => x[1]).join(', ') }));
const out = ['| # | Step | Done when | Screens |', '|---|---|---|---|', ...steps.map(s => `| ${s.n} | ${s.title} | ${s.done} | ${s.screens} |`), '',
  'GUIDELINES-SUMMARY', ...G.map((g, i) => `${i + 1}. **${g.h}.** ${g.t}`), '', 'GUIDELINES-DETAIL'];
G.forEach((g, i) => { out.push(`#### ${i + 1}. ${g.h}`, '', g.t, '', `*Where:* ${g.where}`, '', ...g.steps.map((x, j) => `${j + 1}. ${x}`), '', `*Done when:* ${g.done}`, ''); });
console.log(out.join('\n'));
