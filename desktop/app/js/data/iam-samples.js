/* iam-samples.js — teaching-case samples of the Identity & access management (IAM/PAM) module.
   Fictional, illustrative counts: population level only (no names, no account identifiers, no secrets). Labels are
   { en, fr }; the case language picks one. MediBec: evidence ids E13 and E14 are the sample's own and are remapped to the
   next free E-numbers when the sample is loaded (the Configuration management sample, js/data/cm-samples.js, is loaded
   after this one and takes E15). Findings are recorded and linked as evidence only: no proposal, nothing accepted, so
   the reference totals 84,305 / 41,023 are unchanged. CanaRetail (below): one recorded finding with evidence at the
   next E-number and ONE PENDING proposal on S10, its service-account scenario (Pb(ψ,A) 0.40 → 0.45), bound by id — a
   case without S10 refuses the sample. Nothing is accepted, so 27,526 / 16,049 are unchanged. © 2026 Marc-André Léger. CC BY-NC 4.0 */
self.CRG_IAM_SAMPLES = Object.assign(self.CRG_IAM_SAMPLES || {}, {
  medibec: {
    settings: { asOf: '2026-11-01' },
    evidence: [
      { id: 'E13', title: { en: 'IdP account and privileged-role counts, 2026-09-15 (counts only)', fr: 'Décomptes des comptes et des rôles privilégiés de l’IdP, 2026-09-15 (décomptes seulement)' },
        supports: { en: 'Supports: S1, S5, S20 (privileged MFA), S27 (dormant accounts), S28 (emergency use) — identity and access registers', fr: 'Appuie : S1, S5, S20 (AMF des accès privilégiés), S27 (comptes dormants), S28 (utilisation d’urgence) — registres d’identité et d’accès' },
        strength: 'moderate', date: '2026-09-15', custodian: 'Identity and access management team' },
      { id: 'E14', title: { en: 'Access-review campaign report H1 2026', fr: 'Rapport de campagne de revue des accès S1 2026' },
        supports: { en: 'Supports: S5, S28 (access-review completion, unverified revocations)', fr: 'Appuie : S5, S28 (achèvement des revues des accès, révocations non vérifiées)' },
        strength: 'moderate', date: '2026-07-15', custodian: 'Clinical systems access governance' },
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
    sod: [
      { id: 'SD-01', rule: { en: 'Create supplier and approve payment (billing)', fr: 'Créer un fournisseur et approuver un paiement (facturation)' }, process: { en: 'Billing', fr: 'Facturation' }, conflicts: 3, owner: { en: 'Finance lead', fr: 'Responsable des finances' },
        mitigation: { en: 'Monthly dual review of supplier and payment changes', fr: 'Double revue mensuelle des changements de fournisseurs et de paiements' }, reviewed: '2026-09-30', source: 'E14', status: 'confirmed', conf: 'Medium', evidence: '' },
      { id: 'SD-02', rule: { en: 'Prescribe and dispense (pharmacy)', fr: 'Prescrire et délivrer (pharmacie)' }, process: { en: 'Pharmacy', fr: 'Pharmacie' }, conflicts: 0, owner: { en: 'Pharmacy manager', fr: 'Gestionnaire de la pharmacie' },
        mitigation: '', reviewed: '2026-09-30', source: 'E14', status: 'confirmed', conf: 'Medium', evidence: '' },
    ],
    findings: [
      { rule: 'IR-02', register: 'privileged', rowId: 'PR-02', scenarios: ['S1', 'S5', 'S20'], eid: 'E13' },
      { rule: 'IR-04', register: 'accounts', rowId: 'AP-01', scenarios: ['S27'], eid: 'E13' },
      { rule: 'IR-07', register: 'emergency', rowId: 'BG-01', scenarios: ['S28'], eid: 'E13' },
      { rule: 'IR-08', register: 'reviews', rowId: 'AR-01', scenarios: ['S5', 'S28'], eid: 'E14' },
    ],
  },
});

/* CanaRetail — fictional, illustrative counts, population level only. */
self.CRG_IAM_SAMPLES.canaretail = {
  settings: { asOf: '2026-11-01' },
  evidence: [],
  accounts: [
    { id: 'AP-01', type: 'employee', label: { en: 'Store and head-office staff', fr: 'Personnel des magasins et du siège' }, owner: { en: 'Human resources and IAM team', fr: 'Ressources humaines et équipe GIA' },
      count: 3850, mfa: 2910, mfaPR: 410, dormant: 420, ownerless: 0, reconciled: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'AP-02', type: 'contractor', label: { en: 'POS and logistics vendors', fr: 'Fournisseurs PDV et logistique' }, owner: { en: 'Procurement', fr: 'Approvisionnement' },
      count: 240, mfa: 240, mfaPR: 0, dormant: 12, ownerless: 3, reconciled: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'AP-03', type: 'service', label: { en: 'Service accounts', fr: 'Comptes de service' }, owner: { en: 'Platform engineering', fr: 'Ingénierie de plateforme' },
      count: 128, mfa: null, mfaPR: null, dormant: 5, ownerless: 19, reconciled: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'AP-04', type: 'ai_agent', label: { en: 'AI agents (customer chat, pricing)', fr: 'Agents d’IA (clavardage, prix)' }, owner: { en: 'Digital commerce', fr: 'Commerce numérique' },
      count: 4, mfa: null, mfaPR: null, dormant: 0, ownerless: 0, reconciled: '2026-10-20', status: 'confirmed', conf: 'Medium' },
    { id: 'AP-05', type: 'emergency', label: { en: 'Emergency', fr: 'Urgence' }, owner: { en: 'Security operations', fr: 'Opérations de sécurité' },
      count: 2, mfa: 2, mfaPR: 2, dormant: 0, ownerless: 0, reconciled: '2026-10-20', status: 'confirmed', conf: 'Medium' },
  ],
  privileged: [
    { id: 'PR-01', tier: 0, label: { en: 'Identity and cloud control-plane administrators', fr: 'Administrateurs de l’identité et du plan de contrôle infonuagique' }, owner: { en: 'Security operations', fr: 'Opérations de sécurité' },
      holders: 6, standing: 2, jit: 4, mfa: 6, mfaPR: 6, shared: 0, reviewed: '2026-08-01', status: 'confirmed', conf: 'Medium' },
    { id: 'PR-02', tier: 1, label: { en: 'POS, payment and e-commerce administrators', fr: 'Administrateurs PDV, paiement et commerce électronique' }, owner: { en: 'Retail technology', fr: 'Technologies du commerce de détail' },
      holders: 22, standing: 10, jit: 12, mfa: 22, mfaPR: 14, shared: 0, reviewed: '2026-08-01', status: 'confirmed', conf: 'Medium' },
    { id: 'PR-03', tier: 2, label: { en: 'Store and application administrators', fr: 'Administrateurs des magasins et des applications' }, owner: { en: 'Retail technology', fr: 'Technologies du commerce de détail' },
      holders: 75, standing: 75, jit: 0, mfa: 70, mfaPR: null, shared: 0, reviewed: '2026-05-15', status: 'confirmed', conf: 'Medium' },
  ],
  emergency: [
    { id: 'BG-01', label: { en: 'Cloud and identity break-glass', fr: 'Urgence infonuagique et identité' }, owner: { en: 'Security operations', fr: 'Opérations de sécurité' }, count: 2,
      controls: { offlineCustody: 'yes', strongAuth: 'yes', alertOnUse: 'yes', idpIndependent: 'yes', resetAfterUse: 'yes' }, lastTest: '2026-07-10', uses: 2, usesReviewed: 2, lastUse: '2026-09-02', status: 'confirmed', conf: 'Medium' },
  ],
  reviews: [
    { id: 'AR-01', name: { en: 'POS and payment access Q3 2026', fr: 'Accès PDV et paiement T3 2026' }, population: 'privileged', owner: { en: 'Retail technology', fr: 'Technologies du commerce de détail' },
      due: '2026-09-30', closed: '2026-09-28', decisionsDue: 640, decisionsDone: 640, revocationsRequested: 38, revocationsVerified: 38, reviewerConflicts: null, status: 'confirmed', conf: 'Medium' },
    { id: 'AR-02', name: { en: 'Store-staff recertification 2026', fr: 'Recertification du personnel des magasins 2026' }, population: 'all', owner: { en: 'Store operations', fr: 'Exploitation des magasins' },
      due: '2026-10-31', closed: '', decisionsDue: 3850, decisionsDone: 3520, revocationsRequested: 410, revocationsVerified: 302, reviewerConflicts: 2, status: 'confirmed', conf: 'Medium' },
  ],
  findings: [
    { rule: 'IR-01', register: 'accounts', rowId: 'AP-03', scenarios: [],
      evidenceAtNext: { title: { en: 'Accounts — service accounts without an owner, reconciliation 2026-10-20 (counts only)', fr: 'Comptes — comptes de service sans propriétaire, rapprochement du 2026-10-20 (décomptes seulement)' } },
      proposals: [{ scenario: 'S10', param: 'Pbx', to: 0.45, conf: 'Medium',
        rationale: { en: '19 of 128 service accounts have no owner (IR-01); exploitation of an unowned service account is more likely. Analytical estimate — validation required.',
          fr: '19 des 128 comptes de service n’ont pas de propriétaire (IR-01); l’exploitation d’un compte de service sans propriétaire est plus probable. Estimation analytique — validation requise.' } }] },
  ],
};
