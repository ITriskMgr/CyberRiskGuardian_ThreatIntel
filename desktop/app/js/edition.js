/* edition.js — the edition this build is packaged as (one place; decision D3).

   The application has one code base and three editions, which differ only in what the package may carry:
     community    free for students and non-profit organizations — CIS Controls v8.1 titles and the CRGO
                  paraphrased safeguard labels are shown, with the CIS notice (CC BY-NC-ND 4.0);
     educational  the Educational Licence (colleges, universities) — same content as community;
     commercial   the Commercial Licence — CIS Controls v8.1 by identifier only (no title, no paraphrased
                  safeguard label) until CIS approves their use in a paid product.
   The source tree is always the community edition. tools/package_desktop.py --edition <id> writes the EDITION
   line below in the packaged copy and, for the commercial edition, strips the CIS titles and labels from
   js/data/controls.js in that copy, so a commercial package never carries them. catalog.js also applies the
   switch at run time (identifiers only when cisTitles is false), so the flag alone is enough even if a package
   were built by hand. Nothing else differs between editions. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** The edition id: 'community' | 'educational' | 'commercial'. The package script sets this line. */
export const EDITION = 'community';
/** Whether CIS Controls v8.1 titles and CRGO safeguard labels may be shown (D3: not in the commercial edition). */
export const CIS_TITLES = EDITION !== 'commercial';
/** What the interface calls the edition. */
export const EDITION_LABEL = { community: 'Community edition', educational: 'Educational edition', commercial: 'Commercial edition' }[EDITION] || EDITION;
/** The CIS notice shown with the CIS Controls v8.1 framework in this edition. */
export const CIS_NOTICE = CIS_TITLES
  ? 'CIS Controls v8.1 © Center for Internet Security, Inc. Control titles and CRGO’s own paraphrased safeguard labels are shown for non-commercial use under CC BY-NC-ND 4.0; cite CIS by identifier (https://www.cisecurity.org/controls/v8-1).'
  : 'CIS Controls v8.1 © Center for Internet Security, Inc. This edition lists CIS controls and safeguards by identifier only, pending CIS approval of the titles in a commercial product; see https://www.cisecurity.org/controls/v8-1 for the titles.';
