/* screencodes.js — one stable code per route (1.9.3, T7).

   Every screen ("org") and every tab or sub-menu entry ("org/crown") has a code SCR-nn that never changes once
   published, so a tester, a user and the documentation can name exactly the same screen in either language. The codes are
   shown in Help → Help on this screen, as a faint token in the footer, and in "Copy diagnostics". A retired route keeps
   its code (never reused). tools/route_code_check.py fails when a route has no code or a code is used twice; to give a
   new route its code run `python3 tools/route_code_check.py --add`.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const CODES = {
  'process': 'SCR-01',
  'about': 'SCR-02',
  'reset': 'SCR-03',
  'org': 'SCR-04',
  'dashboard': 'SCR-05',
  'assets': 'SCR-06',
  'safeguards': 'SCR-07',
  'maturity': 'SCR-08',
  'evidence': 'SCR-09',
  'register': 'SCR-10',
  'scenario': 'SCR-11',
  'batch': 'SCR-12',
  'screening': 'SCR-13',
  'calc': 'SCR-14',
  'riskreg': 'SCR-15',
  'mitigation': 'SCR-16',
  'recs': 'SCR-17',
  'threats': 'SCR-18',
  'vulns': 'SCR-19',
  'feeds': 'SCR-20',
  'threat': 'SCR-21',
  'frameworks': 'SCR-22',
  'compliance': 'SCR-23',
  'share': 'SCR-24',
  'ontology': 'SCR-25',
  'registry': 'SCR-26',
  'isp': 'SCR-27',
  'writer': 'SCR-28',
  'isms': 'SCR-29',
  'csm': 'SCR-30',
  'audit': 'SCR-31',
  'qc': 'SCR-32',
  'shared': 'SCR-33',
  'iam': 'SCR-34',
  'cm': 'SCR-35',
  'siem': 'SCR-36',
  'soar': 'SCR-37',
  'summary': 'SCR-38',
  'cvss': 'SCR-39',
  'budget': 'SCR-40',
  'export': 'SCR-41',
  'ai': 'SCR-42',
  'forecast': 'SCR-43',
  'backup': 'SCR-44',
  'settings': 'SCR-45',
  'screening/candidates': 'SCR-46',
  'screening/screen': 'SCR-47',   // 1.9.3: stage ② Screen (was screening/families); SCR-49, SCR-50 retired with the old tabs
  'screening/select': 'SCR-48',   // 1.9.3: stage ③ Select (was screening/weights)
  'screening/create': 'SCR-51',   // 1.9.3: stage ④ Create scenarios (was screening/final)
  'isms/overview': 'SCR-52',
  'isms/exceptions': 'SCR-53',
  'isp/overview': 'SCR-54',
  'isp/policies': 'SCR-55',
  'isp/policy': 'SCR-56',
  'isp/reviews': 'SCR-57',
  'isp/applicability': 'SCR-58',
  'isp/acks': 'SCR-59',
  'isp/issues': 'SCR-60',
  'writer/start': 'SCR-61',
  'writer/interview': 'SCR-62',
  'writer/documents': 'SCR-63',
  'writer/legal': 'SCR-64',
  'writer/library': 'SCR-65',
  'writer/decisions': 'SCR-66',
  'writer/generate': 'SCR-67',
  'writer/word': 'SCR-68',
  'csm/tests': 'SCR-69',
  'csm/governance': 'SCR-70',
  'csm/decisions': 'SCR-71',
  'csm/incidents': 'SCR-72',
  'iam/overview': 'SCR-73',
  'iam/accounts': 'SCR-74',
  'iam/privileged': 'SCR-75',
  'iam/emergency': 'SCR-76',
  'iam/reviews': 'SCR-77',
  'iam/sod': 'SCR-78',
  'iam/findings': 'SCR-79',
  'iam/import': 'SCR-80',
  'cm/overview': 'SCR-81',
  'cm/baselines': 'SCR-82',
  'cm/deviations': 'SCR-83',
  'cm/changes': 'SCR-84',
  'cm/findings': 'SCR-85',
  'cm/import': 'SCR-86',
  'shared/evidence': 'SCR-87',
  'shared/actions': 'SCR-88',
  'shared/exceptions': 'SCR-89',
  'shared/mappings': 'SCR-90',
  'compliance/dashboard': 'SCR-91',
  'compliance/obligations': 'SCR-92',
  'compliance/applicability': 'SCR-93',
  'compliance/programmes': 'SCR-94',
  'compliance/mappings': 'SCR-95',
  'compliance/assessment': 'SCR-96',
  'compliance/requirements': 'SCR-97',
  'compliance/campaigns': 'SCR-98',
  'compliance/determinations': 'SCR-99',
  'compliance/calendar': 'SCR-100',
  'compliance/submissions': 'SCR-101',
  'compliance/changes': 'SCR-102',
  'compliance/ai': 'SCR-103',
  'compliance/report': 'SCR-104',
  'audit/dashboard': 'SCR-105',
  'audit/charter': 'SCR-106',
  'audit/universe': 'SCR-107',
  'audit/plan': 'SCR-108',
  'audit/engagements': 'SCR-109',
  'audit/programmes': 'SCR-110',
  'audit/workpapers': 'SCR-111',
  'audit/findings': 'SCR-112',
  'audit/followup': 'SCR-113',
  'audit/reports': 'SCR-114',
  'audit/quality': 'SCR-115',
  'audit/assurance': 'SCR-116',
  'audit/trace': 'SCR-117',
  'siem/dashboard': 'SCR-118',
  'siem/sources': 'SCR-119',
  'siem/rules': 'SCR-120',
  'siem/coverage': 'SCR-121',
  'siem/alerts': 'SCR-122',
  'siem/intel': 'SCR-123',
  'siem/import': 'SCR-124',
  'soar/dashboard': 'SCR-125',
  'soar/cases': 'SCR-126',
  'soar/incidents': 'SCR-127',
  'soar/playbooks': 'SCR-128',
  'soar/approvals': 'SCR-129',
  'soar/actions': 'SCR-130',
  'soar/simulations': 'SCR-131',
  'soar/lessons': 'SCR-132',
  'settings/general': 'SCR-133',
  'settings/modules': 'SCR-134',
  'settings/logs': 'SCR-135',
  'settings/ai': 'SCR-136',
  'settings/kb': 'SCR-137',
  'settings/users': 'SCR-138',
  'settings/files': 'SCR-139',
  'settings/links': 'SCR-140',
  'settings/sources': 'SCR-141',
  'settings/schedule': 'SCR-142',
  'settings/network': 'SCR-143',
  'settings/simulation': 'SCR-144',
  'settings/backup': 'SCR-145',
  'registry/browse': 'SCR-146',
  'registry/contribute': 'SCR-147',
  'registry/mine': 'SCR-148',
  'registry/moderate': 'SCR-149',
  'registry/settings': 'SCR-150',
  'org/profile': 'SCR-151',
  'org/crown': 'SCR-152',
  'org/docs': 'SCR-153',
  'org/import': 'SCR-154',
  'org/evidence': 'SCR-155',
  'org/workspaces': 'SCR-156',
  // @@END
};

/** The code of a route: the tab's own code when it has one, else the code of the screen. */
export function codeOf(panel, arg) {
  const tab = (arg || '').split('/')[0];
  return (tab && CODES[`${panel}/${tab}`]) || CODES[panel] || '';
}
export const routeOf = code => Object.keys(CODES).find(r => CODES[r] === code) || '';

/** The route key of the current screen without anything typed by a person: "org/crown", never an id or a name. */
export function routeKey(panel, arg) {
  const tab = (arg || '').split('/')[0];
  return tab && CODES[`${panel}/${tab}`] ? `${panel}/${tab}` : panel;
}

/** The diagnostics text: application version, screen code, route, data version, engine status, language. No workspace content. */
export async function diagnostics(panel, arg) {
  const { VERSION, CHANNEL } = await import('./version.js');
  let dv = '—';
  try { const st = await import('./state.js'); dv = String(st.S.ws?.dataVersion ?? '—'); } catch { /* no workspace open */ }
  const eng = (document.getElementById('engine-short')?.textContent || '').trim() || '—';
  let lang = 'en'; try { lang = (await import('./i18n.js')).current?.() || document.documentElement.lang || 'en'; } catch { lang = document.documentElement.lang || 'en'; }
  return ['CyberRiskGuardian Desktop diagnostics',
    `Version: ${VERSION} ${CHANNEL}`, `Screen code: ${codeOf(panel, arg) || '—'}`, `Route: #/${routeKey(panel, arg)}`,
    `Data version: ${dv}`, `Engine: ${eng}`, `Language: ${lang}`, 'No workspace content is included.'].join('\n');
}
