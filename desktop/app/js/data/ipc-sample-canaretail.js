/* ipc-sample-canaretail.js — Identity, privilege & configuration sample of the CanaRetail teaching case.
   Fictional, illustrative counts, population level only. Applied when a CanaRetail teaching workspace
   exists (seedIpc in js/migrate.js, keyed by case id); a case without a scenario about service accounts
   refuses the sample rather than binding its proposal to the wrong scenario. One recorded finding gets
   evidence at the next E-number and ONE PENDING proposal (Pb(ψ,A) → 0.45): nothing is accepted, so the
   case totals are unchanged. © 2026 Marc-André Léger. CC BY-NC 4.0 */
(self.CRG_IPC_SAMPLES ||= {}).canaretail = {
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
  findings: [
    { rule: 'IR-01', register: 'accounts', rowId: 'AP-03', scenarios: [],
      evidenceAtNext: { title: { en: 'Accounts — service accounts without an owner, reconciliation 2026-10-20 (counts only)', fr: 'Comptes — comptes de service sans propriétaire, rapprochement du 2026-10-20 (décomptes seulement)' } },
      proposals: [{ scenarioMatch: 'service account|compte de service', param: 'Pbx', to: 0.45, conf: 'Medium',
        rationale: { en: '19 of 128 service accounts have no owner (IR-01); exploitation of an unowned service account is more likely. Analytical estimate — validation required.',
          fr: '19 des 128 comptes de service n’ont pas de propriétaire (IR-01); l’exploitation d’un compte de service sans propriétaire est plus probable. Estimation analytique — validation requise.' } }] },
  ],
};
