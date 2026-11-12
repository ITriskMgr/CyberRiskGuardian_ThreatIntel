/* CyberRiskGuardian Desktop — offline cache. Bump CACHE when any file changes.
   Network-first since 1.1.1: when the app is being served, the served files always win, so a new
   version shows at once; the cache is used only when no server is running (installed app offline). */
const CACHE = "crg-desktop-1.9.3";
const FILES = ["./", "index.html", "styles.css", "threat.js", "crg.js", "cvss4.js", "sample.js", "medibec.js", "kb.js",
  "canaretail.js", "medibec-fr.js",
  "js/app.js", "js/version.js", "js/nav.js", "js/util.js", "js/store.js", "js/state.js", "js/ontology.js", "js/picker.js", "js/extract.js", "js/snapgen.js",
  "js/charts.js", "js/kri.js", "js/xlsx.js", "js/exportx.js",
  "js/helper.js", "js/catalog.js", "js/recommend.js", "js/backup.js", "js/forecast.js", "js/ai.js", "js/triage.js", "js/feedparse.js", "js/anon.js", "js/data/anon-words.js", "js/registry.js", "js/assets.js", "js/data/controls.js", "js/data/sources.js", "js/data/methods.js", "js/data/chapters.js", "js/chapterhelp.js", "js/frameworks.js",
  "js/prefs.js", "js/detail.js", "js/helpmenu.js", "js/whyscreen.js", "js/a11y.js", "js/winlock.js", "js/teaching.js", "js/setupwizard.js", "js/i18n.js", "js/i18n/fr.js", "js/users.js", "js/process.js", "js/aiui.js", "js/extractor.js", "js/help.js", "js/chat.js", "js/linker.js", "js/importer.js", "USER-GUIDE.md", "USER-GUIDE.fr.md",
  "js/panels/org.js", "js/panels/dashboard.js", "js/panels/register.js", "js/panels/scenario.js", "js/panels/batch.js",
  "js/panels/calc.js", "js/panels/recs.js", "js/panels/threats.js", "js/panels/vulns.js", "js/panels/threatctx.js",
  "js/panels/cvss.js", "js/panels/budget.js", "js/panels/export.js", "js/panels/online.js",
  "js/panels/assets.js", "js/panels/riskreg.js", "js/panels/mitigation.js", "js/panels/feeds.js", "js/panels/frameworks.js", "js/panels/compliance.js", "js/panels/share.js", "js/panels/ai.js", "js/panels/forecast.js", "js/panels/backup.js", "js/panels/settings.js", "js/panels/settings_more.js", "js/panels/process.js", "js/panels/about.js", "js/panels/links.js", "js/panels/settings_ai.js", "js/panels/importui.js", "js/panels/settings_files.js",
  "frameworks/nist-800-171r3.json", "frameworks/itsp-10-171.json", "frameworks/cobit-2019.json",
  "examples/threat-context/threat-context-example.json",
  "js/safeguards.js", "js/maturity.js", "js/variety.js", "js/panels/safeguards.js", "js/panels/maturity.js",
  "js/guidelines.js", "js/reset.js", "js/avl.js", "js/panels/reset.js",
  "js/crgo.js", "js/rhub.js", "js/isp.js", "js/modules.js", "js/panels/ontology.js", "js/panels/rhub.js", "js/panels/isp.js", "js/panels/isms.js", "js/panels/csm.js", "js/panels/audit.js", "js/panels/qc.js", "js/panels/ontology_link.js", "js/panels/compliance_legal.js", "js/migrate.js", "js/dss.js", "js/grcui.js", "data/crgo-assurance.json", "js/panels/compliance_plus.js", "data/crgo-snapshot.json",
  "help/page.css", "help/md.js", "help/step-by-step.html", "help/user-guide.html", "help/reset-confirm.html",
  "manifest.webmanifest", "icons/icon-32.png", "icons/icon-64.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "js/ams.js", "js/cms.js", "js/helpdesc.js", "js/logs.js", "js/menu.js", "js/shared.js", "js/siem.js", "js/soar.js", "js/panels/audit_findings.js", "js/panels/audit_plan.js", "js/panels/audit_ui.js", "js/panels/audit_work.js", "js/panels/cms.js", "js/panels/isp_common.js", "js/panels/isp_editor.js", "js/panels/isp_people.js", "js/panels/isp_reviews.js", "js/panels/settings_logs.js", "js/panels/settings_sim.js", "js/panels/shared.js", "js/panels/siem.js", "js/panels/siem_alerts.js", "js/panels/siem_rules.js", "js/panels/soar.js", "js/panels/soar_ops.js",
  "js/secops_seed.js", "js/simgen.js", "js/data/scenpatterns.js",
  "medibec-screening.js", "js/equiv.js", "js/markers.js", "js/screening.js", "js/updates.js", "js/updateui.js", "js/data/legacy-map.js", "js/panels/evidence.js", "js/regcore.js", "js/iam.js", "js/cm.js", "js/panels/regcore.js", "js/panels/iam.js", "js/panels/cm.js", "js/panels/iam_regs.js", "js/panels/cm_regs.js", "js/data/iam-samples.js", "js/data/cm-samples.js", "js/panels/screening.js", "js/panels/summary.js", "js/writer.js", "js/panels/writer.js", "js/panels/writer_steps.js", "js/dashpack.js",
  "js/kbindex.js", "js/kblib.js", "js/consult.js", "js/consultui.js", "js/panels/settings_kb.js",
  "kb/book/00-introduction.md", "kb/book/ch01.md", "kb/book/ch02.md", "kb/book/ch03.md", "kb/book/ch04.md", "kb/book/ch05.md", "kb/book/ch06.md", "kb/book/ch07.md", "kb/book/ch08.md", "kb/book/ch09.md", "kb/book/ch10.md", "kb/book/ch11.md", "kb/book/ch12.md", "kb/book/ch13.md", "kb/book/ch14.md", "kb/book/ch15.md", "kb/book/ch16.md", "kb/book/ch17.md", "kb/book/ch18.md", "kb/book/ch19.md", "kb/book/ch20.md", "kb/book/ch21.md", "kb/book/index.json", "kb/book/zz-appendix.md",
  "data/simulation/index.json", "data/simulation/medibec/build-medibec.mjs", "data/simulation/medibec/manifest.json", "data/simulation/medibec/siem.json", "data/simulation/medibec/soar.json",
  // 1.9.0 — SSVC and AI forecasting lane
  "js/ssvc.js", "js/data/ssvc-tables.js", "js/panels/ssvc.js", "js/aiforecast.js", "js/panels/aiforecast.js",
  // 1.9.0 — Atlas: the bundled fonts (SIL OFL 1.1), so the interface keeps its type offline
  "fonts/sora-latin-500-normal.woff2", "fonts/sora-latin-600-normal.woff2", "fonts/sora-latin-700-normal.woff2",
  "fonts/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-latin-400-italic.woff2", "fonts/atkinson-hyperlegible-latin-700-normal.woff2", "js/tabkeys.js",
  // 1.9.2 — data version 6: the sub-step lists of the workstreams
  "js/receffect.js", "js/screenai.js", "js/migrate192.js", "js/migrate192/ws1.js", "js/migrate192/ws2.js", "js/migrate192/ws3.js", "js/migrate192/ws4.js", "js/migrate192/ws5.js", "js/migrate192/review.js",
  // 1.9.2 — the edition switch (D3)
  "js/edition.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;   // helper API: never cached
  e.respondWith(fetch(e.request, { cache: "no-store" }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match("index.html"))));
});
