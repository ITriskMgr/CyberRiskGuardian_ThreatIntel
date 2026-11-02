/* ssvc-tables.js — the SSVC decision tables, exactly as published (1.9.0).

   ONE data table per tree, copied row for row from the CERT/CC SSVC repository (which also publishes
   CISA's tree): https://github.com/CERTCC/SSVC, commit bf3213bc0bd2bf3cf1329c9b48f72d7163a682b1, files
     data/csv/cisa/cisa_coordinator_2_0_3.csv                     (CISA SSVC — Track / Track* / Attend / Act)
     data/csv/ssvc/deployer_patch_application_priority_1_0_0.csv  (deployer — Defer / Scheduled / Out-of-Cycle / Immediate)
     data/csv/ssvc/supplier_patch_development_priority_1_0_0.csv  (supplier — Defer / Scheduled / Out-of-Cycle / Immediate)
     data/csv/ssvc/human_impact_1_0_0.csv, utility_1_0_0.csv, public_safety_impact_1_0_0.csv (sub-trees)
   Values are the published keys in lower case. The author can diff each block against its CSV.

   The one cell NOT in a published CSV: Mission and Well-Being Impact for Mission Prevalence = minimal with
   Public Well-Being Impact = material. The SSVC decision-point definition (mission_and_well_being_impact
   1.0.0) defines low = minimal AND minimal, medium = support AND (minimal OR material), high = essential OR
   irreversible, which leaves minimal + material undefined; CISA's SSVC Guide (November 2022), Table
   "Mission and Well-being Impact", gives MEDIUM for it, and so does CISA's SSVC calculator
   (https://www.cisa.gov/ssvc-calculator, checked 2026-11-02). Verified; accepted by the author 2026-11-02.
   Nothing here is a probability and nothing here is ever converted into one.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/** CISA SSVC 2.0.3: exploitation, automatable, technical impact, mission & well-being → outcome. */
export const CISA_ROWS = [
    ['none','no','partial','low','track'],
    ['none','no','partial','medium','track'],
    ['none','no','partial','high','track'],
    ['none','no','total','low','track'],
    ['none','no','total','medium','track'],
    ['none','no','total','high','track*'],
    ['none','yes','partial','low','track'],
    ['none','yes','partial','medium','track'],
    ['none','yes','partial','high','attend'],
    ['none','yes','total','low','track'],
    ['none','yes','total','medium','track'],
    ['none','yes','total','high','attend'],
    ['public poc','no','partial','low','track'],
    ['public poc','no','partial','medium','track'],
    ['public poc','no','partial','high','track*'],
    ['public poc','no','total','low','track'],
    ['public poc','no','total','medium','track*'],
    ['public poc','no','total','high','attend'],
    ['public poc','yes','partial','low','track'],
    ['public poc','yes','partial','medium','track'],
    ['public poc','yes','partial','high','attend'],
    ['public poc','yes','total','low','track'],
    ['public poc','yes','total','medium','track*'],
    ['public poc','yes','total','high','attend'],
    ['active','no','partial','low','track'],
    ['active','no','partial','medium','track'],
    ['active','no','partial','high','attend'],
    ['active','no','total','low','track'],
    ['active','no','total','medium','attend'],
    ['active','no','total','high','act'],
    ['active','yes','partial','low','attend'],
    ['active','yes','partial','medium','attend'],
    ['active','yes','partial','high','act'],
    ['active','yes','total','low','attend'],
    ['active','yes','total','medium','act'],
    ['active','yes','total','high','act'],
];

/** CERT/CC SSVC deployer patch application priority 1.0.0: exploitation, system exposure, automatable, human impact → outcome. */
export const DEPLOYER_ROWS = [
    ['none','small','no','low','defer'],
    ['none','small','no','medium','defer'],
    ['none','small','no','high','scheduled'],
    ['none','small','no','very high','scheduled'],
    ['none','small','yes','low','defer'],
    ['none','small','yes','medium','scheduled'],
    ['none','small','yes','high','scheduled'],
    ['none','small','yes','very high','scheduled'],
    ['none','controlled','no','low','defer'],
    ['none','controlled','no','medium','scheduled'],
    ['none','controlled','no','high','scheduled'],
    ['none','controlled','no','very high','scheduled'],
    ['none','controlled','yes','low','scheduled'],
    ['none','controlled','yes','medium','scheduled'],
    ['none','controlled','yes','high','scheduled'],
    ['none','controlled','yes','very high','scheduled'],
    ['none','open','no','low','defer'],
    ['none','open','no','medium','scheduled'],
    ['none','open','no','high','scheduled'],
    ['none','open','no','very high','scheduled'],
    ['none','open','yes','low','scheduled'],
    ['none','open','yes','medium','scheduled'],
    ['none','open','yes','high','scheduled'],
    ['none','open','yes','very high','out-of-cycle'],
    ['public poc','small','no','low','defer'],
    ['public poc','small','no','medium','scheduled'],
    ['public poc','small','no','high','scheduled'],
    ['public poc','small','no','very high','scheduled'],
    ['public poc','small','yes','low','scheduled'],
    ['public poc','small','yes','medium','scheduled'],
    ['public poc','small','yes','high','scheduled'],
    ['public poc','small','yes','very high','scheduled'],
    ['public poc','controlled','no','low','defer'],
    ['public poc','controlled','no','medium','scheduled'],
    ['public poc','controlled','no','high','scheduled'],
    ['public poc','controlled','no','very high','scheduled'],
    ['public poc','controlled','yes','low','scheduled'],
    ['public poc','controlled','yes','medium','scheduled'],
    ['public poc','controlled','yes','high','scheduled'],
    ['public poc','controlled','yes','very high','out-of-cycle'],
    ['public poc','open','no','low','scheduled'],
    ['public poc','open','no','medium','scheduled'],
    ['public poc','open','no','high','scheduled'],
    ['public poc','open','no','very high','out-of-cycle'],
    ['public poc','open','yes','low','scheduled'],
    ['public poc','open','yes','medium','scheduled'],
    ['public poc','open','yes','high','out-of-cycle'],
    ['public poc','open','yes','very high','out-of-cycle'],
    ['active','small','no','low','scheduled'],
    ['active','small','no','medium','scheduled'],
    ['active','small','no','high','out-of-cycle'],
    ['active','small','no','very high','out-of-cycle'],
    ['active','small','yes','low','scheduled'],
    ['active','small','yes','medium','out-of-cycle'],
    ['active','small','yes','high','out-of-cycle'],
    ['active','small','yes','very high','out-of-cycle'],
    ['active','controlled','no','low','scheduled'],
    ['active','controlled','no','medium','scheduled'],
    ['active','controlled','no','high','out-of-cycle'],
    ['active','controlled','no','very high','out-of-cycle'],
    ['active','controlled','yes','low','out-of-cycle'],
    ['active','controlled','yes','medium','out-of-cycle'],
    ['active','controlled','yes','high','out-of-cycle'],
    ['active','controlled','yes','very high','out-of-cycle'],
    ['active','open','no','low','scheduled'],
    ['active','open','no','medium','out-of-cycle'],
    ['active','open','no','high','out-of-cycle'],
    ['active','open','no','very high','immediate'],
    ['active','open','yes','low','out-of-cycle'],
    ['active','open','yes','medium','out-of-cycle'],
    ['active','open','yes','high','immediate'],
    ['active','open','yes','very high','immediate'],
];

/** CERT/CC SSVC supplier patch development priority 1.0.0: exploitation, utility, technical impact, public safety impact → outcome. */
export const SUPPLIER_ROWS = [
    ['none','laborious','partial','minimal','defer'],
    ['none','laborious','partial','significant','scheduled'],
    ['none','laborious','total','minimal','scheduled'],
    ['none','laborious','total','significant','out-of-cycle'],
    ['none','efficient','partial','minimal','scheduled'],
    ['none','efficient','partial','significant','out-of-cycle'],
    ['none','efficient','total','minimal','scheduled'],
    ['none','efficient','total','significant','out-of-cycle'],
    ['none','super effective','partial','minimal','scheduled'],
    ['none','super effective','partial','significant','out-of-cycle'],
    ['none','super effective','total','minimal','out-of-cycle'],
    ['none','super effective','total','significant','out-of-cycle'],
    ['public poc','laborious','partial','minimal','scheduled'],
    ['public poc','laborious','partial','significant','out-of-cycle'],
    ['public poc','laborious','total','minimal','scheduled'],
    ['public poc','laborious','total','significant','immediate'],
    ['public poc','efficient','partial','minimal','scheduled'],
    ['public poc','efficient','partial','significant','immediate'],
    ['public poc','efficient','total','minimal','out-of-cycle'],
    ['public poc','efficient','total','significant','immediate'],
    ['public poc','super effective','partial','minimal','out-of-cycle'],
    ['public poc','super effective','partial','significant','immediate'],
    ['public poc','super effective','total','minimal','out-of-cycle'],
    ['public poc','super effective','total','significant','immediate'],
    ['active','laborious','partial','minimal','out-of-cycle'],
    ['active','laborious','partial','significant','immediate'],
    ['active','laborious','total','minimal','out-of-cycle'],
    ['active','laborious','total','significant','immediate'],
    ['active','efficient','partial','minimal','out-of-cycle'],
    ['active','efficient','partial','significant','immediate'],
    ['active','efficient','total','minimal','out-of-cycle'],
    ['active','efficient','total','significant','immediate'],
    ['active','super effective','partial','minimal','immediate'],
    ['active','super effective','partial','significant','immediate'],
    ['active','super effective','total','minimal','immediate'],
    ['active','super effective','total','significant','immediate'],
];

/** Human Impact 1.0.0: safety impact, mission impact → human impact. */
export const HUMAN_IMPACT_ROWS = [
    ['negligible','degraded','low'],
    ['negligible','mef support crippled','low'],
    ['negligible','mef failure','medium'],
    ['negligible','mission failure','very high'],
    ['marginal','degraded','low'],
    ['marginal','mef support crippled','low'],
    ['marginal','mef failure','medium'],
    ['marginal','mission failure','very high'],
    ['critical','degraded','medium'],
    ['critical','mef support crippled','high'],
    ['critical','mef failure','high'],
    ['critical','mission failure','very high'],
    ['catastrophic','degraded','very high'],
    ['catastrophic','mef support crippled','very high'],
    ['catastrophic','mef failure','very high'],
    ['catastrophic','mission failure','very high'],
];

/** Utility 1.0.0: automatable, value density → utility. */
export const UTILITY_ROWS = [
    ['no','diffuse','laborious'],
    ['no','concentrated','efficient'],
    ['yes','diffuse','efficient'],
    ['yes','concentrated','super effective'],
];

/** Public Safety Impact 1.0.0: safety impact → public safety impact. */
export const PUBLIC_SAFETY_ROWS = [
    ['negligible','minimal'],
    ['marginal','significant'],
    ['critical','significant'],
    ['catastrophic','significant'],
];

/** Mission and Well-Being Impact (CISA): mission prevalence, public well-being impact → mission & well-being. */
export const MWB_ROWS = [
    ['minimal','minimal','low'],
    ['minimal','material','medium'],      // CISA SSVC Guide (Nov 2022) and CISA SSVC calculator; not in the MWI 1.0.0 definition (verified 2026-11-02)
    ['minimal','irreversible','high'],
    ['support','minimal','medium'],
    ['support','material','medium'],
    ['support','irreversible','high'],
    ['essential','minimal','high'],
    ['essential','material','high'],
    ['essential','irreversible','high'],
];
