// build-medibec.mjs — the source of data/simulation/medibec/{siem,soar,manifest}.json and of the entry in
// data/simulation/index.json: fictional SIEM and SOAR records for the MediBec teaching case.
// Run with Node 18+:  node data/simulation/medibec/build-medibec.mjs
// Kept as a worked example for new packs (see docs/SIMULATION-DATA-GUIDE.md). Edit here, not in the JSON.
// Every value below is FICTIONAL. © 2026 Marc-André Léger. CC BY-NC 4.0
import { createHash } from 'node:crypto';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('./', import.meta.url));
const h = s => createHash('sha256').update('CRG simulation — fictional — ' + s).digest('hex');   // fake hashes: not of any real file
const SYS = 'Simulated SIEM (fictional)';
const FIC = 'FICTIONAL — simulation data for the MediBec teaching case.';
const sim = o => ({ ...o, simulation: true });

/* ---------------- telemetry sources ---------------- */
const sources = [
  { id: 'TS-MB-IDP', name: 'Identity provider sign-in logs', system: SYS, asset: 'CJ5', sourceType: 'identity provider sign-in log', ocsfClass: 3002, dataComponents: ['DC0002'],
    logsource: { product: 'idp', service: 'signin' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-MFA', name: 'MFA push service logs', system: SYS, asset: 'CJ5', sourceType: 'MFA service log', ocsfClass: 3002, dataComponents: ['DC0002'],
    logsource: { product: 'mfa', service: 'push' }, cadenceHours: 1, healthHistory: [{ date: '2026-02-01', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-VPN', name: 'Remote access gateway logs', system: SYS, asset: 'CJ5', sourceType: 'VPN gateway log', ocsfClass: 4014,
    logsource: { product: 'vpn', service: 'gateway' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-MAIL', name: 'E-mail security gateway', system: SYS, sourceType: 'mail gateway log', ocsfClass: 4009,
    logsource: { product: 'mailgw', category: 'email' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-EDRWS', name: 'EDR telemetry — clinic workstations', system: SYS, sourceType: 'EDR agent telemetry', ocsfClass: 1007, dataComponents: ['DC0001'],
    logsource: { product: 'windows', category: 'process_creation' }, cadenceHours: 1,
    healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }, { date: '2026-09-15', state: 'degraded', note: 'agent update failed on about 30% of Saguenay and Gatineau workstations (fictional)' }] },
  { id: 'TS-MB-EDRSRV', name: 'EDR telemetry — servers', system: SYS, asset: 'CJ1', sourceType: 'EDR agent telemetry', ocsfClass: 1007, dataComponents: ['DC0001'],
    logsource: { product: 'windows', category: 'process_creation', service: 'server' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-EHR', name: 'EHR application audit log', system: SYS, asset: 'CJ1', sourceType: 'application audit log', ocsfClass: 6005,
    logsource: { product: 'ehr', service: 'audit' }, cadenceHours: 2, healthHistory: [{ date: '2026-03-01', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-FW', name: 'Firewalls — Montreal hub and clinic WAN', system: SYS, asset: 'CJ6', sourceType: 'firewall log', ocsfClass: 4001,
    logsource: { product: 'firewall' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-DNS', name: 'Internal DNS resolver logs', system: SYS, sourceType: 'DNS log', ocsfClass: 4003,
    logsource: { product: 'dns', category: 'dns' }, cadenceHours: 1, healthHistory: [{ date: '2026-01-10', state: 'healthy', note: 'onboarded' }] },
  { id: 'TS-MB-BKP', name: 'Backup server and catalogue logs', system: SYS, asset: 'CJ6', sourceType: 'backup software log', ocsfClass: 1008,
    logsource: { product: 'backup' }, cadenceHours: 4,
    healthHistory: [{ date: '2026-02-01', state: 'healthy', note: 'onboarded' }, { date: '2026-09-18', state: 'silent', note: 'log forwarder stopped after a certificate renewal; nobody noticed (fictional)' }] },
  { id: 'TS-MB-CLOUD', name: 'Cloud image-transfer storage access logs', system: SYS, asset: 'CJ7', sourceType: 'cloud storage access log', ocsfClass: 6003,
    logsource: { product: 'cloud', service: 'storage' }, cadenceHours: 1,
    healthHistory: [{ date: '2026-04-01', state: 'healthy', note: 'onboarded' }, { date: '2026-09-29', state: 'degraded', note: 'only management events collected; data-read events disabled to save cost (fictional)' }] },
  { id: 'TS-MB-WIFI', name: 'Clinic Wi-Fi controller syslog', system: SYS, sourceType: 'wireless controller syslog', ocsfClass: 4001,
    logsource: { product: 'wifi' }, cadenceHours: 4, lastSeen: '2026-08-30T17:10:00', healthHistory: [{ date: '2026-02-01', state: 'healthy', note: 'onboarded' }] },
].map(s => sim({ ...s, notes: FIC }));

/* ---------------- detection strategies ---------------- */
const strategies = [
  { id: 'DS-MB-ACCOUNTS', name: 'Valid-account abuse and MFA fatigue (adapted from ATT&CK)', techniques: ['T1078', 'T1621', 'T1133'], dataComponents: ['DC0002'] },
  { id: 'DS-MB-IMPACT', name: 'Ransomware impact and recovery inhibition (adapted from ATT&CK)', techniques: ['T1486', 'T1490', 'T1489'], dataComponents: ['DC0001'] },
].map(sim);

/* ---------------- detection rules ---------------- */
const rules = [
  { id: 'DR-MB-01', title: 'Macro-enabled Office attachment delivered to a mailbox', version: '1', language: 'native', ruleId: 'SSIM-R-1001', status: 'production', level: 'high',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-02-20', created: '2026-02-10', techniques: ['T1566.001'], scenarios: ['S2', 'S1'], requiredSources: ['TS-MB-MAIL'],
    detection: 'mail.attachment.extension IN (docm, xlsm, pptm) AND mail.verdict != "quarantined"' },
  { id: 'DR-MB-02', title: 'Office application spawning PowerShell', version: '1', language: 'sigma', ruleId: '5f2a0c1e-0000-4000-8000-000000000b02', status: 'production', level: 'high',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-03-05', created: '2026-02-25', techniques: ['T1204.002', 'T1059.001'], scenarios: ['S2'], requiredSources: ['TS-MB-EDRWS'],
    logsource: { product: 'windows', category: 'process_creation' }, strategy: '',
    detection: 'selection:\n  ParentImage|endswith:\n    - \\WINWORD.EXE\n    - \\EXCEL.EXE\n  Image|endswith: \\powershell.exe\ncondition: selection' },
  { id: 'DR-MB-03', title: 'MFA push fatigue — repeated denials followed by an approval', version: '1', language: 'correlation', ruleId: 'SSIM-R-1003', status: 'production', level: 'critical',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-06-01', created: '2026-05-20', techniques: ['T1621'], scenarios: ['S1', 'S27'], requiredSources: ['TS-MB-MFA', 'TS-MB-IDP'], strategy: 'DS-MB-ACCOUNTS',
    detection: 'count(mfa.result = "denied") >= 5 within 10m by user FOLLOWED BY mfa.result = "approved" within 15m' },
  { id: 'DR-MB-04', title: 'Privileged sign-in from an unusual geography', version: '2', language: 'native', ruleId: 'SSIM-R-1004', status: 'production', level: 'high',
    owner: 'Émilie Bouchard', approvedBy: 'Nadia Roy', approvedOn: '2026-05-02', created: '2026-01-20', techniques: ['T1078', 'T1133'], scenarios: ['S1', 'S8'], requiredSources: ['TS-MB-IDP', 'TS-MB-VPN'], strategy: 'DS-MB-ACCOUNTS',
    detection: 'signin.user IN privileged_accounts AND geo.country NOT IN user.baseline_countries',
    history: [{ date: '2026-01-20', from: 'draft', to: 'testing', by: 'Émilie Bouchard' }, { date: '2026-02-15', from: 'testing', to: 'production', by: 'Nadia Roy' }] },
  { id: 'DR-MB-05', title: 'RDP from a clinic workstation to the server segment', version: '1', language: 'native', ruleId: 'SSIM-R-1005', status: 'production', level: 'high',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-03-15', created: '2026-03-01', techniques: ['T1021.001'], scenarios: ['S2', 'S8'], requiredSources: ['TS-MB-FW', 'TS-MB-EDRSRV'],
    detection: 'net.dst_port = 3389 AND src.zone = "clinic-workstations" AND dst.zone = "datacentre-servers"' },
  { id: 'DR-MB-06', title: 'Bulk patient-record query by a service account', version: '1', language: 'native', ruleId: 'SSIM-R-1006', status: 'production', level: 'critical',
    owner: 'Émilie Bouchard', approvedBy: 'Louis Gagnon', approvedOn: '2026-04-10', created: '2026-03-20', techniques: ['T1213', 'T1005'], scenarios: ['S5', 'S10'], requiredSources: ['TS-MB-EHR'],
    detection: 'ehr.audit.records_read by account > 10 x 30-day baseline within 1h AND account.type = "service"' },
  { id: 'DR-MB-07', title: 'Deletion of shadow copies or backup catalogue', version: '1', language: 'sigma', ruleId: '5f2a0c1e-0000-4000-8000-000000000b07', status: 'production', level: 'critical',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-04-20', created: '2026-04-01', techniques: ['T1490'], scenarios: ['S2', 'S3'], requiredSources: ['TS-MB-BKP', 'TS-MB-EDRSRV'], strategy: 'DS-MB-IMPACT',
    logsource: { product: 'windows', category: 'process_creation', service: 'server' },
    detection: 'selection_vss:\n  Image|endswith: \\vssadmin.exe\n  CommandLine|contains|all:\n    - delete\n    - shadows\nselection_catalog:\n  EventSource: backup\n  Action: catalog_delete\ncondition: 1 of selection_*' },
  { id: 'DR-MB-08', title: 'Mass file encryption or rename on file shares', version: '3', language: 'sigma', ruleId: '5f2a0c1e-0000-4000-8000-000000000b08', status: 'production', level: 'critical',
    owner: 'Karim Haddad', approvedBy: 'Louis Gagnon', approvedOn: '2026-09-12', created: '2026-02-01', techniques: ['T1486'], scenarios: ['S2', 'S3'], requiredSources: ['TS-MB-EDRSRV'], strategy: 'DS-MB-IMPACT',
    logsource: { product: 'windows', category: 'file_event', service: 'server' },
    detection: 'selection:\n  EventType: rename\n  TargetFilename|re: \'\\.[a-z0-9]{5,8}$\'\ntimeframe: 2m\ncondition: selection | count() by Computer > 200' },
  { id: 'DR-MB-09', title: 'Large download from the cloud image-transfer storage by an unknown address', version: '1', language: 'native', ruleId: 'SSIM-R-1009', status: 'testing', level: 'high',
    owner: 'Émilie Bouchard', created: '2026-08-15', techniques: ['T1530', 'T1567.002'], scenarios: ['S4'], requiredSources: ['TS-MB-CLOUD'],
    detection: 'cloud.storage.bytes_out > 5 GB within 1h AND src.ip NOT IN partner_ranges' },
  { id: 'DR-MB-10', title: 'DNS query or connection matching a threat indicator', version: '1', language: 'correlation', ruleId: 'SSIM-R-1010', status: 'production', level: 'high',
    owner: 'Émilie Bouchard', approvedBy: 'Nadia Roy', approvedOn: '2026-07-01', created: '2026-06-20', techniques: ['T1071.001', 'T1071.004'], scenarios: ['S2', 'S8'], requiredSources: ['TS-MB-DNS', 'TS-MB-FW'],
    detection: 'dns.query IN indicators.domain OR net.dst_ip IN indicators.ipv4' },
  { id: 'DR-MB-11', title: 'Rogue access point broadcasting a MediBec SSID', version: '1', language: 'native', ruleId: 'SSIM-R-1011', status: 'production', level: 'medium',
    owner: 'Karim Haddad', approvedBy: 'Nadia Roy', approvedOn: '2026-02-12', created: '2026-02-01', techniques: ['T1200'], scenarios: ['S12'], requiredSources: ['TS-MB-WIFI'],
    detection: 'wifi.event = "rogue_ap" AND wifi.ssid LIKE "MediBec%"' },
  { id: 'DR-MB-12', title: 'Help-desk MFA reset followed by a sign-in from a new device', version: '1', language: 'correlation', ruleId: 'SSIM-R-1012', status: 'draft', level: 'high',
    owner: 'Émilie Bouchard', created: '2026-09-01', techniques: ['T1098.005'], scenarios: ['S27'], requiredSources: ['TS-MB-IDP'],
    detection: 'idp.mfa_reset by helpdesk FOLLOWED BY signin from new_device within 2h' },
  { id: 'DR-MB-13', title: 'Password spraying against administrative interfaces', version: '1', language: 'native', ruleId: 'SSIM-R-1013', status: 'disabled', level: 'medium',
    owner: 'Karim Haddad', created: '2026-03-01', techniques: ['T1110.003'], scenarios: ['S23'], requiredSources: ['TS-MB-FW'],
    detection: 'count(distinct user) > 20 with auth.result = failure from one src.ip within 10m',
    history: [{ date: '2026-03-01', from: 'draft', to: 'production', by: 'Nadia Roy' }, { date: '2026-05-18', from: 'production', to: 'disabled', by: 'Nadia Roy' }] },
].map(r => sim({ ...r, description: (r.description || r.title) + ' — ' + FIC }));

/* ---------------- detection tests ---------------- */
const tests = [
  { id: 'DT-MB-01', ruleId: 'DR-MB-01', ruleVersion: '1', date: '2026-06-18', tester: 'Karim Haddad', result: 'effective', method: 'replay', fixture: 'FX-MAIL-DOCM-01' },
  { id: 'DT-MB-02', ruleId: 'DR-MB-02', ruleVersion: '1', date: '2026-03-04', tester: 'Karim Haddad', result: 'effective', method: 'emulation', fixture: 'atomic-T1204.002-office-macro' },
  { id: 'DT-MB-03', ruleId: 'DR-MB-04', ruleVersion: '1', date: '2026-02-10', tester: 'Émilie Bouchard', result: 'ineffective', method: 'replay', notes: 'version 1 missed sign-ins through the VPN egress' },
  { id: 'DT-MB-04', ruleId: 'DR-MB-04', ruleVersion: '2', date: '2026-05-01', tester: 'Émilie Bouchard', result: 'effective', method: 'replay' },
  { id: 'DT-MB-05', ruleId: 'DR-MB-05', ruleVersion: '1', date: '2026-03-14', tester: 'Karim Haddad', result: 'effective', method: 'purple-team' },
  { id: 'DT-MB-06', ruleId: 'DR-MB-05', ruleVersion: '1', date: '2026-08-21', tester: 'Karim Haddad', result: 'ineffective', method: 'purple-team', notes: 'RDP through the jump host was not seen: the jump host sits in the server zone' },
  { id: 'DT-MB-07', ruleId: 'DR-MB-06', ruleVersion: '1', date: '2026-07-09', tester: 'Émilie Bouchard', result: 'effective', method: 'unit', fixture: 'FX-EHR-BULK-01' },
  { id: 'DT-MB-08', ruleId: 'DR-MB-07', ruleVersion: '1', date: '2026-04-19', tester: 'Karim Haddad', result: 'effective', method: 'emulation', fixture: 'atomic-T1490-vssadmin' },
  { id: 'DT-MB-09', ruleId: 'DR-MB-08', ruleVersion: '2', date: '2026-05-12', tester: 'Karim Haddad', result: 'effective', method: 'emulation', notes: 'tests version 2 — does not validate version 3' },
  { id: 'DT-MB-10', ruleId: 'DR-MB-08', ruleVersion: '3', date: '2026-09-10', tester: 'Karim Haddad', result: 'effective', method: 'emulation', fixture: 'FX-RANSOM-SIM-03' },
  { id: 'DT-MB-11', ruleId: 'DR-MB-11', ruleVersion: '1', date: '2026-02-11', tester: 'Karim Haddad', result: 'effective', method: 'other', notes: 'test access point at the Montreal head office' },
  { id: 'DT-MB-12', ruleId: 'DR-MB-09', ruleVersion: '1', date: '2026-09-02', tester: 'Émilie Bouchard', result: 'ineffective', method: 'replay', notes: 'threshold too high for the partner transfer pattern' },
].map(t => sim({ ...t, notes: ((t.notes ? t.notes + ' — ' : '') + FIC) }));

/* ---------------- indicators ---------------- */
const STIXC = 'STIX 2.1 confidence (0-100) as stated by the fictional producer — not a probability';
const ind = (id, type, value, name, confidence, tlp, source, extra = {}) => sim({ id, type, value, name, confidence, confidenceMethod: STIXC, tlp, source, validFrom: '2026-09-20', validUntil: '2027-03-31', labels: ['simulation', 'fictional'], ...extra });
const indicators = [
  ind('IND-MB-01', 'domain-name', 'dossiers-medibec.example.net', 'Phishing sender domain (EHR-update lure)', 85, 'AMBER', 'Simulated health-sector ISAC (fictional)', { techniques: ['T1566.001'] }),
  ind('IND-MB-02', 'email-addr', 'mise-a-jour@dossiers-medibec.example.net', 'Phishing sender address', 80, 'GREEN', 'Simulated health-sector ISAC (fictional)', { techniques: ['T1566.001'] }),
  ind('IND-MB-03', 'file:sha256', h('docm attachment'), 'Malicious .docm attachment (fake hash)', 90, 'AMBER', 'Simulated health-sector ISAC (fictional)', { techniques: ['T1204.002'] }),
  ind('IND-MB-04', 'domain-name', 'cdn-update.example.org', 'Command-and-control domain', 75, 'AMBER+STRICT', 'Simulated partner CERT (fictional) — share only within the SOC', { techniques: ['T1071.001'] }),
  ind('IND-MB-05', 'ipv4-addr', '203.0.113.45', 'Command-and-control server', 70, 'AMBER', 'Simulated partner CERT (fictional)', { techniques: ['T1071.001'] }),
  ind('IND-MB-06', 'ipv4-addr', '198.51.100.77', 'Sign-in source of the account takeover', 60, 'GREEN', 'MediBec SOC (fictional)', { techniques: ['T1078'] }),
  ind('IND-MB-07', 'ipv4-addr', '203.0.113.88', 'Address that downloaded the cloud image exports', 65, 'AMBER', 'MediBec SOC (fictional)', { techniques: ['T1530'] }),
  ind('IND-MB-08', 'domain-name', 'files.example.com', 'File-sharing service used for staging (legitimate service, abused)', 40, 'GREEN', 'Simulated commercial feed (fictional)', { techniques: ['T1567.002'] }),
  ind('IND-MB-09', 'url', 'https://files.example.com/u/7f3k2q', 'Upload URL used for exfiltration', 55, 'AMBER', 'MediBec SOC (fictional)', { techniques: ['T1567.002'] }),
  ind('IND-MB-10', 'file:sha256', h('encryptor binary'), 'Encryptor binary (fake hash)', 95, 'RED', 'Simulated law-enforcement liaison (fictional) — named recipients only', { techniques: ['T1486'] }),
  ind('IND-MB-11', 'file:sha256', h('ransom note'), 'Ransom note LIRE_MOI.txt (fake hash)', 80, 'AMBER', 'MediBec SOC (fictional)', { techniques: ['T1486'] }),
  ind('IND-MB-12', 'ipv6-addr', '2001:db8:4a::17', 'Secondary command-and-control address', 50, 'GREEN', 'Simulated partner CERT (fictional)', { techniques: ['T1071.001'] }),
  ind('IND-MB-13', 'ipv4-addr', '192.0.2.66', 'Former scanning address (revoked by the producer)', 30, 'CLEAR', 'Simulated commercial feed (fictional)', { revoked: true }),
  ind('IND-MB-14', 'domain-name', 'medibec-rendezvous.example.com', 'Look-alike domain used to phish patients', 85, 'CLEAR', 'MediBec SOC (fictional) — public warning', { techniques: ['T1566.002'] }),
  ind('IND-MB-15', 'domain-name', 'old-relay.example.net', 'Relay domain from an earlier campaign (expired)', 50, 'GREEN', 'Simulated health-sector ISAC (fictional)', { validFrom: '2026-03-01', validUntil: '2026-09-30' }),
];

/* ---------------- alerts ---------------- */
let n = 0;
const ev = (src, t, i) => ({ ref: `ssiem://events/${src}/${t.replace(/[-:T]/g, '')}-${i}`, sourceId: src, sourceTime: t, hash: 'sha256:' + h(`event ${src} ${t} ${i}`) });
const al = (o) => { n++; const id = 'AL-MB-' + String(n).padStart(3, '0');
  return sim({ id, externalId: 'SSIM-' + (48100 + n), version: 1, sourceSystem: SYS, confidence: o.confidence ?? 70, ...o, title: o.title }); };
const alerts = [
  al({ title: 'Vulnerability scan from the authorised scanner 192.0.2.10', detected: '2026-09-21T08:12:00', severity: 'low', triage: 'benign', techniques: ['T1595'], events: [ev('TS-MB-FW', '2026-09-21T08:11:40', 1)], assignee: 'Émilie Bouchard' }),
  al({ title: 'Privileged sign-in from an unusual geography — clinician account via Quebec City VPN egress', ruleId: 'DR-MB-04', detected: '2026-09-21T09:40:00', severity: 'medium', asset: 'CJ5', techniques: ['T1078'], scenarios: ['S1'], triage: 'false-positive', assignee: 'Émilie Bouchard', events: [ev('TS-MB-IDP', '2026-09-21T09:39:12', 1)] }),
  al({ title: 'Large outbound transfer to the off-site backup provider', detected: '2026-09-22T02:05:00', severity: 'low', asset: 'CJ6', triage: 'benign', assignee: 'Karim Haddad', events: [ev('TS-MB-FW', '2026-09-22T02:04:10', 1)] }),
  al({ title: 'USB mass-storage device on imaging workstation IMG-QC-03 (patient-supplied CD export)', detected: '2026-09-22T10:15:00', severity: 'low', asset: 'CJ2', techniques: ['T1091'], scenarios: ['S24'], triage: 'benign', assignee: 'Émilie Bouchard', events: [ev('TS-MB-EDRWS', '2026-09-22T10:14:51', 1)] }),
  al({ title: 'Bulk e-mail with tracking links (internal awareness campaign)', detected: '2026-09-22T13:30:00', severity: 'low', triage: 'benign', assignee: 'Émilie Bouchard', events: [ev('TS-MB-MAIL', '2026-09-22T13:29:30', 1)] }),
  al({ title: 'Macro-enabled attachment Mise_a_jour_dossier_patient.docm delivered — 1 of 14 recipients (Gatineau clinic)', ruleId: 'DR-MB-01', detected: '2026-09-23T07:58:00', firstSeen: '2026-09-23T07:51:00', severity: 'high', techniques: ['T1566.001'], scenarios: ['S2', 'S1'], indicators: ['IND-MB-01', 'IND-MB-02', 'IND-MB-03'], triage: 'in-triage', assignee: 'Émilie Bouchard', confidence: 85, events: [ev('TS-MB-MAIL', '2026-09-23T07:51:02', 1), ev('TS-MB-MAIL', '2026-09-23T07:51:05', 2)] }),
  al({ title: 'Macro-enabled attachment quarantined — second wave, Quebec City clinic', ruleId: 'DR-MB-01', detected: '2026-09-23T08:03:00', severity: 'medium', techniques: ['T1566.001'], scenarios: ['S2'], indicators: ['IND-MB-01'], triage: 'new', events: [ev('TS-MB-MAIL', '2026-09-23T08:02:40', 1)] }),
  al({ title: 'WINWORD.EXE spawned powershell.exe on WS-GAT-014', ruleId: 'DR-MB-02', detected: '2026-09-23T08:21:00', severity: 'medium', techniques: ['T1204.002', 'T1059.001'], scenarios: ['S2'], triage: 'benign', assignee: 'Samuel Côté', confidence: 60, events: [ev('TS-MB-EDRWS', '2026-09-23T08:20:44', 1)] }),
  al({ title: 'DNS query to indicator domain cdn-update.example.org from WS-GAT-014', ruleId: 'DR-MB-10', detected: '2026-09-23T08:22:00', severity: 'high', techniques: ['T1071.004'], scenarios: ['S2', 'S8'], indicators: ['IND-MB-04'], triage: 'new', tlp: 'AMBER+STRICT', events: [ev('TS-MB-DNS', '2026-09-23T08:21:58', 1)] }),
  al({ title: 'Spike of failed patient-portal sign-ins from 192.0.2.0/24 (after a password-reset mailing)', detected: '2026-09-24T11:00:00', severity: 'medium', asset: 'CJ3', techniques: ['T1110.004'], scenarios: ['S23'], triage: 'false-positive', assignee: 'Émilie Bouchard', events: [ev('TS-MB-FW', '2026-09-24T10:58:00', 1)] }),
  al({ title: 'Periodic HTTPS beacon from WS-GAT-014 to 203.0.113.45 every 300 s', ruleId: 'DR-MB-10', detected: '2026-09-25T03:14:00', firstSeen: '2026-09-23T08:25:00', severity: 'high', techniques: ['T1071.001'], scenarios: ['S2', 'S8'], indicators: ['IND-MB-05'], triage: 'new', events: [ev('TS-MB-FW', '2026-09-25T03:13:30', 1)] }),
  al({ title: 'New scheduled task created on WS-GAT-014', detected: '2026-09-25T09:30:00', severity: 'medium', techniques: ['T1053.005'], scenarios: ['S8'], triage: 'new', events: [ev('TS-MB-EDRWS', '2026-09-25T09:29:41', 1)] }),
  al({ title: 'Large EHR report export by a medical-records clerk (month-end statistics)', ruleId: 'DR-MB-06', detected: '2026-09-26T14:20:00', severity: 'medium', asset: 'CJ1', techniques: ['T1213'], scenarios: ['S5'], triage: 'false-positive', assignee: 'Émilie Bouchard', events: [ev('TS-MB-EHR', '2026-09-26T14:19:02', 1)] }),
  al({ title: '11 MFA push denials in 6 minutes for adm.jdupuis', ruleId: 'DR-MB-03', detected: '2026-09-27T22:40:00', severity: 'high', asset: 'CJ5', techniques: ['T1621'], scenarios: ['S1'], triage: 'in-triage', assignee: 'Karim Haddad', events: [ev('TS-MB-MFA', '2026-09-27T22:39:50', 1)] }),
  al({ title: 'MFA push approved after repeated denials for adm.jdupuis', ruleId: 'DR-MB-03', detected: '2026-09-27T22:47:00', severity: 'critical', asset: 'CJ5', techniques: ['T1621'], scenarios: ['S1'], triage: 'in-triage', assignee: 'Karim Haddad', confidence: 90, events: [ev('TS-MB-MFA', '2026-09-27T22:46:31', 1)] }),
  al({ title: 'Privileged sign-in of adm.jdupuis from an unusual geography (198.51.100.77)', ruleId: 'DR-MB-04', detected: '2026-09-27T22:49:00', severity: 'high', asset: 'CJ5', techniques: ['T1078'], scenarios: ['S1', 'S8'], indicators: ['IND-MB-06'], triage: 'in-triage', assignee: 'Karim Haddad', events: [ev('TS-MB-IDP', '2026-09-27T22:48:40', 1)] }),
  al({ title: 'Remote-access session for adm.jdupuis from 198.51.100.77', ruleId: 'DR-MB-04', detected: '2026-09-27T23:05:00', severity: 'high', asset: 'CJ5', techniques: ['T1133'], scenarios: ['S1'], indicators: ['IND-MB-06'], triage: 'new', events: [ev('TS-MB-VPN', '2026-09-27T23:04:20', 1)] }),
  al({ title: 'Service-desk report: night-time MFA prompts on an administrator phone', sourceSystem: 'Service desk (fictional)', detected: '2026-09-28T09:10:00', severity: 'medium', asset: 'CJ5', techniques: ['T1621'], scenarios: ['S1'], triage: 'in-triage', assignee: 'Karim Haddad', confidence: 50 }),
  al({ title: 'RDP from WS-GAT-014 to SRV-EHR-APP02 with adm.jdupuis', ruleId: 'DR-MB-05', detected: '2026-09-29T01:12:00', severity: 'high', asset: 'CJ1', techniques: ['T1021.001'], scenarios: ['S2', 'S8'], triage: 'new', events: [ev('TS-MB-FW', '2026-09-29T01:11:47', 1), ev('TS-MB-EDRSRV', '2026-09-29T01:11:50', 2)] }),
  al({ title: 'Directory reconnaissance: LDAP queries for privileged groups from SRV-EHR-APP02', detected: '2026-09-29T01:30:00', severity: 'medium', asset: 'CJ1', techniques: ['T1087.002'], scenarios: ['S8'], triage: 'new', events: [ev('TS-MB-EDRSRV', '2026-09-29T01:29:10', 1)] }),
  al({ title: 'Service account ehr-sync-svc read 48,000 patient records in 40 minutes (baseline 1,200 per day)', ruleId: 'DR-MB-06', detected: '2026-09-30T03:02:00', firstSeen: '2026-09-30T02:20:00', severity: 'critical', asset: 'CJ1', techniques: ['T1213', 'T1005'], scenarios: ['S5', 'S2'], triage: 'new', confidence: 90, tlp: 'RED', events: [ev('TS-MB-EHR', '2026-09-30T03:01:12', 1)] }),
  al({ title: 'Archive created in a temporary folder on SRV-EHR-APP02', detected: '2026-09-30T03:40:00', severity: 'high', asset: 'CJ1', techniques: ['T1560.001'], scenarios: ['S2'], triage: 'new', events: [ev('TS-MB-EDRSRV', '2026-09-30T03:39:30', 1)] }),
  al({ title: 'Antimalware signature update failures at the Saguenay clinic', detected: '2026-09-30T10:00:00', severity: 'informational', triage: 'benign', assignee: 'Samuel Côté', events: [ev('TS-MB-EDRWS', '2026-09-30T09:58:00', 1)] }),
  al({ title: '38 GB downloaded from the cloud image-transfer storage by 203.0.113.88', ruleId: 'DR-MB-09', detected: '2026-10-01T02:15:00', severity: 'critical', asset: 'CJ7', techniques: ['T1530'], scenarios: ['S4'], indicators: ['IND-MB-07'], triage: 'in-triage', assignee: 'Émilie Bouchard', events: [ev('TS-MB-CLOUD', '2026-10-01T02:14:02', 1)] }),
  al({ title: 'Upload from SRV-EHR-APP02 to files.example.com', ruleId: 'DR-MB-10', detected: '2026-10-01T02:20:00', severity: 'high', asset: 'CJ1', techniques: ['T1567.002'], scenarios: ['S2'], indicators: ['IND-MB-08', 'IND-MB-09'], triage: 'new', confidence: 55, events: [ev('TS-MB-FW', '2026-10-01T02:19:41', 1)] }),
  al({ title: 'Scheduled image transfer to the radiology partner flagged as a large download', ruleId: 'DR-MB-09', detected: '2026-10-01T15:30:00', severity: 'medium', asset: 'CJ7', techniques: ['T1530'], scenarios: ['S4'], triage: 'false-positive', assignee: 'Émilie Bouchard', events: [ev('TS-MB-CLOUD', '2026-10-01T15:29:00', 1)] }),
  al({ title: 'Port scan of the patient portal from 192.0.2.200 (internet background noise)', detected: '2026-10-02T08:00:00', severity: 'low', asset: 'CJ3', techniques: ['T1595'], triage: 'benign', assignee: 'Émilie Bouchard', events: [ev('TS-MB-FW', '2026-10-02T07:59:00', 1)] }),
  al({ title: 'Unusual geography for a roaming nurse (mobile carrier address)', ruleId: 'DR-MB-04', detected: '2026-10-02T11:45:00', severity: 'medium', asset: 'CJ5', techniques: ['T1078'], scenarios: ['S1'], triage: 'false-positive', assignee: 'Émilie Bouchard', events: [ev('TS-MB-IDP', '2026-10-02T11:44:30', 1)] }),
  al({ title: 'vssadmin delete shadows on SRV-FILE-01', ruleId: 'DR-MB-07', detected: '2026-10-03T23:55:00', severity: 'critical', asset: 'CJ6', techniques: ['T1490'], scenarios: ['S2', 'S3'], triage: 'new', confidence: 95, events: [ev('TS-MB-EDRSRV', '2026-10-03T23:54:48', 1)] }),
  al({ title: 'Backup agent service stopped on SRV-FILE-01', detected: '2026-10-04T00:10:00', severity: 'high', asset: 'CJ6', techniques: ['T1489'], scenarios: ['S3'], triage: 'new', events: [ev('TS-MB-EDRSRV', '2026-10-04T00:09:30', 1)] }),
  al({ title: 'Mass rename to extension .lockmb on the EHR document share', ruleId: 'DR-MB-08', detected: '2026-10-04T00:32:00', severity: 'critical', asset: 'CJ1', techniques: ['T1486'], scenarios: ['S2'], indicators: ['IND-MB-10'], triage: 'new', confidence: 95, tlp: 'RED', events: [ev('TS-MB-EDRSRV', '2026-10-04T00:31:40', 1)] }),
  al({ title: 'Mass file encryption on scheduling server SRV-SCHED-01', ruleId: 'DR-MB-08', detected: '2026-10-04T00:34:00', severity: 'critical', asset: 'CJ3', techniques: ['T1486'], scenarios: ['S2'], triage: 'new', confidence: 95, events: [ev('TS-MB-EDRSRV', '2026-10-04T00:33:50', 1)] }),
  al({ title: 'Ransom note LIRE_MOI.txt written to 212 shared folders', ruleId: 'DR-MB-08', detected: '2026-10-04T00:40:00', severity: 'critical', asset: 'CJ1', techniques: ['T1486'], scenarios: ['S2'], indicators: ['IND-MB-11'], triage: 'new', confidence: 95, events: [ev('TS-MB-EDRSRV', '2026-10-04T00:39:10', 1)] }),
  al({ title: 'File encryption on clinic workstation WS-SAG-007', ruleId: 'DR-MB-08', detected: '2026-10-04T00:45:00', severity: 'high', techniques: ['T1486'], scenarios: ['S2'], triage: 'new', events: [ev('TS-MB-EDRWS', '2026-10-04T00:44:20', 1)] }),
  al({ title: 'EHR application unavailable at all 10 clinics (availability monitor)', sourceSystem: 'Availability monitor (fictional)', detected: '2026-10-04T06:20:00', severity: 'critical', asset: 'CJ1', scenarios: ['S2'], triage: 'in-triage', assignee: 'Nadia Roy', confidence: 100 }),
  al({ title: 'Sign-in attempt with the disabled account adm.jdupuis (blocked)', ruleId: 'DR-MB-04', detected: '2026-10-05T09:00:00', severity: 'low', asset: 'CJ5', techniques: ['T1078'], scenarios: ['S1'], triage: 'benign', assignee: 'Karim Haddad', events: [ev('TS-MB-IDP', '2026-10-05T08:59:40', 1)] }),
  al({ title: 'Mass rename by the imaging-archive migration job on the PACS', ruleId: 'DR-MB-08', detected: '2026-10-06T14:00:00', severity: 'high', asset: 'CJ2', techniques: ['T1486'], scenarios: ['S2'], triage: 'false-positive', assignee: 'Karim Haddad', events: [ev('TS-MB-EDRSRV', '2026-10-06T13:59:10', 1)] }),
  al({ title: 'Connection to 192.0.2.66 (indicator revoked by its producer)', ruleId: 'DR-MB-10', detected: '2026-10-07T10:30:00', severity: 'low', indicators: ['IND-MB-13'], triage: 'benign', assignee: 'Émilie Bouchard', confidence: 30, events: [ev('TS-MB-FW', '2026-10-07T10:29:55', 1)] }),
  al({ title: 'Patient reports an appointment e-mail from medibec-rendezvous.example.com', sourceSystem: 'Patient report (fictional)', detected: '2026-10-08T16:10:00', severity: 'medium', asset: 'CJ3', techniques: ['T1566.002'], scenarios: ['S30'], indicators: ['IND-MB-14'], triage: 'new', confidence: 60, tlp: 'CLEAR' }),
  al({ title: 'Restore test of the EHR database from the off-site copy completed', detected: '2026-10-09T08:30:00', severity: 'low', asset: 'CJ6', scenarios: ['S3'], triage: 'benign', assignee: 'Nadia Roy' }),
];

const gaps = [
  { id: 'GAP-MB-01', title: 'Backup catalogue deletions are not seen: backup telemetry silent since 18 September', scenario: 'S3', technique: 'T1490', source: 'TS-MB-BKP', owner: 'Nadia Roy', status: 'open', raised: '2026-10-05' },
  { id: 'GAP-MB-02', title: 'No validated detection of data staged to web services', scenario: 'S2', technique: 'T1567', owner: 'Karim Haddad', status: 'open', raised: '2026-10-06' },
  { id: 'GAP-MB-03', title: 'Connected medical devices send no telemetry (certification constraint)', scenario: 'S7', technique: 'T1210', owner: 'Louis Gagnon', status: 'accepted', raised: '2026-05-15', description: 'Accepted by management until the device-network segmentation project (fictional).' },
].map(g => sim({ ...g, description: ((g.description ? g.description + ' ' : '') + FIC) }));

const coverage = [
  { id: 'COV-MB-01', scenario: 'S2', technique: 'T1486', rules: ['DR-MB-08'], note: 'Declared by the detection engineer — the application computes the status. ' + FIC },
  { id: 'COV-MB-02', scenario: 'S3', technique: 'T1490', rules: ['DR-MB-07'], note: 'Declared coverage; see GAP-MB-01. ' + FIC },
].map(sim);

const events = [
  { id: 'EV-MB-001', externalRef: 'ssiem://events/TS-MB-MAIL/20260923075102-1', sourceId: 'TS-MB-MAIL', observed: '2026-09-23T07:51:02', recorded: '2026-09-23T07:51:09', ocsfClass: 4009, parser: 'mailgw 2.3', hash: 'sha256:' + h('ev1') },
  { id: 'EV-MB-002', externalRef: 'ssiem://events/TS-MB-EDRWS/20260923082044-1', sourceId: 'TS-MB-EDRWS', observed: '2026-09-23T08:20:44', recorded: '2026-09-23T08:21:30', ocsfClass: 1007, parser: 'edr 5.1', hash: 'sha256:' + h('ev2') },
  { id: 'EV-MB-003', externalRef: 'ssiem://events/TS-MB-MFA/20260927224631-1', sourceId: 'TS-MB-MFA', observed: '2026-09-27T22:46:31', recorded: '2026-09-27T22:46:35', ocsfClass: 3002, parser: 'mfa 1.4', hash: 'sha256:' + h('ev3') },
  { id: 'EV-MB-004', externalRef: 'ssiem://events/TS-MB-EHR/20260930030112-1', sourceId: 'TS-MB-EHR', observed: '2026-09-30T03:01:12', recorded: '2026-09-30T03:02:00', ocsfClass: 6005, parser: 'ehr-audit 1.0', hash: 'sha256:' + h('ev4') },
  { id: 'EV-MB-005', externalRef: 'ssiem://events/TS-MB-EDRSRV/20261003235448-1', sourceId: 'TS-MB-EDRSRV', observed: '2026-10-03T23:54:48', recorded: '2026-10-03T23:55:00', ocsfClass: 1007, parser: 'edr 5.1', hash: 'sha256:' + h('ev5') },
  { id: 'EV-MB-006', externalRef: 'ssiem://events/TS-MB-EDRSRV/20261004003140-1', sourceId: 'TS-MB-EDRSRV', observed: '2026-10-04T00:31:40', recorded: '2026-10-04T00:31:52', ocsfClass: 1001, parser: 'edr 5.1', hash: 'sha256:' + h('ev6') },
].map(sim);

const siem = { format: 'crg-siem-import/1', generated: '2026-10-12T09:00:00', source: 'CyberRiskGuardian simulation pack medibec-ransomware-2026 — FICTIONAL teaching data', tlp: 'AMBER', simulation: true,
  note: 'Every record in this file is fictional and was written for teaching. Addresses are documentation ranges (RFC 5737, RFC 3849), domains are example.*, hashes are fake. Times are local (Eastern time), without zone.',
  sources, strategies, rules, tests, indicators, alerts, gaps, coverage, events };

/* ---------------- SOAR ---------------- */
const people = { t1: 'Émilie Bouchard', t2: 'Karim Haddad', lead: 'Nadia Roy', ciso: 'Louis Gagnon', ops: 'Julie Tremblay', desk: 'Samuel Côté' };
const gates = [
  { id: 'GATE-MB-01', name: 'Containment and destructive actions need the SOC lead or the CISO', riskClasses: ['containment', 'destructive'], authorities: [people.lead, people.ciso], scope: 'All MediBec systems', validFrom: '2026-01-01' },
  { id: 'GATE-MB-02', name: 'Any change on a crown-jewel system also needs IT operations', riskClasses: [], criticalAssets: true, authorities: [people.ops, people.ciso], scope: 'Crown jewels CJ1–CJ8', validFrom: '2026-01-01' },
].map(sim);
const step = (id, name, action, riskClass, o = {}) => ({ id, name, action, riskClass, ...o });
const playbooks = [
  { id: 'PB-MB-01', name: 'Phishing with a malicious attachment', purpose: 'Contain a delivered malicious attachment and find every recipient.', owner: people.lead, category: 'social-engineering',
    trigger: { kind: 'alert', conditions: 'DR-MB-01 or DR-MB-02 alert' }, scenarios: ['S1', 'S2'],
    versions: [
      { version: 1, state: 'retired', published: '2026-02-01', publishedBy: people.lead, steps: [
        step('ST-1', 'Collect', 'collect message headers and attachment hash', 'read-only', { evidence: 'header export and hash in the case' }),
        step('ST-2', 'Contain', 'isolate workstation', 'containment', { gate: 'GATE-MB-01', evidence: 'EDR isolation record' })] },
      { version: 2, state: 'published', published: '2026-08-15', publishedBy: people.lead, steps: [
        step('ST-1', 'Collect', 'collect message headers and attachment hash', 'read-only', { evidence: 'header export and hash in the case' }),
        step('ST-2', 'Scope', 'search every mailbox for the same message', 'read-only', { evidence: 'search result export' }),
        step('ST-3', 'Purge', 'purge the message from all mailboxes', 'administrative', { requiresGate: true, evidence: 'purge job report' }),
        step('ST-4', 'Contain', 'isolate workstation', 'containment', { gate: 'GATE-MB-01', evidence: 'EDR isolation record' })] }] },
  { id: 'PB-MB-02', name: 'Compromised account and MFA fatigue', purpose: 'Stop an attacker using a valid account.', owner: people.lead, category: 'unauthorised-access',
    trigger: { kind: 'alert', conditions: 'DR-MB-03 or DR-MB-04 alert on a privileged account' }, scenarios: ['S1', 'S27'],
    versions: [{ version: 1, state: 'published', published: '2026-06-10', publishedBy: people.ciso, steps: [
      step('ST-1', 'Collect', 'export sign-in and MFA logs', 'read-only', { evidence: 'log export' }),
      step('ST-2', 'Contain', 'revoke sessions and disable account', 'containment', { gate: 'GATE-MB-01', evidence: 'IdP audit entry' }),
      step('ST-3', 'Recover', 'reset credentials and re-register MFA', 'administrative', { requiresGate: true, evidence: 'IdP audit entry and service-desk ticket' }),
      step('ST-4', 'Inform', 'inform the account owner and their manager', 'read-only', { evidence: 'message in the case' })] }] },
  { id: 'PB-MB-03', name: 'Ransomware on clinical systems', purpose: 'Contain encryption, protect the backups and restore clinical service.', owner: people.ciso, category: 'malware',
    trigger: { kind: 'alert', conditions: 'DR-MB-07 or DR-MB-08 alert' }, scenarios: ['S2', 'S3'],
    versions: [
      { version: 1, state: 'published', published: '2026-05-30', publishedBy: people.ciso, steps: [
        step('ST-1', 'Contain', 'isolate affected servers', 'containment', { gate: 'GATE-MB-01', criticalAsset: true, evidence: 'EDR isolation records' }),
        step('ST-2', 'Contain', 'disable compromised accounts', 'containment', { gate: 'GATE-MB-01', evidence: 'IdP audit entries' }),
        step('ST-3', 'Contain', 'block indicators at the firewall', 'administrative', { evidence: 'firewall change record' }),
        step('ST-4', 'Preserve', 'acquire memory and disk images', 'read-only', { evidence: 'artefact register entries with SHA-256' }),
        step('ST-5', 'Recover', 'restore from the off-site backup', 'administrative', { requiresGate: true, criticalAsset: true, evidence: 'restore report verified by the system owner' })] },
      { version: 2, state: 'draft', steps: [
        step('ST-1', 'Contain', 'isolate affected servers', 'containment', { gate: 'GATE-MB-01', criticalAsset: true, evidence: 'EDR isolation records' }),
        step('ST-2', 'Protect backups', 'disconnect the backup network', 'containment', { evidence: '' })] }] },
  { id: 'PB-MB-04', name: 'Bulk download from cloud image storage', purpose: 'Stop and scope a possible health-data exfiltration from cloud storage.', owner: people.lead, category: 'data-exposure',
    trigger: { kind: 'alert', conditions: 'DR-MB-09 alert' }, scenarios: ['S4'],
    versions: [{ version: 1, state: 'published', published: '2026-07-01', publishedBy: people.lead, steps: [
      step('ST-1', 'Collect', 'export storage access logs', 'read-only', { evidence: 'log export' }),
      step('ST-2', 'Contain', 'revoke sharing links and rotate access keys', 'containment', { gate: 'GATE-MB-01' }),
      step('ST-3', 'Assess', 'list the patients whose images were exposed', 'read-only', { evidence: 'list kept by the privacy officer' })] }] },
  { id: 'PB-MB-05', name: 'Wipe and reimage a workstation', purpose: 'Return an infected workstation to service.', owner: people.ops, category: 'malware',
    trigger: { kind: 'manual', conditions: 'after evidence is preserved' }, scenarios: ['S2'],
    versions: [{ version: 1, state: 'published', published: '2026-03-20', publishedBy: people.ops, steps: [
      step('ST-1', 'Preserve', 'acquire disk image', 'read-only', { evidence: 'artefact register entry' }),
      step('ST-2', 'Wipe', 'wipe and reimage workstation', 'destructive', { gate: 'GATE-MB-01', evidence: 'imaging job report' })] }] },
].map(p => sim({ ...p, purpose: p.purpose + ' ' + FIC }));

const cases = [
  { id: 'CASE-MB-01', title: 'Malicious .docm opened at the Gatineau clinic (WS-GAT-014)', source: { kind: 'alert', id: 'AL-MB-006' }, opened: '2026-09-23T08:30', status: 'closed', severity: 'high', category: 'social-engineering',
    alerts: ['AL-MB-006', 'AL-MB-007', 'AL-MB-008'], assignee: people.t1, assets: [], target: 'WS-GAT-014', activityStart: '2026-09-23T07:51',
    statusDates: { investigating: '2026-09-23T08:45', contained: '2026-09-23T11:20', eradicated: '2026-09-24T10:00', recovered: '2026-09-24T15:00', closed: '2026-09-25T09:00' },
    timeline: [{ at: '2026-09-23T08:45', by: people.t1, text: 'One recipient opened the attachment; 13 copies quarantined.' }, { at: '2026-09-23T11:20', by: people.t1, text: 'WS-GAT-014 isolated.' }],
    closure: 'Workstation reimaged; no persistence found. (Closed too early — see the later cases.)' },
  { id: 'CASE-MB-02', title: 'Account takeover of adm.jdupuis through MFA fatigue', source: { kind: 'alert', id: 'AL-MB-015' }, opened: '2026-09-28T08:10', status: 'eradicated', severity: 'critical', category: 'unauthorised-access',
    alerts: ['AL-MB-014', 'AL-MB-015', 'AL-MB-016', 'AL-MB-017', 'AL-MB-018'], assignee: people.t2, assets: ['CJ5'], target: 'adm.jdupuis', activityStart: '2026-09-27T22:33',
    statusDates: { investigating: '2026-09-28T09:15', contained: '2026-09-28T15:20', eradicated: '2026-10-05T12:00' },
    timeline: [{ at: '2026-09-28T09:15', by: people.t2, text: 'Service-desk report matches the MFA alerts of the night.' }] },
  { id: 'CASE-MB-03', title: 'Ransomware encryption of EHR and scheduling servers', source: { kind: 'alert', id: 'AL-MB-031' }, opened: '2026-10-04T01:05', status: 'contained', severity: 'critical', category: 'malware',
    alerts: ['AL-MB-029', 'AL-MB-030', 'AL-MB-031', 'AL-MB-032', 'AL-MB-033', 'AL-MB-034', 'AL-MB-035'], assignee: people.lead, assets: ['CJ1', 'CJ3', 'CJ6'], target: 'SRV-EHR-APP02', activityStart: '2026-09-23T07:51',
    statusDates: { investigating: '2026-10-04T01:20', contained: '2026-10-05T04:00' },
    timeline: [{ at: '2026-10-04T01:20', by: people.lead, text: 'Encryption confirmed on the EHR document share and SRV-SCHED-01.' }, { at: '2026-10-04T06:30', by: people.lead, text: 'Clinics switched to paper downtime procedures.' }] },
  { id: 'CASE-MB-04', title: 'Bulk download from cloud image-transfer storage by 203.0.113.88', source: { kind: 'alert', id: 'AL-MB-024' }, opened: '2026-10-01T08:00', status: 'investigating', severity: 'high', category: 'data-exposure',
    alerts: ['AL-MB-024'], assignee: people.t1, assets: ['CJ7'], target: 'image-transfer-bucket', statusDates: { investigating: '2026-10-01T09:30' },
    timeline: [{ at: '2026-10-01T09:30', by: people.t1, text: 'Data-read events are not collected since 29 September (TS-MB-CLOUD degraded).' }] },
].map(c => sim({ ...c, notes: FIC }));

const approvals = [
  { id: 'APR-MB-01', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.t1, requested: '2026-09-23', outcome: 'approved', approver: people.lead, decidedOn: '2026-09-23T11:05', validFrom: '2026-09-23T11:05', validUntil: '2026-09-23',
    case: 'CASE-MB-01', action: 'isolate workstation', targets: ['WS-GAT-014'], rationale: 'Confirmed macro execution.' },
  { id: 'APR-MB-02', kind: 'pre-authorisation', gate: 'GATE-MB-01', requestedBy: people.lead, requested: '2026-01-05', outcome: 'approved', approver: people.ciso, decidedOn: '2026-01-06', validFrom: '2026-01-06', validUntil: '2026-09-30',
    riskClasses: ['containment'], scope: 'Isolation of clinic workstations by the SOC on a confirmed malware alert', rationale: 'Standing pre-authorisation for 2026 — expired on 30 September and not renewed.' },
  { id: 'APR-MB-03', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.t2, requested: '2026-09-28', outcome: 'approved', approver: people.lead, decidedOn: '2026-09-28T10:00', validFrom: '2026-09-28T10:00', validUntil: '2026-09-29',
    case: 'CASE-MB-02', action: 'revoke sessions and disable account', targets: ['adm.jdupuis'], revokedOn: '2026-09-28T14:00', revokedBy: people.ciso, rationale: 'Revoked: the account runs the night pharmacy interface; wait for a replacement account.' },
  { id: 'APR-MB-04', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.t2, requested: '2026-10-04', outcome: 'approved', approver: people.t2, decidedOn: '2026-10-04T02:00', validFrom: '2026-10-04T02:00',
    case: 'CASE-MB-03', action: 'disable compromised accounts', targets: ['ehr-sync-svc'], rationale: 'Self-approval attempt during the night: the import refuses this record.' },
  { id: 'APR-MB-05', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.t2, requested: '2026-10-04', outcome: 'approved', approver: people.desk, decidedOn: '2026-10-04T02:10', validFrom: '2026-10-04T02:10',
    case: 'CASE-MB-03', action: 'isolate affected servers', targets: ['SRV-EHR-APP03'], rationale: 'Approved by the service desk, who is not an authority of the gates.' },
  { id: 'APR-MB-06', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.lead, requested: '2026-10-04', outcome: 'approved', approver: people.ciso, decidedOn: '2026-10-04T01:40', validFrom: '2026-10-04T01:40', validUntil: '2026-10-06',
    case: 'CASE-MB-03', action: 'isolate affected servers', targets: ['SRV-EHR-APP02', 'SRV-SCHED-01'], rationale: 'Encryption in progress on crown-jewel servers.' },
  { id: 'APR-MB-07', kind: 'specific', gate: 'GATE-MB-01', requestedBy: people.ops, requested: '2026-10-04', outcome: 'rejected', approver: people.ciso, decidedOn: '2026-10-04T09:00',
    case: 'CASE-MB-03', action: 'wipe and reimage workstation', targets: ['WS-SAG-007'], rationale: 'Rejected: preserve the disk image first.' },
  { id: 'APR-MB-08', kind: 'specific', gate: 'GATE-MB-02', requestedBy: people.lead, requested: '2026-10-08', outcome: 'requested',
    case: 'CASE-MB-03', action: 'restore from the off-site backup', targets: ['SRV-EHR-APP02'], rationale: 'Awaiting the restore test result.' },
].map(a => sim({ ...a, rationale: (a.rationale || '') + ' ' + FIC }));

let x = 0;
const exe = o => { x++; return sim({ id: 'EXE-MB-' + String(x).padStart(2, '0'), attempt: 'att-mb-' + String(x).padStart(3, '0'), ...o, notes: ((o.notes ? o.notes + ' ' : '') + FIC) }); };
const executions = [
  exe({ case: 'CASE-MB-01', playbook: 'PB-MB-01', version: 2, step: 'ST-1', action: 'collect message headers and attachment hash', riskClass: 'read-only', target: 'WS-GAT-014', performedBy: people.t1, started: '2026-09-23T08:50', ended: '2026-09-23T09:05', status: 'succeeded', evidence: ['header export in the case'] }),
  exe({ case: 'CASE-MB-01', playbook: 'PB-MB-01', version: 2, step: 'ST-4', action: 'isolate workstation', riskClass: 'containment', target: 'WS-GAT-014', performedBy: people.t1, started: '2026-09-23T11:10', ended: '2026-09-23T11:12', status: 'succeeded', approval: 'APR-MB-01', evidence: ['EDR isolation record'] }),
  exe({ case: 'CASE-MB-02', playbook: 'PB-MB-02', version: 1, step: 'ST-2', action: 'revoke sessions and disable account', riskClass: 'containment', target: 'adm.jdupuis', performedBy: people.t2, started: '2026-09-28T15:10', ended: '2026-09-28T15:20', status: 'succeeded', approval: 'APR-MB-03', evidence: ['IdP audit entry'], notes: 'Performed after the approval was revoked.' }),
  exe({ case: 'CASE-MB-02', playbook: 'PB-MB-02', version: 1, step: 'ST-3', action: 'reset credentials and re-register MFA', riskClass: 'administrative', target: 'adm.jdupuis', performedBy: people.desk, started: '2026-09-28T16:00', ended: '2026-09-28T16:20', status: 'succeeded', evidence: ['service-desk ticket'], notes: 'No approval was asked for.' }),
  exe({ case: 'CASE-MB-03', playbook: 'PB-MB-03', version: 1, step: 'ST-1', action: 'isolate affected servers', riskClass: 'containment', target: 'SRV-EHR-APP02', criticalAsset: true, performedBy: people.lead, started: '2026-10-04T01:45', ended: '2026-10-04T01:50', status: 'succeeded', approval: 'APR-MB-06', evidence: ['EDR isolation record'] }),
  exe({ case: 'CASE-MB-03', action: 'isolate workstation', riskClass: 'containment', target: 'WS-SAG-007', performedBy: people.t1, started: '2026-10-04T01:55', ended: '2026-10-04T01:57', status: 'succeeded', approval: 'APR-MB-02', evidence: ['EDR isolation record'], notes: 'Relied on the 2026 standing pre-authorisation.' }),
  exe({ case: 'CASE-MB-03', playbook: 'PB-MB-03', version: 1, step: 'ST-2', action: 'disable compromised accounts', riskClass: 'containment', target: 'ehr-sync-svc', performedBy: people.t2, started: '2026-10-04T02:05', ended: '2026-10-04T02:06', status: 'succeeded', approval: 'APR-MB-04', evidence: ['IdP audit entry'] }),
  exe({ case: 'CASE-MB-03', playbook: 'PB-MB-03', version: 1, step: 'ST-1', action: 'isolate affected servers', riskClass: 'containment', target: 'SRV-EHR-APP03', criticalAsset: true, performedBy: people.t2, started: '2026-10-04T02:15', ended: '2026-10-04T02:18', status: 'partial', approval: 'APR-MB-05', evidence: ['EDR isolation record (agent timeout)'] }),
  exe({ case: 'CASE-MB-03', playbook: 'PB-MB-03', version: 1, step: 'ST-3', action: 'block indicators at the firewall', riskClass: 'administrative', target: 'FW-MTL-HUB', performedBy: people.ops, started: '2026-10-04T02:30', ended: '2026-10-04T02:40', status: 'succeeded', evidence: ['firewall change record'] }),
  exe({ case: 'CASE-MB-03', playbook: 'PB-MB-05', version: 1, step: 'ST-2', action: 'wipe and reimage workstation', riskClass: 'destructive', target: 'WS-SAG-007', performedBy: people.ops, started: '2026-10-04T09:30', ended: '2026-10-04T09:35', status: 'cancelled', approval: 'APR-MB-07', evidence: [], notes: 'Started although the approval was rejected; stopped by the SOC lead.' }),
  exe({ case: 'CASE-MB-04', playbook: 'PB-MB-04', version: 1, step: 'ST-1', action: 'export storage access logs', riskClass: 'read-only', target: 'image-transfer-bucket', performedBy: people.t1, started: '2026-10-01T09:40', ended: '2026-10-01T10:10', status: 'succeeded', evidence: ['log export (management events only)'] }),
];

const simulations = [
  { id: 'SIM-MB-01', playbook: 'PB-MB-01', version: 1, date: '2026-03-05', by: people.t1, result: 'passed', scenario: 'S2' },
  { id: 'SIM-MB-02', playbook: 'PB-MB-01', version: 2, date: '2026-08-20', by: people.t1, result: 'passed', scenario: 'S2' },
  { id: 'SIM-MB-03', playbook: 'PB-MB-03', version: 1, date: '2026-06-12', by: people.lead, result: 'passed', scenario: 'S2' },
  { id: 'SIM-MB-04', playbook: 'PB-MB-04', version: 1, date: '2026-07-08', by: people.t1, result: 'failed', scenario: 'S4',
    steps: [{ step: 'ST-2', action: 'revoke sharing links and rotate access keys', riskClass: 'containment', needsApproval: true, approval: '', flags: ['needs approval'], issues: ['missing expected evidence'] }] },
].map(s => sim({ ...s, notes: FIC }));

const lessons = [
  sim({ id: 'LL-MB-01', case: 'CASE-MB-01', date: '2026-10-07', by: people.lead, scenarios: ['S2', 'S8'], lesson: 'The EDR alert on WINWORD spawning PowerShell (AL-MB-008) was closed as benign by the service desk; the beacon alerts that followed were never triaged. ' + FIC }),
];
const artefacts = [
  sim({ id: 'FA-MB-01', case: 'CASE-MB-03', kind: 'disk-image', pointer: 'evidence-vault://medibec/CASE-MB-03/WS-SAG-007.e01 (fictional)', sha256: h('disk image WS-SAG-007'), acquired: '2026-10-04T10:15', acquiredBy: people.t2, custody: [people.t2, people.lead] }),
];

const soar = { format: 'crg-soar-import/1', generated: '2026-10-12T09:00:00', source: 'CyberRiskGuardian simulation pack medibec-ransomware-2026 — FICTIONAL teaching data', simulation: true,
  note: 'Every record in this file is fictional. Nothing in it was executed on any system. Times are local (Eastern time), without zone. No incident confirmation is included: students confirm (or not) in the application.',
  playbooks, gates, cases, approvals, executions, simulations, lessons, artefacts };

/* ---------------- manifest ---------------- */
const manifest = {
  format: 'crg-simulation-pack/1', id: 'medibec-ransomware-2026', version: '1.0', title: 'MediBec — phishing to ransomware on the EHR (three weeks of SOC activity)', case: 'medibec', fictional: true,
  language: 'en', created: '2026-10-12', author: 'CyberRiskGuardian teaching material (fictional)', license: 'CC BY-NC 4.0',
  description: 'Three weeks (21 September – 9 October 2026) of fictional SIEM and SOAR records for the MediBec teaching case: 12 telemetry sources, 13 detection rules with their tests, 40 alerts (noise, false positives and an intrusion chain from a phishing attachment to ransomware on the EHR), 15 indicators with TLP 2.0 markings, 5 playbooks, 4 cases, approvals and recorded actions with deliberate approval gaps.',
  asOfHint: 'Use an as-of date on or after 2026-10-09. Coverage and telemetry health are computed at the as-of date.',
  timezone: 'Times are local Eastern time, written without a zone.',
  scenarios: ['S1', 'S2', 'S3', 'S4', 'S5', 'S8', 'S12', 'S23', 'S24', 'S27', 'S30'],
  crownJewels: ['CJ1', 'CJ2', 'CJ3', 'CJ5', 'CJ6', 'CJ7'],
  people: Object.values(people).map(n => n + ' (fictional)'),
  learningObjectives: [
    'Distinguish an alert, a case and an incident: no alert or indicator match is an incident until a named person confirms it on a date.',
    'Prioritise a triage queue by crown jewel and severity rather than by arrival time.',
    'Recognise benign activity and false positives, and the cost of a mis-triaged true positive.',
    'Explain why detection coverage counts as validated only with an effective test of the current rule version and healthy telemetry.',
    'Spot blind spots caused by silent, stale or degraded telemetry and record them as detection gaps.',
    'Respect TLP 2.0 markings (AMBER+STRICT, RED) when sharing and exporting indicators and alerts.',
    'Treat source confidence (0–100) as a statement of the producer, never as a probability for the risk model.',
    'Audit response actions against human approvals: expired, revoked, absent, wrong-authority and not-granted approvals.',
    'Relate operational evidence to the MediBec risk scenarios (S1, S2, S3, S4, S5) without changing any risk parameter.',
  ],
  storyline: [
    { day: 1, date: '2026-09-21', title: 'Normal Monday', text: 'Authorised scanner, backup transfer and a clinician signing in through the Quebec City VPN egress (false positive).', alerts: ['AL-MB-001', 'AL-MB-002', 'AL-MB-003'] },
    { day: 2, date: '2026-09-22', title: 'Background noise', text: 'A patient CD on an imaging workstation and the awareness team\'s campaign. Unknown to the SOC, the backup log forwarder went silent on 18 September.', alerts: ['AL-MB-004', 'AL-MB-005'] },
    { day: 3, date: '2026-09-23', title: 'Initial access', text: 'An EHR-themed phishing e-mail with a .docm attachment reaches 14 staff; 13 copies are quarantined, one is opened at the Gatineau clinic. The PowerShell alert is closed as benign by the service desk; the DNS query to the C2 domain stays untriaged. CASE-MB-01 isolates and reimages the workstation and is closed — too early.', alerts: ['AL-MB-006', 'AL-MB-007', 'AL-MB-008', 'AL-MB-009'] },
    { day: 4, date: '2026-09-24', title: 'A false alarm', text: 'Failed portal sign-ins after a password-reset mailing.', alerts: ['AL-MB-010'] },
    { day: 5, date: '2026-09-25', title: 'Persistence', text: 'Beaconing to 203.0.113.45 and a new scheduled task: both left in the queue.', alerts: ['AL-MB-011', 'AL-MB-012'] },
    { day: 6, date: '2026-09-26', title: 'Month-end', text: 'A records clerk\'s authorised report trips the bulk-query rule (false positive).', alerts: ['AL-MB-013'] },
    { day: 7, date: '2026-09-27', title: 'MFA fatigue', text: 'At night an administrator receives 11 push prompts and approves the twelfth; sign-in and VPN session from 198.51.100.77.', alerts: ['AL-MB-014', 'AL-MB-015', 'AL-MB-016', 'AL-MB-017'] },
    { day: 8, date: '2026-09-28', title: 'Account case', text: 'A service-desk report links the prompts; CASE-MB-02 opens. The approval to disable the account is revoked by the CISO at 14:00, yet the account is disabled at 15:10; the MFA reset is done without approval.', alerts: ['AL-MB-018'] },
    { day: 9, date: '2026-09-29', title: 'Lateral movement', text: 'RDP from the Gatineau workstation to an EHR server, then directory reconnaissance. The RDP rule\'s last test was ineffective, but it fired this time.', alerts: ['AL-MB-019', 'AL-MB-020'] },
    { day: 10, date: '2026-09-30', title: 'Collection', text: 'The ehr-sync-svc account reads 48,000 patient records; an archive is staged. The standing pre-authorisation for workstation isolation expires tonight.', alerts: ['AL-MB-021', 'AL-MB-022', 'AL-MB-023'] },
    { day: 11, date: '2026-10-01', title: 'Exfiltration', text: 'Upload to files.example.com, and a 38 GB download from the cloud image storage (CASE-MB-04) — whose data-read logs were switched off two days earlier. A partner transfer is a false positive of the same rule.', alerts: ['AL-MB-024', 'AL-MB-025', 'AL-MB-026'] },
    { day: 12, date: '2026-10-02', title: 'Quiet day', text: 'Internet scan noise and a roaming nurse (false positive).', alerts: ['AL-MB-027', 'AL-MB-028'] },
    { day: 13, date: '2026-10-03', title: 'Recovery inhibition', text: 'Shadow copies deleted on the file server. The backup catalogue is also wiped, but the backup telemetry is silent: no alert.', alerts: ['AL-MB-029'] },
    { day: 14, date: '2026-10-04', title: 'Impact', text: 'Encryption of the EHR document share, the scheduling server and clinic workstations; ransom notes; the EHR is down at all clinics. CASE-MB-03 opens; isolations follow — one with an expired pre-authorisation, one approved by a self-approval the import refuses, one approved by someone without authority; a reimage starts although it was rejected.', alerts: ['AL-MB-030', 'AL-MB-031', 'AL-MB-032', 'AL-MB-033', 'AL-MB-034', 'AL-MB-035'] },
    { day: 15, date: '2026-10-05', title: 'Containment', text: 'Servers isolated; a blocked sign-in with the disabled account.', alerts: ['AL-MB-036'] },
    { day: 16, date: '2026-10-06', title: 'Noise returns', text: 'The PACS migration job trips the encryption rule (false positive).', alerts: ['AL-MB-037'] },
    { day: 17, date: '2026-10-07', title: 'Old intelligence', text: 'A match on an indicator its producer revoked.', alerts: ['AL-MB-038'] },
    { day: 18, date: '2026-10-08', title: 'Opportunists', text: 'A patient reports a look-alike appointment e-mail.', alerts: ['AL-MB-039'] },
    { day: 19, date: '2026-10-09', title: 'Restore test', text: 'The EHR database restores from the off-site copy. The restore itself still waits for approval.', alerts: ['AL-MB-040'] },
  ],
  exercises: [
    { id: 'EX-01', question: 'Which alerts should an analyst open first on the morning of 4 October, and why?', screen: 'SIEM → Alerts & triage', route: '#/siem/alerts', expected: 'Critical alerts on crown jewels come first, the latest first: AL-MB-035 (EHR down), AL-MB-033, AL-MB-032, AL-MB-031 (encryption on CJ1 and CJ3), AL-MB-029 (shadow copies on CJ6), then the earlier critical crown-jewel alerts still untriaged — AL-MB-024 (CJ7), AL-MB-021 (CJ1), AL-MB-015 (CJ5). The queue is ordered by crown jewel, then severity weighted by criticality, not by arrival time.' },
    { id: 'EX-02', question: 'Find the true positive that was closed as benign on day 3. What should have happened?', screen: 'SIEM → Alerts & triage', route: '#/siem/alerts', expected: 'AL-MB-008 (WINWORD spawning PowerShell on WS-GAT-014) was marked benign by the service desk; with AL-MB-009 (DNS to the C2 domain) it should have been escalated, which would have kept CASE-MB-01 open.' },
    { id: 'EX-03', question: 'Which detections are validated, untested, degraded or missing, and why is DR-MB-07 not validated although it was tested?', screen: 'SIEM → Coverage & gaps', route: '#/siem/coverage', expected: 'Validated: DR-MB-01, 04, 06, 08. Untested: DR-MB-03, DR-MB-10. Degraded: DR-MB-02 (workstation EDR degraded), DR-MB-05 (latest test ineffective), DR-MB-07 (backup telemetry silent), DR-MB-09 (in testing, cloud logs degraded), DR-MB-11 (Wi-Fi source stale). Missing: DR-MB-12 (draft), DR-MB-13 (disabled).' },
    { id: 'EX-04', question: 'Which telemetry sources are not healthy at the as-of date, and which scenario does each blind spot affect?', screen: 'SIEM → Telemetry sources', route: '#/siem/sources', expected: 'TS-MB-BKP silent (S3, S2 — backup deletion unseen), TS-MB-WIFI silent because stale (S12), TS-MB-EDRWS degraded (S2), TS-MB-CLOUD degraded (S4).' },
    { id: 'EX-05', question: 'Which indicators may not be shared outside the SOC, and which ones no longer support any inference?', screen: 'SIEM → Indicators & TLP', route: '#/siem/intel', expected: 'IND-MB-04 is TLP:AMBER+STRICT and IND-MB-10 is TLP:RED (left out of default exports). IND-MB-13 is revoked and IND-MB-15 expired on 30 September: both are stale.' },
    { id: 'EX-06', question: 'IND-MB-10 has confidence 95. Can you use 0.95 as Pb(A) for scenario S2?', screen: 'SIEM → Indicators & TLP, then Scenario register', route: '#/siem/intel', expected: 'No. Source confidence is the producer\'s statement on a 0–100 scale, not a probability; it never feeds a CRG likelihood. The analyst may cite the evidence when reviewing S2, but the parameters are changed only by an analyst decision.' },
    { id: 'EX-07', question: 'Is CASE-MB-03 an incident? What is needed to make it one, and what follows for Quebec Law 25?', screen: 'SOAR → Cases', route: '#/soar/cases', expected: 'Not yet: no incident confirmation is recorded. A named person confirms it on a date (personal health information involved), which creates the incident in the register; reportability under Law 25 is then undetermined until assessed.' },
    { id: 'EX-08', question: 'Which recorded actions lack a valid approval, and for what reason?', screen: 'SOAR → Actions', route: '#/soar/actions', expected: 'EXE-MB-03 revoked (APR-MB-03 revoked at 14:00), EXE-MB-04 absent (MFA reset without approval), EXE-MB-06 expired (pre-authorisation APR-MB-02 ended 30 September), EXE-MB-07 absent (APR-MB-04 was a self-approval the import refused), EXE-MB-08 wrong-authority (service desk), EXE-MB-10 not-granted (reimage rejected).' },
    { id: 'EX-09', question: 'Which playbooks may be relied on in an incident, and which need work?', screen: 'SOAR → Playbooks and Simulations', route: '#/soar/playbooks', expected: 'PB-MB-01 v2 and PB-MB-03 v1 have a passed simulation of the version in force. PB-MB-02 and PB-MB-05 were never simulated. PB-MB-04 failed its simulation (step ST-2 has no expected evidence). PB-MB-03 v2 is a draft with a containment step that names no gate and no evidence.' },
    { id: 'EX-10', question: 'Write two detection gaps and one corrective action that this storyline justifies, linked to MediBec scenarios.', screen: 'SIEM → Coverage & gaps, Shared registers', route: '#/siem/coverage', expected: 'For example: GAP-MB-01 (S3, T1490, backup telemetry silent) and GAP-MB-02 (S2, T1567, no validated exfiltration detection); corrective action: monitor the health of every log forwarder and alert when a source goes silent.' },
  ],
  expectedImport: {
    siem: { sources: 12, strategies: 2, rules: 13, tests: 12, indicators: 15, alerts: 40, gaps: 3, coverage: 2, events: 6 },
    soar: { playbooks: 5, gates: 2, cases: 4, approvals: 7, executions: 11, simulations: 4, lessons: 1, artefacts: 1 },
    soarSkipped: [{ list: 'approvals', id: 'APR-MB-04', why: 'No self-approval (deliberate teaching point)' }],
  },
  files: [
    { path: 'siem.json', format: 'crg-siem-import/1', module: 'siem' },
    { path: 'soar.json', format: 'crg-soar-import/1', module: 'soar' },
  ],
};


const nb = t => t.replace(/ ([:;!?])/g, ' $1').replace(/« /g, '« ').replace(/ »/g, ' »');
const FR = {
  title: 'MediBec — de l’hameçonnage au rançongiciel sur le DSE (trois semaines d’activité du COS)',
  description: 'Trois semaines (21 septembre – 9 octobre 2026) de données SIEM et SOAR fictives pour le cas MediBec : 12 sources de télémétrie, 13 règles de détection et leurs tests, 40 alertes (bruit, faux positifs et une chaîne d’intrusion allant d’une pièce jointe d’hameçonnage au rançongiciel sur le DSE), 15 indicateurs marqués TLP 2.0, 5 guides d’intervention, 4 dossiers, des approbations et des actions consignées comportant des lacunes d’approbation volontaires.',
  learningObjectives: [
    'Distinguer une alerte, un dossier et un incident : aucune alerte ni correspondance d’indicateur n’est un incident tant qu’une personne nommée ne l’a pas confirmé à une date donnée.',
    'Prioriser une file de triage selon les joyaux de la couronne et la gravité plutôt que selon l’heure d’arrivée.',
    'Reconnaître l’activité bénigne et les faux positifs, et le coût d’un vrai positif mal trié.',
    'Expliquer pourquoi une couverture de détection n’est validée que par un test efficace de la version courante de la règle et une télémétrie en bon état.',
    'Repérer les angles morts causés par une télémétrie silencieuse, périmée ou dégradée et les consigner comme lacunes de détection.',
    'Respecter les marquages TLP 2.0 (AMBER+STRICT, RED) lors du partage et de l’exportation des indicateurs et des alertes.',
    'Traiter la confiance de la source (0–100) comme une déclaration du producteur, jamais comme une probabilité pour le modèle de risque.',
    'Auditer les actions d’intervention au regard des approbations humaines : expirées, révoquées, absentes, sans autorité et non accordées.',
    'Relier les constats opérationnels aux scénarios de risque de MediBec (S1, S2, S3, S4, S5) sans modifier aucun paramètre de risque.',
  ],
  storyline: [
    ['Lundi ordinaire', 'Analyseur de vulnérabilités autorisé, transfert de sauvegarde et un clinicien qui se connecte par la sortie RPV de Québec (faux positif).'],
    ['Bruit de fond', 'Le CD d’un patient sur un poste d’imagerie et la campagne de sensibilisation. À l’insu du COS, le relais des journaux de sauvegarde est silencieux depuis le 18 septembre.'],
    ['Accès initial', 'Un courriel d’hameçonnage sur le thème du DSE avec une pièce jointe .docm atteint 14 employés ; 13 copies sont mises en quarantaine, une est ouverte à la clinique de Gatineau. L’alerte PowerShell est fermée comme bénigne par le centre de services ; la requête DNS vers le domaine de commande reste non triée. Le dossier CASE-MB-01 isole et réinstalle le poste, puis est fermé — trop tôt.'],
    ['Fausse alerte', 'Des échecs de connexion au portail patient après un envoi de réinitialisation de mots de passe.'],
    ['Persistance', 'Balise vers 203.0.113.45 et nouvelle tâche planifiée : les deux restent dans la file.'],
    ['Fin de mois', 'Le rapport autorisé d’une commis aux dossiers déclenche la règle d’interrogation massive (faux positif).'],
    ['Fatigue MFA', 'La nuit, un administrateur reçoit 11 demandes d’approbation et approuve la douzième ; connexion et session RPV depuis 198.51.100.77.'],
    ['Dossier de compte', 'Un signalement au centre de services relie les demandes ; le dossier CASE-MB-02 est ouvert. L’approbation de désactiver le compte est révoquée par le RSSI à 14 h, mais le compte est désactivé à 15 h 10 ; la réinitialisation MFA est faite sans approbation.'],
    ['Mouvement latéral', 'RDP du poste de Gatineau vers un serveur du DSE, puis reconnaissance de l’annuaire. Le dernier test de la règle RDP était inefficace, mais elle s’est déclenchée cette fois.'],
    ['Collecte', 'Le compte ehr-sync-svc lit 48 000 dossiers patients ; une archive est préparée. La préautorisation permanente d’isolement des postes expire ce soir.'],
    ['Exfiltration', 'Téléversement vers files.example.com et téléchargement de 38 Go depuis le stockage infonuagique d’images (CASE-MB-04) — dont les journaux de lecture ont été désactivés deux jours plus tôt. Un transfert d’un partenaire est un faux positif de la même règle.'],
    ['Journée calme', 'Bruit de balayage Internet et une infirmière itinérante (faux positif).'],
    ['Entrave à la reprise', 'Les clichés instantanés sont supprimés sur le serveur de fichiers. Le catalogue de sauvegarde est aussi effacé, mais la télémétrie de sauvegarde est silencieuse : aucune alerte.'],
    ['Impact', 'Chiffrement du partage documentaire du DSE, du serveur de rendez-vous et de postes de clinique ; notes de rançon ; le DSE est indisponible dans toutes les cliniques. Le dossier CASE-MB-03 est ouvert ; des isolements suivent — l’un avec une préautorisation expirée, l’un approuvé par une autoapprobation que l’importation refuse, l’un approuvé par une personne sans autorité ; une réinstallation commence alors qu’elle a été refusée.'],
    ['Confinement', 'Serveurs isolés ; tentative de connexion bloquée avec le compte désactivé.'],
    ['Retour du bruit', 'La tâche de migration de l’archive d’imagerie (PACS) déclenche la règle de chiffrement (faux positif).'],
    ['Vieux renseignement', 'Une correspondance avec un indicateur révoqué par son producteur.'],
    ['Opportunistes', 'Un patient signale un courriel de rendez-vous provenant d’un domaine sosie.'],
    ['Test de restauration', 'La base du DSE est restaurée depuis la copie hors site. La restauration elle-même attend encore une approbation.'],
  ].map(([title, text]) => ({ title: nb(title), text: nb(text) })),
  exercises: [
    ['Quelles alertes un analyste doit-il ouvrir en premier le matin du 4 octobre, et pourquoi ?', 'SIEM → Alertes et tri', 'Les alertes critiques visant un joyau de la couronne passent en premier, la plus récente d’abord : AL-MB-035 (DSE indisponible), AL-MB-033, AL-MB-032, AL-MB-031 (chiffrement sur CJ1 et CJ3), AL-MB-029 (clichés instantanés sur CJ6), puis les alertes critiques antérieures sur des joyaux, toujours non triées — AL-MB-024 (CJ7), AL-MB-021 (CJ1), AL-MB-015 (CJ5). La file est classée par joyau, puis par gravité pondérée par la criticité, et non par heure d’arrivée.'],
    ['Trouvez le vrai positif fermé comme bénin le jour 3. Qu’aurait-il fallu faire ?', 'SIEM → Alertes et tri', 'AL-MB-008 (WINWORD lance PowerShell sur WS-GAT-014) a été marquée bénigne par le centre de services ; avec AL-MB-009 (DNS vers le domaine de commande), elle aurait dû être escaladée, ce qui aurait gardé CASE-MB-01 ouvert.'],
    ['Quelles détections sont validées, non testées, dégradées ou manquantes, et pourquoi DR-MB-07 n’est-elle pas validée bien qu’elle ait été testée ?', 'SIEM → Couverture et lacunes', 'Validées : DR-MB-01, 04, 06, 08. Non testées : DR-MB-03, DR-MB-10. Dégradées : DR-MB-02 (EDR des postes dégradé), DR-MB-05 (dernier test inefficace), DR-MB-07 (télémétrie de sauvegarde silencieuse), DR-MB-09 (en test, journaux infonuagiques dégradés), DR-MB-11 (source Wi-Fi périmée). Manquantes : DR-MB-12 (brouillon), DR-MB-13 (désactivée).'],
    ['Quelles sources de télémétrie ne sont pas en bon état à la date de référence, et quel scénario chaque angle mort touche-t-il ?', 'SIEM → Sources de télémétrie', 'TS-MB-BKP silencieuse (S3, S2 — suppression des sauvegardes non vue), TS-MB-WIFI silencieuse car périmée (S12), TS-MB-EDRWS dégradée (S2), TS-MB-CLOUD dégradée (S4).'],
    ['Quels indicateurs ne peuvent pas être partagés hors du COS, et lesquels ne soutiennent plus aucune inférence ?', 'SIEM → Indicateurs et TLP', 'IND-MB-04 est TLP:AMBER+STRICT et IND-MB-10 est TLP:RED (exclus des exportations par défaut). IND-MB-13 est révoqué et IND-MB-15 a expiré le 30 septembre : tous deux sont périmés.'],
    ['IND-MB-10 a une confiance de 95. Pouvez-vous utiliser 0,95 comme Pb(A) pour le scénario S2 ?', 'SIEM → Indicateurs et TLP, puis Registre des scénarios', 'Non. La confiance de la source est la déclaration du producteur sur une échelle de 0 à 100, pas une probabilité ; elle n’alimente jamais une vraisemblance CRG. L’analyste peut citer la preuve en révisant S2, mais seuls ses propres choix modifient les paramètres.'],
    ['CASE-MB-03 est-il un incident ? Que faut-il pour qu’il le devienne, et qu’en découle-t-il pour la Loi 25 ?', 'SOAR → Dossiers', 'Pas encore : aucune confirmation d’incident n’est consignée. Une personne nommée le confirme à une date (renseignements de santé en cause), ce qui crée l’incident au registre ; le caractère déclarable selon la Loi 25 est alors indéterminé jusqu’à son évaluation.'],
    ['Quelles actions consignées n’ont pas d’approbation valide, et pour quel motif ?', 'SOAR → Actions', 'EXE-MB-03 révoquée (APR-MB-03 révoquée à 14 h), EXE-MB-04 absente (réinitialisation MFA sans approbation), EXE-MB-06 expirée (préautorisation APR-MB-02 échue le 30 septembre), EXE-MB-07 absente (APR-MB-04 était une autoapprobation refusée à l’importation), EXE-MB-08 sans autorité (centre de services), EXE-MB-10 non accordée (réinstallation refusée).'],
    ['Sur quels guides d’intervention peut-on compter lors d’un incident, et lesquels demandent du travail ?', 'SOAR → Guides d’intervention et Simulations', 'PB-MB-01 v2 et PB-MB-03 v1 ont une simulation réussie de la version en vigueur. PB-MB-02 et PB-MB-05 n’ont jamais été simulés. PB-MB-04 a échoué sa simulation (l’étape ST-2 n’a pas de preuve attendue). PB-MB-03 v2 est un brouillon dont une étape de confinement ne nomme ni point d’approbation ni preuve.'],
    ['Rédigez deux lacunes de détection et une mesure corrective que ce scénario justifie, liées aux scénarios de MediBec.', 'SIEM → Couverture et lacunes, Registres partagés', 'Par exemple : GAP-MB-01 (S3, T1490, télémétrie de sauvegarde silencieuse) et GAP-MB-02 (S2, T1567, aucune détection validée de l’exfiltration) ; mesure corrective : surveiller l’état de chaque relais de journaux et alerter dès qu’une source devient silencieuse.'],
  ].map(([question, screen, expected]) => ({ question: nb(question), screen, expected: nb(expected) })),
};
FR.title = nb(FR.title); FR.description = nb(FR.description); FR.learningObjectives = FR.learningObjectives.map(nb);
manifest.i18n = { fr: FR };

writeFileSync(OUT + 'siem.json', JSON.stringify(siem, null, 1));
writeFileSync(OUT + 'soar.json', JSON.stringify(soar, null, 1));
writeFileSync(OUT + 'manifest.json', JSON.stringify(manifest, null, 1));
const IDX = fileURLToPath(new URL('../index.json', import.meta.url));
let index = { format: 'crg-simulation-index/1', packs: [] };
try { index = JSON.parse(readFileSync(IDX, 'utf8')); } catch { /* first pack */ }
index.packs = [...index.packs.filter(p => p.id !== manifest.id), { id: manifest.id, path: 'medibec/manifest.json', case: 'medibec', title: manifest.title, language: 'en', fictional: true }];
writeFileSync(IDX, JSON.stringify(index, null, 1));
console.log(`medibec pack: ${alerts.length} alerts, ${executions.length} executions`);
