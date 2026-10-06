/* version.js — the version of the application, in one place (1.5.6).

   Until 1.5.5 the version was written out in seven files and they drifted: About still announced
   1.5.4 while the helper, the service worker and the package were on 1.5.5. Every module that needs
   to name the version now imports it from here, and tools/version_check.py fails the build when the
   three files that cannot import it (index.html, sw.js, serve.py) disagree with this one.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** Application version, without a leading "v" and without the channel. */
export const VERSION = '1.5.6';
/** Release channel. The whole 1.5.x line is a proof of concept, not a certified product. */
export const CHANNEL = 'beta';
/** What to show in a pill or a heading: "1.5.6 beta". */
export const LABEL = VERSION + ' ' + CHANNEL;
/** What a generated file should name as its generator. */
export const GENERATOR = `CyberRiskGuardian Desktop ${VERSION} (${CHANNEL})`;
