# Website Launch System — reusable starter spec

> **Status & scope (2026-07-09):** This is a *reference specification* distilled from the
> verified AGYL + EKOM launches. It is **not** a separate repository or template yet, and one
> must **not** be created until Jonah explicitly names and authorizes a new website project.
> Until then this blueprint lives in the AGYL repo (the governance home) and is what Codex and
> Claude Code collaborate on. When authorized, the future starter implements this spec.
>
> **Reference implementations:** `agyl-website` (clean Astro static site) · `ekom-website`
> (Astro homepage + raw-HTML pages + Cloudflare Pages Functions backend).

## Target workflow (what a new launch looks like)

1. **Copy** the starter.
2. **Configure** — edit one config file (branding, ownership, domains, tracking IDs, content).
3. **Validate** — `npm test` (build + automated checks).
4. **Review disclosures** — fill/refresh `LEGAL-REVIEW.md`; get operator (and, where needed, counsel) sign-off.
5. **Preview-test** — smoke tests on the Cloudflare preview (browser + scriptable).
6. **Deploy** — follow `MERGE-DEPLOY-PLAN.md`: mark ready → merge → prod-verify.
7. **Manual cleanup** — any vendor/worker/secret teardown per the plan.

## 1. Foundation

- **Astro** (`output: 'static'`) on **Cloudflare Pages** (auto-deploy on merge to `main`; per-branch previews at `https://<deploy-id>.<project>.pages.dev`).
- Build → `dist/`; verification `npm test` = `astro build && node scripts/check-site.mjs`.
- **`.gitignore` MUST exclude `node_modules/`, `dist/`, `.astro/` from day one.** *(Lesson: EKOM had 9,844 generated files committed.)*

## 2. Configuration surface (single source of truth)

One `site.config` object drives everything the starter templates read:

- **brand** — name, wordmark, color tokens. *Pick AA-compliant secondary-text tokens up front* (see §8 lesson).
- **ownership** — operating legal entity (e.g. `AGYL AI, Inc.`), parent-vs-product relationship, any d.b.a. *(AGYL is parent/operator; EKOM is a product of AGYL — reflected in legal pages + JSON-LD.)*
- **domains** — canonical origin, `www`→apex redirect.
- **tracking IDs** — GA4 measurementId, Clarity projectId, LinkedIn partnerId, Apollo appId, internal-device query flag, consent cookie name (`<brand>_consent`).
- **contact** — info@ / hello@ / security@ addresses (keep consistent across all pages **and** `security.txt`).
- **feature flags** — `apolloPreConsent` (bool), `roamSchedulingUrl`, per-tool analytics enable.

## 3. Page templates

`home`, `contact` (Roam embed + `mailto:`), `privacy`, `terms`, `security`, `404`, plus a reusable **legal-page shell**. **Page-aware layout** injects unique `title`, `description`, `canonical`, Open Graph, Twitter, and optional `noindex` per page.

## 4. Consent + tracking

- **First-party consent banner** (no third-party CMP). Cookie `<brand>_consent`, 365d.
- **"Accept all"** → GA4 + Microsoft Clarity + LinkedIn Insight Tag. **"Essential only"** → none of them.
- **Apollo (company-level) pre-consent exception** (configurable via `apolloPreConsent`): loads *before* consent, **suppressed on the internal-device flag and on Global Privacy Control (GPC)**, disclosed plainly in the banner + privacy policy.
- **Banner copy must state exact behavior:** "Essential only" prevents GA4/Clarity/LinkedIn; Apollo stays pre-consent unless GPC or the internal flag suppresses it.
- **Rule:** any pre-consent identifier must honor GPC + internal-device and be disclosed **accurately** (never label it "consent-gated" if it fires pre-consent). **Person-level** pre-consent trackers (e.g. Opensend) are avoided by default; if ever used they require explicit legal sign-off + disclosure + a documented retention/deletion basis.

## 5. Roam scheduling

Embed on `/contact` via `https://ro.am/lobbylinks/embed.js`; the iframe `src` is the ro.am booking URL (apex). CSP must allow `https://ro.am` in **both** `script-src` and `frame-src`. **Verify the widget renders under CSP on the preview** (browser check — CI can't prove this).

## 6. CSP / security headers (`public/_headers`)

Baseline: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` + allowlist (GTM, GA, Clarity, LinkedIn, Apollo assets, ro.am, Cloudflare); `style-src 'self' 'unsafe-inline'`; `font-src 'self'` (**self-host fonts**); `img-src`; `connect-src` (+ `https://*.apollo.io` when Apollo is on); `frame-src https://ro.am` (+ Turnstile if used); `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`. Plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` (HSTS). *(`'unsafe-inline'` in `script-src` stays until inline scripts move to nonces/hashes — deferred hardening item.)*

## 7. SEO / metadata

Per-page unique title/description/canonical/OG/Twitter. `sitemap.xml` (exclude `noindex` pages; keep `lastmod` current). `robots.txt`. **JSON-LD**: Organization with a stable `@id` (`<origin>/#org`) + WebSite (`publisher` → `@id`) + optional FAQPage / SoftwareApplication (`publisher` → `@id`) — **link entities via `@id`** so brand + legal entity aren't separate unlinked orgs. **Self-host fonts** (no Google Fonts CDN — render-blocking). Favicon/PWA block on **every** page (root paths; manifest references only files that exist).

## 8. Automated checks (`scripts/check-site.mjs`, run by `npm test`)

- Required routes exist in `dist/`.
- Canonical present per page.
- `consent.js` contains the Apollo/GPC suppression gates.
- `_headers` contains the required CSP origins.
- **No generated artifacts tracked** (`git ls-files` shows no `node_modules/`,`dist/`,`.astro/`).
- **Disclosure consistency** — privacy-policy wording matches actual `consent.js` behavior (no "consent-gated" claim for a pre-consent tracker; no phantom tools like a Meta Pixel that isn't loaded).
- **No broken/encoded pages** — every built page is real HTML (not base64/placeholder).
- *(Contrast is verified by direct WCAG computation, never a tool's alpha-over-dark guess — see §10.)*

## 9. Governance / records (templates in `docs/`)

- **`DECISIONS.md`** — product/ownership/tracking decisions + change discipline.
- **`WEBSITE-PLATFORM.md`** — scope boundaries (marketing site only; product/app lives elsewhere).
- **`LEGAL-REVIEW.md`** — scoped review checklist + a **sign-off record** stating who approved and whether outside counsel reviewed (never imply counsel approval when it was operator sign-off).
- **`MERGE-DEPLOY-PLAN.md`** — preview smoke tests, merge order, prod verification, manual cleanup, rollback.

## 10. Preview / deploy / rollback / cleanup checklists

- **Preview smoke:** *browser* (Roam renders under CSP; GPC blocks Apollo; "Accept all" vs "Essential only" behavior) **+** *scriptable* (headers, routes, JSON-LD validity, any API rejects unauthenticated requests non-mutatingly).
- **Deploy:** mark ready → merge → auto-deploy → **prod verify** (`curl -I` headers/routes/JSON-LD + a browser pass for Apollo-without-GPC and Turnstile on the real domain).
- **Rollback:** Cloudflare per-deployment rollback, or `git revert` the merge.
- **Manual cleanup:** retire decommissioned workers/routes/secrets — **only the intended vendor's** (never sibling secrets); cancel vendor accounts; scrub vendor-sourced data.

## 11. Lessons learned (hard-won — bake these into the starter)

1. **Gitignore generated artifacts from day one** (`node_modules/`, `dist/`, `.astro/`).
2. **Compute WCAG contrast directly; don't trust audit tools** — they mis-model alpha-over-dark (AGYL's "failing" `--faint` was actually 6.3:1). Only touch surfaces that genuinely fail.
3. **Any pre-consent tracker** needs GPC + internal-device suppression + accurate disclosure; **person-level** pre-consent needs legal sign-off.
4. **Removing a vendor is a full sweep:** frontend loader + banner + privacy disclosure + CSP origins + backend functions/workers + secrets + vendor account + retained data.
5. **Secret hygiene:** touch only the target vendor's secrets — never siblings (Apollo survived the Opensend teardown because only `OPENSEND_*` was removed).
6. **Token duplication across raw-HTML pages:** change the token *definition* per file (or centralize); a fix isn't done until it's in every page (and the SVG/hardcoded copies too).
7. **A base64-encoded page copied verbatim serves as garbage** — validate rendered output, not just HTTP 200.
8. **Compliance wording:** SOC 2 is *attested/audited*, not "certified"; CCPA "sell/share" has nuance; GPC opt-out applies only to what actually fires pre-consent; state plainly when counsel has *not* reviewed.
9. **Preview smoke tests catch what CI can't** — Roam rendering under CSP, Turnstile domain-allowlist errors on `*.pages.dev` previews.
10. **Build/review split works:** one agent builds, an independent reviewer (Codex) validates — it caught artifact bloat, a CSP gap, and over-broad "do not sell" language across the AGYL/EKOM launches.

---

*When Jonah authorizes a new website project, the starter repo implements the above; this doc is the acceptance checklist for that starter.*
