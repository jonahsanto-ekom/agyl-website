# Merge & Deployment Plan — AGYL PR #3 / EKOM PR #3

> Governance doc for the AGYL/EKOM website workstream. Created 2026-07-08.
> Hand this to Codex for a final pre-merge check, then execute step-by-step.
> Both sites are Cloudflare Pages (auto-deploy on merge to `main`).
> Do AGYL first (simpler, no backend), then EKOM.

## Preconditions (all must be true before starting)

- [ ] Legal review complete and approved for both sites (see `LEGAL-REVIEW.md`).
- [ ] Codex final pre-merge check on this plan.
- [ ] Both PRs still show a green Cloudflare Pages check.

## Step 1 — AGYL preview smoke-test (before merging)

On the Cloudflare Pages **preview** deploy for `codex/agyl-website-foundation`:

- [ ] **Roam widget** renders and is interactive on `/contact`; browser console shows
      **no CSP violations** (the one thing automated tests can't prove).
- [ ] Consent: with a GPC browser extension on, Apollo does **not** load (no `assets.apollo.io`
      in the Network tab). "Accept all" loads GA4/Clarity/LinkedIn; "Essential only" loads none.
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
- [ ] Consent: "Accept all" loads GA4/Clarity/LinkedIn; "Essential only" loads none.
- [ ] `/api/opensend-webhook` returns 404 (function deleted); `/api/identify` still works
      (the Apollo path).
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
