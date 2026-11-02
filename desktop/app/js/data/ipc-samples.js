/* ipc-samples.js — teaching-case samples of the Identity, privilege & configuration module.
   Fictional, illustrative counts for the MediBec case: population level only (no names, no account
   identifiers, no secrets). Labels are { en, fr }; the case language picks one. Evidence ids E13–E15 are
   the sample's own and are remapped to the next free E-numbers when the sample is loaded. Findings are
   recorded and linked as evidence only: no proposal, nothing accepted, so the reference totals
   84,305 / 41,023 are unchanged. Other cases add their sample under their own key
   (js/data/ipc-sample-canaretail.js). © 2026 Marc-André Léger. CC BY-NC 4.0 */
self.CRG_IPC_SAMPLES = Object.assign(self.CRG_IPC_SAMPLES || {}, {
  medibec: {
    settings: { asOf: '2026-11-01' },
    evidence: [
      { id: 'E13', title: { en: 'IdP account and privileged-role counts, 2026-09-15 (counts only)', fr: 'Décomptes des comptes et des rôles privilégiés de l’IdP, 2026-09-15 (décomptes seulement)' },
        supports: { en: 'Supports: S1, S5, S20 (privileged MFA), S27 (dormant accounts), S28 (emergency use) — identity, privilege & configuration registers', fr: 'Appuie : S1, S5, S20 (AMF des accès privilégiés), S27 (comptes dormants), S28 (utilisation d’urgence) — registres identité, privilèges et configuration' },
        strength: 'moderate', date: '2026-09-15', custodian: 'Identity and access management team' },
      { id: 'E14', title: { en: 'Access-review campaign report H1 2026', fr: 'Rapport de campagne de revue des accès S1 2026' },
        supports: { en: 'Supports: S5, S28 (access-review completion, unverified revocations)', fr: 'Appuie : S5, S28 (achèvement des revues des accès, révocations non vérifiées)' },
        strength: 'moderate', date: '2026-07-15', custodian: 'Clinical systems access governance' },
      { id: 'E15', title: { en: 'Baseline compliance summary Q3 2026', fr: 'Sommaire de conformité aux configurations de référence T3 2026' },
        supports: { en: 'Supports: S6 (open high-severity configuration degradation)', fr: 'Appuie : S6 (dégradation de configuration ouverte de gravité élevée)' },
        strength: 'moderate', date: '2026-10-15', custodian: 'Infrastructure operations' },
    ],
    accounts: [
      { id: 'AP-01', type: 'employee', label: { en: 'Clinical and administrative staff', fr: 'Personnel clinique et administratif' }, scope: { en: 'All clinics and head office', fr: 'Toutes les cliniques et le siège' }, owner: { en: 'Human resources and IAM team', fr: 'Ressources humaines et équipe GIA' },
        count: 1240, mfa: 1105, mfaPR: 0, dormant: 62, ownerless: 0, reconciled: '2026-09-15', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'AP-02', type: 'contractor', label: { en: 'Vendors and locum physicians', fr: 'Fournisseurs et médecins remplaçants' }, scope: { en: 'Vendor remote access and EHR', fr: 'Accès à distance des fournisseurs et DME' }, owner: { en: 'Procurement and medical affairs', fr: 'Approvisionnement et affaires médicales' },
        count: 186, mfa: 120, mfaPR: 0, dormant: 31, ownerless: 14, reconciled: '2026-06-30', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'AP-03', type: 'service', label: { en: 'Interface, backup and integration accounts', fr: 'Comptes d’interface, de sauvegarde et d’intégration' }, scope: { en: 'EHR interfaces, backup, integration engine', fr: 'Interfaces du DME, sauvegarde, moteur d’intégration' }, owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' },
        count: 74, mfa: null, mfaPR: null, dormant: 9, ownerless: 11, reconciled: '2026-09-15', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'AP-04', type: 'ai_agent', label: { en: 'Booking assistant agents', fr: 'Agents d’aide à la prise de rendez-vous' }, scope: { en: 'Online booking', fr: 'Prise de rendez-vous en ligne' }, owner: { en: 'Patient services', fr: 'Services aux patients' },
        count: 2, mfa: null, mfaPR: null, dormant: 0, ownerless: 1, reconciled: '2026-09-15', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'AP-05', type: 'emergency', label: { en: 'Break-glass accounts', fr: 'Comptes d’urgence' }, scope: { en: 'Cloud tenant and domain', fr: 'Locataire infonuagique et domaine' }, owner: { en: 'Cybersecurity lead', fr: 'Responsable de la cybersécurité' },
        count: 3, mfa: 3, mfaPR: 1, dormant: null, ownerless: 0, reconciled: '2026-09-15', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
    ],
    privileged: [
      { id: 'PR-01', tier: 0, label: { en: 'IdP, domain and cloud-tenant administrators', fr: 'Administrateurs IdP, domaine et locataire infonuagique' }, scope: { en: 'Identity provider, domain, cloud tenant', fr: 'Fournisseur d’identité, domaine, locataire infonuagique' }, owner: { en: 'Cybersecurity lead', fr: 'Responsable de la cybersécurité' },
        holders: 9, standing: 9, jit: 0, mfa: 9, mfaPR: 2, shared: 1, reviewed: '2026-03-10', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'PR-02', tier: 1, label: { en: 'EHR, database and server administrators', fr: 'Administrateurs DME, bases de données et serveurs' }, scope: { en: 'EHR, databases, servers', fr: 'DME, bases de données, serveurs' }, owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' },
        holders: 27, standing: 21, jit: 6, mfa: 24, mfaPR: null, shared: 0, reviewed: '2025-10-02', source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'PR-03', tier: 2, label: { en: 'Application and support administrators', fr: 'Administrateurs d’applications et soutien' }, scope: { en: 'Clinical applications, service desk', fr: 'Applications cliniques, centre de services' }, owner: { en: 'Application support', fr: 'Soutien aux applications' },
        holders: 58, standing: 58, jit: 0, mfa: 41, mfaPR: null, shared: 0, reviewed: '', source: 'E13', status: 'inferred', conf: 'Low', evidence: '' },
    ],
    emergency: [
      { id: 'BG-01', label: { en: 'Cloud-tenant break-glass', fr: 'Urgence du locataire infonuagique' }, scope: { en: 'Cloud tenant', fr: 'Locataire infonuagique' }, owner: { en: 'Cybersecurity lead', fr: 'Responsable de la cybersécurité' }, count: 2,
        controls: { offlineCustody: 'yes', strongAuth: 'yes', alertOnUse: 'no', idpIndependent: 'yes', resetAfterUse: 'unknown' }, lastTest: '2025-08-14', uses: 1, usesReviewed: 0, lastUse: '2026-04-22',
        source: 'E13', status: 'confirmed', conf: 'Medium', evidence: 'E13' },
      { id: 'BG-02', label: { en: 'Local domain recovery', fr: 'Récupération du domaine local' }, scope: { en: 'On-premises domain', fr: 'Domaine sur place' }, owner: { en: 'Infrastructure operations', fr: 'Exploitation de l’infrastructure' }, count: 1,
        controls: { offlineCustody: 'yes', strongAuth: 'yes', alertOnUse: 'unknown', idpIndependent: 'yes', resetAfterUse: 'unknown' }, lastTest: '', uses: null, usesReviewed: null, lastUse: '',
        source: 'E13', status: 'inferred', conf: 'Low', evidence: '' },
    ],
    reviews: [
      { id: 'AR-01', name: { en: 'EHR access review H1 2026', fr: 'Revue des accès au DME S1 2026' }, population: 'all', scope: { en: 'EHR', fr: 'DME' }, owner: { en: 'Clinical systems access governance', fr: 'Gouvernance des accès aux systèmes cliniques' },
        due: '2026-06-30', closed: '', decisionsDue: 1410, decisionsDone: 1198, revocationsRequested: 143, revocationsVerified: 97, reviewerConflicts: 6, source: 'E14', status: 'confirmed', conf: 'Medium', evidence: 'E14' },
      { id: 'AR-02', name: { en: 'Tier 0 review Q3 2026', fr: 'Revue niveau 0 T3 2026' }, population: 'tier0', scope: { en: 'Identity provider, domain, cloud tenant', fr: 'Fournisseur d’identité, domaine, locataire infonuagique' }, owner: { en: 'Cybersecurity lead', fr: 'Responsable de la cybersécurité' },
        due: '2026-09-30', closed: '', decisionsDue: 9, decisionsDone: 9, revocationsRequested: 1, revocationsVerified: 1, reviewerConflicts: 0, source: 'E14', status: 'confirmed', conf: 'Medium', evidence: 'E14' },
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
    sod: [
      { id: 'SD-01', rule: { en: 'Create supplier and approve payment (billing)', fr: 'Créer un fournisseur et approuver un paiement (facturation)' }, process: { en: 'Billing', fr: 'Facturation' }, conflicts: 3, owner: { en: 'Finance lead', fr: 'Responsable des finances' },
        mitigation: { en: 'Monthly dual review of supplier and payment changes', fr: 'Double revue mensuelle des changements de fournisseurs et de paiements' }, reviewed: '2026-09-30', source: 'E14', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'SD-02', rule: { en: 'Prescribe and dispense (pharmacy)', fr: 'Prescrire et délivrer (pharmacie)' }, process: { en: 'Pharmacy', fr: 'Pharmacie' }, conflicts: 0, owner: { en: 'Pharmacy manager', fr: 'Gestionnaire de la pharmacie' },
        mitigation: '', reviewed: '2026-09-30', source: 'E14', status: 'confirmed', conf: 'Medium', evidence: '' },
    ],
    changes: [
      { id: 'CH-01', period: '2026-Q3', type: 'normal', scope: { en: 'Servers and clinical applications', fr: 'Serveurs et applications cliniques' }, count: 212, verified: 188, ticket: '', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'CH-02', period: '2026-Q3', type: 'emergency', scope: { en: 'Servers and clinical applications', fr: 'Serveurs et applications cliniques' }, count: 9, verified: 5, ticket: '', source: 'E15', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'CH-03', period: '2026-Q3', type: 'unauthorized_suspected', scope: { en: 'Servers', fr: 'Serveurs' }, count: 2, verified: 0, ticket: '', source: 'E15', status: 'inferred', conf: 'Low', evidence: '' },
    ],
    findings: [
      { rule: 'IR-02', register: 'privileged', rowId: 'PR-02', scenarios: ['S1', 'S5', 'S20'], eid: 'E13' },
      { rule: 'IR-04', register: 'accounts', rowId: 'AP-01', scenarios: ['S27'], eid: 'E13' },
      { rule: 'IR-07', register: 'emergency', rowId: 'BG-01', scenarios: ['S28'], eid: 'E13' },
      { rule: 'IR-08', register: 'reviews', rowId: 'AR-01', scenarios: ['S5', 'S28'], eid: 'E14' },
      { rule: 'IR-11', register: 'deviations', rowId: 'DV-01', scenarios: ['S6'], eid: 'E15' },
    ],
  },
});
