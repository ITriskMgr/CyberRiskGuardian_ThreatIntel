/* version.js — the version of the application, in one place.

   Every module that needs to name the version imports it from here; tools/version_check.py fails the
   build when the files that cannot import it (index.html, sw.js, serve.py) disagree with this one.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** Application version, without a leading "v" and without the channel. */
export const VERSION = '1.8.1';
/** Release channel. The 1.8.x line is a beta, not a certified product. */
export const CHANNEL = 'beta';
/** The release line shown to people: "1.6.x". */
export const SERIES = VERSION.replace(/\.\d+$/, '.x');
/** What to show in a pill or a heading: "1.6.1 beta". */
export const LABEL = VERSION + ' ' + CHANNEL;
/** The Security Policy Writer module: its own version (the helper's crg_writer/__init__.py must agree). */
export const WRITER_NAME = 'CyberRiskGuardian Security Policy Writer';
export const WRITER_VERSION = '0.1.0';
/** What a generated file should name as its generator. */
export const GENERATOR = `CyberRiskGuardian Desktop ${VERSION} (${CHANNEL})`;
