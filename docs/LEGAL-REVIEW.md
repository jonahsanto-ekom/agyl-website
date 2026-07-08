# Legal Review — AGYL & EKOM marketing sites (pre-merge)

> Governance doc for the AGYL/EKOM website workstream. Lives in the AGYL repo
> (parent/operator) alongside `DECISIONS.md` and `WEBSITE-PLATFORM.md`.
> Created 2026-07-08. Covers the trust/legal accuracy pass in
> agyl-website PR #3 and ekom-website PR #3 (both Codex-cleared, in draft).

**Operator:** AGYL AI, Inc. (d.b.a. Ekom AI), Delaware corp. EKOM is a product of AGYL.
**Scope:** Two static public marketing sites (agyl.ai, ekom.ai). The client/product
experience lives elsewhere.

## Status — legal/privacy lane

**Operator approval:** Jonah Santo, July 8, 2026 — accepted the disclosures as-is for launch,
with additional verification deferred to post-deploy.
**Outside counsel:** has **not** reviewed these documents. This is operator sign-off, not a
legal opinion; nothing here should be treated as legal advice. The checklist below is retained
as the scope for a future counsel review — it is **not** a record of counsel approval.

**For a future counsel review:** confirm each item is accurate and adequately disclosed, or
redline. Flag anything needing a new mechanism (e.g. a "Do Not Sell or Share" link) or a
subprocessor/DPA reference.

## Applies to BOTH sites

1. **Apollo pre-consent identification.** Company-level (not person-level) visitor ID fires
   *before* cookie consent; suppressed on internal devices and on Global Privacy Control (GPC).
   Disclosed in the consent banner and privacy policy. *Question:* acceptable under CCPA/CPRA
   (GPC honored)? The EU/UK ePrivacy "consent-first" gap is logged as an accepted business
   decision (`docs/DECISIONS.md`) with geo-gating as the planned mitigation — confirm that
   risk posture is acceptable.
   - AGYL: `public/consent.js`, `src/pages/privacy.astro`, `docs/DECISIONS.md`
   - EKOM: `public/consent.js`, `privacy.html`
2. **"Sale/Sharing" language.** Both now state: no sale for monetary payment, while
   acknowledging the LinkedIn Insight Tag (and similar consented tools) may constitute a
   "sale"/"sharing" for cross-context behavioral advertising under some U.S. state laws,
   avoidable via "Essential only." *Question:* adequate CCPA/CPRA treatment, or do we need a
   dedicated "Do Not Sell or Share My Personal Information" link/mechanism?
3. **SOC 2 / compliance claims.** Both cite SOC 2 (EKOM: "certified (2024), report under NDA";
   AGYL: homepage badge + `/security`). *Question:* confirm a current SOC 2 report exists and
   the wording doesn't overstate; confirm a DPA exists if "DPA available" is claimed; confirm
   CCPA/GDPR claims are supportable.
4. **Isolation claim.** Reworded from "single-tenant" to "per-customer / per-account isolation"
   to match the actual multi-tenant, row-level-isolated architecture. *Question:* confirm the
   new wording is accurate and non-misleading.
5. **Roam embed.** Scheduling widget embedded (AGYL `/contact`, EKOM `/analysis`); disclosed as
   a third-party processor in privacy/terms. *Question:* sufficient? Add Roam to a subprocessor
   list / DPA?

## EKOM-specific

6. **Opensend removal — retained data.** Opensend (person-level, pre-consent identification)
   has been fully removed from the site, but **person-level data it already collected may
   persist** in the CRM/Signals store. *Question:* do we have a retention/deletion or
   disclosure obligation for that previously-collected data? (Independent of the code change.)
7. **PII-handling backend endpoints** (unchanged by the PR, flagged for awareness): DSAR
   (`/api/dsar`), e-signature flows (`/api/sign-*`, `/api/countersign-*`), lead/demo forms
   (`/api/submit-demo`, `/api/gate-submit`). Confirm the privacy policy + DSAR process cover these.
8. **Nevada opt-out clause** retained in `privacy.html` — confirm still accurate under the
   revised sale/sharing framing.

## AGYL-specific

9. **Terms governing law** is unspecified ("laws applicable to AGYL AI, Inc."). *Question:*
   name the jurisdiction.
10. **Effective date** on legal pages: July 8, 2026 — confirm.

**Note:** Neither public marketing site collects PII via a form on the marketing pages
themselves (AGYL uses Roam + `mailto:`; EKOM's PII collection is via the backend functions in
item 7).
