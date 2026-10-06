/* CyberRiskGuardian Desktop — offline cache. Bump CACHE when any file changes.
   Network-first since 1.1.1: when the app is being served, the served files always win, so a new
   version shows at once; the cache is used only when no server is running (installed app offline). */
const CACHE = "crg-desktop-1.5.6";
const FILES = ["./", "index.html", "styles.css", "threat.js", "crg.js", "cvss4.js", "sample.js", "medibec.js", "kb.js",
  "js/app.js", "js/version.js", "js/nav.js", "js/util.js", "js/store.js", "js/state.js", "js/ontology.js", "js/picker.js", "js/extract.js", "js/snapgen.js",
  "js/charts.js", "js/kri.js", "js/xlsx.js", "js/exportx.js",
  "js/helper.js", "js/catalog.js", "js/recommend.js", "js/backup.js", "js/forecast.js", "js/ai.js", "js/triage.js", "js/feedparse.js", "js/anon.js", "js/registry.js", "js/assets.js", "js/data/controls.js", "js/data/sources.js", "js/data/methods.js", "js/frameworks.js",
  "js/prefs.js", "js/i18n.js", "js/i18n/fr.js", "js/users.js", "js/process.js", "js/aiui.js", "js/extractor.js", "js/help.js", "js/chat.js", "js/linker.js", "js/importer.js", "USER-GUIDE.md",
  "js/panels/org.js", "js/panels/dashboard.js", "js/panels/register.js", "js/panels/scenario.js", "js/panels/batch.js",
  "js/panels/calc.js", "js/panels/recs.js", "js/panels/threats.js", "js/panels/vulns.js", "js/panels/threatctx.js",
  "js/panels/cvss.js", "js/panels/budget.js", "js/panels/export.js", "js/panels/online.js",
  "js/panels/assets.js", "js/panels/riskreg.js", "js/panels/mitigation.js", "js/panels/feeds.js", "js/panels/frameworks.js", "js/panels/compliance.js", "js/panels/share.js", "js/panels/ai.js", "js/panels/forecast.js", "js/panels/backup.js", "js/panels/settings.js", "js/panels/settings_more.js", "js/panels/process.js", "js/panels/about.js", "js/panels/links.js", "js/panels/settings_ai.js", "js/panels/importui.js", "js/panels/settings_files.js",
  "frameworks/nist-800-171r3.json", "frameworks/itsp-10-171.json", "frameworks/cobit-2019.json",
  "examples/threat-context/threat-context-example.json",
  "js/safeguards.js", "js/maturity.js", "js/variety.js", "js/panels/safeguards.js", "js/panels/maturity.js",
  "js/guidelines.js", "js/reset.js", "js/panels/reset.js",
  "help/page.css", "help/md.js", "help/step-by-step.html", "help/user-guide.html", "help/reset-confirm.html",
  "manifest.webmanifest", "icons/icon-32.png", "icons/icon-64.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
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
