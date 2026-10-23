// guide_parts.mjs — the parts of USER-GUIDE.md (and USER-GUIDE.fr.md) that come from the application's own
// data: the table of the process steps and the guidelines in detail. Run with node from the app folder:
//   node tools/guide_parts.mjs > /tmp/parts.md          (English)
//   node tools/guide_parts.mjs fr > /tmp/parts.fr.md    (French, from the interface catalogue js/i18n/fr.js)
// so the guide never describes a step or a guideline differently from the Process screen.
import { readFileSync } from 'fs';
const load = async p => import('data:text/javascript;base64,' + Buffer.from(readFileSync(p, 'utf8')
  .replace(/^import .*$/mg, '').replace(/^export \{ GUIDELINES \};$/m, '')).toString('base64'));
globalThis.self = {}; globalThis.CRG = { BAND_HIGH: 1.1 };
const lang = process.argv[2] || 'en';
const FR = lang === 'fr' ? (await import('data:text/javascript;base64,' + Buffer.from(readFileSync('js/i18n/fr.js', 'utf8')).toString('base64'))).default : {};
const t = s => (lang === 'fr' && FR[s] !== undefined ? FR[s] : s);
const G = (await load('js/guidelines.js')).GUIDELINES;
const src = readFileSync('js/process.js', 'utf8');
const steps = [...src.matchAll(/\{ id: '(\w+)', n: (\d+|'R'), (?:g: '\w+', )?title: '([^']+)',[\s\S]*?done: '([^']+)',\s*screens: (\[[^\n]*\]),/g)]
  .map(m => ({ n: m[2] === "'R'" ? t('Report') : +m[2], title: t(m[3]), done: t(m[4]), screens: eval(m[5]).map(x => t(x[1])).join(', ') }));
const H = lang === 'fr' ? ['| # | Étape | Terminée quand | Écrans |', '|---|---|---|---|'] : ['| # | Step | Done when | Screens |', '|---|---|---|---|'];
const out = [...H, ...steps.map(s => `| ${s.n} | ${s.title} | ${s.done} | ${s.screens} |`), '',
  'GUIDELINES-SUMMARY', ...G.map((g, i) => `${i + 1}. **${t(g.h)}.** ${t(g.t)}`), '', 'GUIDELINES-DETAIL'];
const W = lang === 'fr' ? ['*Où :*', '*Terminé quand :*'] : ['*Where:*', '*Done when:*'];
G.forEach((g, i) => { out.push(`#### ${i + 1}. ${t(g.h)}`, '', t(g.t), '', `${W[0]} ${t(g.where)}`, '', ...g.steps.map((x, j) => `${j + 1}. ${t(x)}`), '', `${W[1]} ${t(g.done)}`, ''); });
console.log(out.join('\n'));
