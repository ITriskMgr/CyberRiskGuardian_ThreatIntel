/* cm-samples.js — teaching-case samples of the Configuration management module.
   Fictional, illustrative counts: population level only, no secrets, no licensed benchmark text. Labels are { en, fr };
   the case language picks one. MediBec: evidence id E15 is the sample's own and is remapped to the next free E-number
   when the sample is loaded (after the Identity & access management sample, which takes E13 and E14); the sample
   exception EXC-90 has expired (2026-09-30). The finding is recorded and linked as evidence only: no proposal, nothing
   accepted, so 84,305 / 41,023 are unchanged. CanaRetail (below): one compensated deviation with its exception, no
   finding, so 27,526 / 16,049 are unchanged. © 2026 Marc-André Léger. CC BY-NC 4.0 */
self.CRG_CM_SAMPLES = Object.assign(self.CRG_CM_SAMPLES || {}, {
  medibec: {
    settings: { asOf: '2026-11-01' },
    evidence: [
      { id: 'E15', title: { en: 'Baseline compliance summary Q3 2026', fr: 'Sommaire de conformité aux configurations de référence T3 2026' },
        supports: { en: 'Supports: S6 (open high-severity configuration degradation)', fr: 'Appuie : S6 (dégradation de configuration ouverte de gravité élevée)' },
        strength: 'moderate', date: '2026-10-15', custodian: 'Infrastructure operations' },
    ],
    baselines: [
      { id: 'BL-01', name: 'Windows Server 2022 hardening', platform: 'Windows Server 2022', kind: 'cis-benchmark', licenceRef: 'CIS SecureSuite — to confirm', owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' }, legacy: false,
        versions: [{ v: '1.2', state: 'approved', approved: '2026-02-01', approvedBy: { en: 'Chief information officer', fr: 'Directeur des technologies de l’information' }, effective: '2026-02-01', review: '2027-02-01', hash: '', rationale: { en: 'Level 1 profile adapted to clinical servers', fr: 'Profil de niveau 1 adapté aux serveurs cliniques' }, applicability: { assetTypes: ['server'], note: '' } }], note: '' },
      { id: 'BL-02', name: 'Clinical workstations Windows 11', platform: 'Windows 11', kind: 'internal', licenceRef: '', owner: { en: 'End-user services', fr: 'Services aux utilisateurs' }, legacy: false,
        versions: [{ v: '2.0', state: 'approved', approved: '2026-04-15', approvedBy: { en: 'Chief information officer', fr: 'Directeur des technologies de l’information' }, effective: '2026-05-01', review: '2027-04-15', hash: '', rationale: { en: 'Workstation build for clinics', fr: 'Configuration des postes des cliniques' }, applicability: { assetTypes: ['hardware'], note: '' } }], note: '' },
      { id: 'BL-03', name: 'Medical-device segment (vendor guide)', platform: 'Connected medical devices', kind: 'vendor', licenceRef: '', owner: { en: 'Biomedical engineering', fr: 'Génie biomédical' }, legacy: false,
        versions: [{ v: '1.0', state: 'draft', approved: '', approvedBy: '', effective: '', review: '', hash: '', rationale: { en: 'Draft from the manufacturers’ hardening guides', fr: 'Ébauche tirée des guides de renforcement des fabricants' }, applicability: { assetTypes: ['iot'], note: '' } }], note: '' },
    ],
    ciScopes: [
      { id: 'CS-01', label: { en: 'Windows servers', fr: 'Serveurs Windows' }, baseline: 'BL-01', version: '1.2', inScope: 96, assigned: 88, assessed: 70, compliant: 58, asOf: '2026-10-15', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: 'E15' },
      { id: 'CS-02', label: { en: 'Clinical workstations', fr: 'Postes cliniques' }, baseline: 'BL-02', version: '2.0', inScope: 1020, assigned: 1020, assessed: 912, compliant: 801, asOf: '2026-10-15', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: 'E15' },
      { id: 'CS-03', label: { en: 'Connected medical devices', fr: 'Dispositifs médicaux connectés' }, baseline: 'BL-03', version: '1.0', inScope: 340, assigned: 0, assessed: null, compliant: null, asOf: '2026-10-15', source: 'E15', status: 'inferred', conf: 'Low', evidence: 'E15' },
    ],
    deviations: [
      { id: 'DV-01', baseline: 'BL-01', version: '1.2', ciScope: 'CS-01', count: 4, cls: 'degradation', severity: 'high', requirement: { en: 'SMBv1 enabled on imaging servers', fr: 'SMBv1 activé sur les serveurs d’imagerie' },
        opened: '2026-08-20', lastSeen: '2026-10-15', state: 'open', owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' }, source: 'E15', status: 'confirmed', conf: 'Medium', evidence: 'E15' },
      { id: 'DV-02', baseline: 'BL-02', version: '2.0', ciScope: 'CS-02', count: 12, cls: 'compensated', severity: 'medium', requirement: { en: 'Laboratory analyser driver needs local administrator rights', fr: 'Le pilote des analyseurs de laboratoire exige des droits d’administrateur local' },
        opened: '2026-05-10', lastSeen: '2026-10-15', exception: 'EXC-90', state: 'open', owner: { en: 'Laboratory manager', fr: 'Gestionnaire du laboratoire' }, source: 'E15', status: 'confirmed', conf: 'Medium', evidence: 'E15' },
      { id: 'DV-03', baseline: 'BL-01', version: '1.2', ciScope: 'CS-01', count: 6, cls: 'unknown', severity: 'medium', requirement: { en: 'Audit policy settings differ from the baseline', fr: 'Les paramètres de la stratégie d’audit diffèrent de la configuration de référence' },
        opened: '2026-09-30', lastSeen: '2026-10-15', state: 'open', owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' }, source: 'E15', status: 'inferred', conf: 'Low', evidence: 'E15' },
    ],
    exceptions: [
      { id: 'EXC-90', title: { en: 'Local administrator rights on laboratory workstations', fr: 'Droits d’administrateur local sur les postes du laboratoire' }, scope: { en: 'Twelve laboratory workstations', fr: 'Douze postes du laboratoire' },
        description: { en: 'Departure from the clinical workstation baseline for the analyser driver', fr: 'Dérogation à la configuration de référence des postes cliniques pour le pilote des analyseurs' },
        compensatedBy: [{ en: 'Application allow-listing on the twelve workstations', fr: 'Liste d’applications autorisées sur les douze postes' }], approvedBy: { en: 'Chief information officer', fr: 'Directeur des technologies de l’information' },
        status: 'accepted', expiry: '2026-09-30', opened: '2026-05-12', concerns: [{ kind: 'deviation', id: 'DV-02' }] },
    ],
    changes: [
      { id: 'CH-01', period: '2026-Q3', type: 'normal', scope: { en: 'Servers and clinical applications', fr: 'Serveurs et applications cliniques' }, count: 212, verified: 188, ticket: '', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'CH-02', period: '2026-Q3', type: 'emergency', scope: { en: 'Servers and clinical applications', fr: 'Serveurs et applications cliniques' }, count: 9, verified: 5, ticket: '', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'CH-03', period: '2026-Q3', type: 'unauthorized_suspected', scope: { en: 'Servers', fr: 'Serveurs' }, count: 2, verified: 0, ticket: '', source: 'E15', status: 'inferred', conf: 'Low', evidence: '' },
    ],
    findings: [
      { rule: 'IR-11', register: 'deviations', rowId: 'DV-01', scenarios: ['S6'], eid: 'E15' },
    ],
  },
});

/* CanaRetail — fictional, illustrative counts, population level only. */
self.CRG_CM_SAMPLES.canaretail = {
  settings: { asOf: '2026-11-01' },
  evidence: [],
  ciScopes: [
    { id: 'CS-01', label: { en: 'POS terminals', fr: 'Terminaux PDV' }, inScope: 1180, assigned: 1180, assessed: 1150, compliant: 1101, asOf: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'CS-02', label: { en: 'Back-office PCs', fr: 'Ordinateurs de l’arrière-boutique' }, inScope: 410, assigned: 395, assessed: 380, compliant: 350, asOf: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'CS-03', label: { en: 'AWS e-commerce accounts', fr: 'Comptes AWS du commerce électronique' }, inScope: 12, assigned: 12, assessed: 12, compliant: 10, asOf: '2026-10-20', status: 'confirmed', conf: 'Medium' },
  ],
  deviations: [
    { id: 'DV-01', ciScope: 'CS-01', count: 2, cls: 'compensated', severity: 'medium', requirement: { en: 'TLS 1.0 on two store routers', fr: 'TLS 1.0 sur deux routeurs de magasin' }, opened: '2026-08-12', lastSeen: '2026-10-20',
      exception: 'EXC-91', state: 'open', owner: { en: 'Network operations', fr: 'Exploitation du réseau' }, status: 'confirmed', conf: 'Medium' },
  ],
  exceptions: [
    { id: 'EXC-91', title: { en: 'TLS 1.0 on two store routers until replacement', fr: 'TLS 1.0 sur deux routeurs de magasin jusqu’à leur remplacement' }, scope: { en: 'Two store routers', fr: 'Deux routeurs de magasin' },
      description: { en: 'Legacy routers awaiting replacement', fr: 'Routeurs anciens en attente de remplacement' }, compensatedBy: [{ en: 'Traffic restricted to the payment processor through an encrypted tunnel', fr: 'Trafic limité au processeur de paiement par un tunnel chiffré' }],
      approvedBy: { en: 'Chief information security officer', fr: 'Chef de la sécurité de l’information' }, status: 'accepted', expiry: '2027-01-31', opened: '2026-08-15', concerns: [{ kind: 'deviation', id: 'DV-01' }] },
  ],
};
