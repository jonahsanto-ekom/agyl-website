# Merge & Deployment Plan — AGYL PR #3 / EKOM PR #3

> Governance doc for the AGYL/EKOM website workstream. Created 2026-07-08.
> Hand this to Codex for a final pre-merge check, then execute step-by-step.
> Both sites are Cloudflare Pages (auto-deploy on merge to `main`).
> Do AGYL first (simpler, no backend), then EKOM.

## Preconditions (all must be true before starting)

- [x] Privacy/legal lane **approved by operator** (Jonah, 2026-07-08); outside counsel has **not** reviewed — see `LEGAL-REVIEW.md`.
- [ ] Codex final pre-merge check on this plan.
- [ ] Both PRs still show a green Cloudflare Pages check.

## Step 1 — AGYL preview smoke-test (before merging)

On the Cloudflare Pages **preview** deploy for `codex/agyl-website-foundation`:

- [ ] **Roam widget** renders and is interactive on `/contact`; browser console shows
      **no CSP violations** (the one thing automated tests can't prove).
- [ ] Consent: "Accept all" loads GA4, Microsoft Clarity, and LinkedIn. "Essential only" prevents
      GA4, Microsoft Clarity, and LinkedIn from loading. Apollo remains pre-consent and still loads
      unless GPC (test with a browser GPC extension → no `assets.apollo.io` request) or the
      internal-device flag (`?agyl-internal=1`) suppresses it.
- [ ] `/privacy`, `/terms`, `/security`, `/404` render; canonical URLs correct.

## Step 2 — Merge AGYL PR #3

- [ ] Mark PR ready for review → merge to `main`.
- [ ] Cloudflare auto-deploys `agyl.ai`. Verify prod: `curl -I https://agyl.ai` shows CSP + HSTS
      headers; pages load; `www.agyl.ai` 301s to apex; sitemap/robots OK.

## Step 3 — EKOM preview smoke-test (before merging)

On the preview deploy for `fix/consent-privacy-accuracy`:

- [ ] **GPC test:** with GPC on, Apollo does **not** load; with GPC off, it does. Internal flag
      `?ekom-internal=1` suppresses it.
- [ ] **No Opensend:** zero requests to `cdn.aggle.net` anywhere on the site.
- [ ] Consent: "Accept all" loads GA4, Microsoft Clarity, and LinkedIn. "Essential only" prevents
      GA4, Microsoft Clarity, and LinkedIn from loading. Apollo remains pre-consent and still loads
      unless GPC or the internal-device flag (`?ekom-internal=1`) suppresses it.
- [ ] `/api/opensend-webhook` returns 404 (function deleted). `/api/identify` is reachable but
      **non-mutating test only**: send an unauthenticated POST (no valid `X-Ekom-Key` header) and
      confirm it returns **401 Unauthorized** (or **500** if the preview env intentionally lacks
      `APOLLO_WEBHOOK_SECRET`). Do **not** send a valid Apollo webhook or create a CRM signal
      during smoke testing.
- [ ] `/privacy` + `/security` show the updated wording; chat widget works; `/404` renders.

## Step 4 — Merge EKOM PR #3

- [ ] Mark ready → merge to `main`. Cloudflare auto-deploys `ekom.ai`.
- [ ] Verify prod: `curl -I https://ekom.ai` → CSP `connect-src` includes `*.apollo.io`,
      **no** `aggle.net`; pages + functions healthy.

## Step 5 — Manual cleanup (AFTER EKOM prod deploy is confirmed)

- [ ] Cloudflare dashboard: delete the deployed **`ekom-identify` Worker** and its
      `ekom.ai/identify*` route.
- [ ] Remove Opensend secrets: `OPENSEND_WEBHOOK_KEY` (Pages Function env) and
      `OPENSEND_SECRET` (worker).
- [ ] **Opensend account:** disable/cancel the pixel + account so it stops sending webhooks.
- [ ] Data: action any retained person-level Opensend data per `LEGAL-REVIEW.md` (item 6).
- [ ] Follow-up PR: delete the unused root `consent.js` duplicate (EKOM).

## Rollback

- Cloudflare Pages keeps every deployment — roll back to the prior deployment in the dashboard
  if anything breaks.
- Git: revert the merge commit; Pages redeploys the previous state.
