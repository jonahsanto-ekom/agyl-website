# AGYL website decisions

This file records product and operating decisions that affect the public website.

## Current decisions

- **Scope:** This repository covers the public AGYL marketing website. The client experience lives at a separate destination and is linked from the marketing site.
- **Company relationship:** AGYL is the parent company and the operator named in AGYL website policies. EKOM is an AGYL product, not the operator of AGYL.
- **Apollo:** Company-level Apollo identification loads before optional cookie consent. It must be disclosed plainly, disabled for internal devices, and suppressed when Global Privacy Control is enabled.
- **Optional analytics:** GA4, Microsoft Clarity, and LinkedIn load only after “Accept all.”
- **Roam:** The scheduling experience remains embedded on `/contact`. Its third-party processing must be disclosed.
- **Fonts:** Website fonts are bundled through Fontsource and served from the AGYL origin so the Cloudflare content-security policy can remain self-hosted.
- **Legal review:** Repository policy text is an operational draft and should receive legal review before being treated as legal advice.

## Change discipline

Any change to analytics timing, vendor IDs, legal-entity wording, third-party embeds, or cross-site CRM attribution must update this document, the privacy policy, and the relevant automated checks in the same pull request.

## Validation council

Before this branch is merged or deployed, validate it from these review lanes:

1. **Business owner:** Confirms AGYL is described correctly as the parent company/operator and that EKOM references remain product-level, not operator-level.
2. **Privacy/legal:** Reviews the Privacy Policy, Website Terms, Apollo pre-consent disclosure, Roam embed disclosure, and Global Privacy Control treatment. Repository text is a draft until this review is complete.
3. **Security/trust:** Confirms the public Security and Trust page accurately reflects current controls without overstating certification, compliance status, or deployment guarantees.
4. **Growth/revenue operations:** Confirms Apollo, GA4, Microsoft Clarity, LinkedIn, Roam, and future CRM attribution expectations match the intended visitor journey.
5. **Technical owner:** Runs `npm test`, verifies Cloudflare Pages settings after deployment, and confirms required routes, canonical URLs, CSP headers, and consent behavior work in production.

Claude or another reviewer can use this council as the PR review checklist. If any lane rejects a decision, pause deployment and update this file alongside the affected page or script.
