/* markers.js — the three standard markers of the CyberRiskGuardian method, written literally wherever
   they apply (book ch05–ch06, "Evidence discipline and the three markers").

     Analytical estimate — validation required          a value estimated, not obtained from the organization
     Information gap — organizational validation required a fact nobody has supplied that the assessment needs
     Management decision required                         a choice only accountable management can make

   The French interface shows them as « Estimation analytique — validation requise », « Lacune
   d'information — validation organisationnelle requise » and « Décision de la direction requise ».
   Older wordings are still recognised so the quality review can report them as outdated.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';

export const ESTIMATE = 'Analytical estimate — validation required';
export const INFO_GAP = 'Information gap — organizational validation required';
export const MGMT = 'Management decision required';
export const ALL = [ESTIMATE, INFO_GAP, MGMT];

/** Wordings replaced in 1.8.0: detected, and reported as outdated, never written. */
export const OUTDATED = [
  [/Analyst estimates?\s*[—–-]\s*validation required/i, ESTIMATE],
  [/Evidence gap\s*[—–-]\s*organi[sz]ational input required/i, INFO_GAP],
  [/Lacune de preuve\s*[—–-]\s*renseignement organisationnel requis/i, 'Lacune d’information — validation organisationnelle requise'],
];

/** Every outdated marker found in a value (any depth): [{ path, found, use }]. */
export function findOutdated(value, path = '', out = [], depth = 0) {
  if (depth > 12 || out.length > 200) return out;
  if (typeof value === 'string') {
    for (const [re, use] of OUTDATED) { const m = re.exec(value); if (m) out.push({ path, found: m[0], use }); }
  } else if (Array.isArray(value)) value.forEach((v, i) => findOutdated(v, `${path}[${i}]`, out, depth + 1));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) findOutdated(v, path ? `${path}.${k}` : k, out, depth + 1);
  return out;
}
/** Replace outdated wordings in a string with the standard markers. */
export const modernize = s => typeof s === 'string' ? OUTDATED.reduce((t, [re, use]) => t.replace(new RegExp(re.source, 'gi'), use), s) : s;
