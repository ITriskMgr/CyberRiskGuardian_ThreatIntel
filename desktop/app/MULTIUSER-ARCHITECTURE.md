# Multi-user architecture — CyberRiskGuardian Desktop

*Beta 1.5.2 — proof of concept. Option A ships now; Option B is a design for a later version.*

## 1. Why two options

Several people take part in a risk assessment: an analyst builds scenarios, a risk owner validates
them, a manager approves treatment, an auditor reads. 1.5.2 gives each of them a sign-in, a set of
rights per process step and a trace of what they did. The open question was where those rules are
enforced.

| | **Option A — one computer (1.5.2)** | **Option B — team server (later)** |
|---|---|---|
| Where data lives | IndexedDB of one browser profile | Workspace files held by the helper, on a shared machine |
| Who enforces rights | The application in the browser | The helper, on every API call |
| Sign-in | Pick a user; optional PIN (salted SHA-256) | Account with password or SSO; session token |
| Security boundary | **None** — anyone with the computer can bypass it | Yes, within the limits of the server's hosting |
| Concurrency | One person at a time | Several, with per-record locking |
| Audit | Local activity log, exportable as CSV | Append-only, server-side, signed |
| Purpose | Organize who does what; teaching; a demonstration of the model | Real shared use inside an organization |

Option A is deliberately honest about what it is: it structures collaboration and records
accountability, but it does not protect anything from someone who has the computer. The screens
say so where the mode is turned on.

## 2. The model shared by both options

The rights model is the same in A and B, so that B changes the enforcement point, not the rules.

**Process steps** — the 12 steps of the Process page (`js/process.js`): setup, context, assets,
threats, scenarios, quantify, evaluate, treat, recommend, budget, monitor, report. Every screen maps
to one step (`PANEL_STEP`, `stepOf()`).

**RACI letter per user and step**

| Letter | Meaning | View | Edit | Approve |
|---|---|:-:|:-:|:-:|
| R | Responsible — does the work | ✓ | ✓ | |
| A | Accountable — owns the result | ✓ | ✓ | ✓ |
| C | Consulted | ✓ | | |
| I | Informed (default) | ✓ | | |
| – | No access — the step's screens are hidden | | | |

Administrators have every right and manage users. Approvals that require **A** (or administrator):
approving a recommendation (step 9), a formal risk acceptance in the risk register (step 9), and
approving a measure (step 8).

**Templates** offered when adding a user: viewer (I everywhere), analyst (R on steps 1–8 and 10–12,
C on 9), risk owner (A on 7–9, C elsewhere), manager (A everywhere), administrator.

**Audit** — every sign-in, sign-out, user or RACI change, approval and (throttled) edit is recorded
with time, user, action and detail. Workspace-related entries are also copied into the workspace
(`ws.userAudit`) so they travel with it.

## 3. Option A as built (1.5.2)

- `js/users.js` holds `{enabled, users, current, audit}` in the IndexedDB `meta` store under `users`;
  the signed-in user is kept for the browser session only (`sessionStorage`).
- `users.enforce()` runs after every screen is drawn: without the Edit right it marks the section
  read-only, disables inputs and action buttons (navigation, sub-tabs, search and filters stay
  usable) and shows a banner naming the user's role. A MutationObserver keeps late-drawn controls
  locked.
- Approval code paths call `users.requireApprove(step)`, which throws a readable error when the
  current user lacks **A** — the check sits in the logic, not only on the button.
- Screens of steps marked “–” are removed from the navigation and redirected to the Process page.
- Backups include users and the RACI matrix but **never PIN hashes**; a restore into an installation
  already in multi-user mode leaves its users untouched.

## 4. Option B — design

### 4.1 Components

```
 browser (same app)  ──HTTPS──▶  helper in team mode (serve.py --team)
                                   ├─ auth: accounts, sessions, optional OIDC
                                   ├─ policy: RACI check on every write
                                   ├─ store: one JSON file per workspace + blobs, with versions
                                   ├─ locks: per record, short leases
                                   └─ audit: append-only log, hash-chained
```

The helper already exists, is the only component allowed to reach the network, and holds keys. In
team mode it also becomes the system of record. The application keeps working offline for a single
user exactly as today; team mode is opt-in per installation.

### 4.2 Authentication

- Local accounts (Argon2id password hashes) for small teams; OpenID Connect (Entra ID, Google,
  Okta) for organizations. MFA through the identity provider.
- Session: random token in an `HttpOnly; Secure; SameSite=Strict` cookie, 8-hour idle timeout.
- The existing `X-CRG` header guard stays, plus CSRF protection on every write.
- Transport: TLS required as soon as the helper listens on anything other than loopback.

### 4.3 Authorization

- The RACI matrix moves to the server, per workspace (a user can be R on one case and I on another).
- Every write endpoint declares the step it touches; the policy check is `can(user, verb, step,
  workspace)`, the same function as `users.can()` today.
- Approvals are server operations that freeze the figures (as the recommendation lifecycle already
  does) and write the approver from the session, never from the request body.
- Separation of duties (optional): the person who drafts a recommendation cannot approve it.

### 4.4 Storage and concurrency

- One workspace = one directory: `workspace.json`, `docs/`, `snapshots/`, `history/` (previous
  versions, kept N days).
- Records (scenario, measure, risk, recommendation, KRI) carry a `rev`; writes send the `rev` they
  read; a mismatch returns 409 and the screen offers reload/merge — no silent overwrite.
- Short leases on the record being edited show “being edited by …” to others.
- The engine (`crg.js`) is unchanged and still runs in the browser for display; the server re-runs
  it on approval so frozen figures cannot be forged by a modified client.

### 4.5 Audit

- Append-only JSON lines, each entry carrying the hash of the previous one; daily anchor hash.
- Exported as CSV for the risk committee; never editable from the application.

### 4.6 Migration from Option A

1. Export a backup (users and RACI included, without PINs).
2. Start the helper in team mode, import the backup: users become accounts in a *password to set*
   state, the RACI matrix is attached to every imported workspace.
3. The administrator sends each user a one-time enrolment link.

### 4.7 Out of scope for the proof of concept

Hosting, high availability, encryption at rest beyond the disk's, records retention policy and
privacy impact assessment of a shared deployment — all to be decided by the organization that
deploys it.

---
© 2026 Marc-André Léger. CC BY-NC 4.0. Drafted with the help of generative AI (Claude); reviewed by
the author.
