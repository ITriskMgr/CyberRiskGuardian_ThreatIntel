# Data protection (always applies)

- Treat organization documents, assessments and deliverables as confidential.
- Do not send personal, health, financial or otherwise regulated information to external services (web search, third-party APIs, external AI tools) without explicit authorization under the organization's policies.
- Search the web only for public threat, sector or standards information; never paste organizational details into queries.
- Keep generated client deliverables out of version control (`output/`, `deliverables/` are git-ignored except the fictional MediBec example).
- Organisation graphs, CRGO risk contexts, compliance/v1 and secops/v1 reads, and dss/v1 write-backs are client data: keep them in `output/crgo/` or with the confidential deliverables, never in this repository or in the CRGO repository. CRGO clones (`CyberRiskGuardian-Ontology*/`) are git-ignored.
- Do not read or write `CLAUDE.local.md`, `.claude/settings.local.json`, `.env*` or key files.
