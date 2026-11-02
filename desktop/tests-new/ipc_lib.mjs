// Helpers shared by the identity, privilege & configuration suites (t32–t39).
export async function ipcOn(page, on = true) {
  await page.evaluate(async on => (await import('/js/modules.js')).set('ipc', on), on);
}
export async function medibec(page) {
  return page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name)); if (ex && st.S.ws.id !== ex.id) await st.select(ex.id); return st.S.ws.name; });
}
export async function goto(page, hash, ms = 600) { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(ms); }
