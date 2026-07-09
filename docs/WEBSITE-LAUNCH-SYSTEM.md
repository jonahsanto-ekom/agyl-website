# Website Launch System — reusable starter spec

> **Status & scope (2026-07-09):** A *reference specification* distilled from the verified
> AGYL + EKOM launches. It is **not** a separate repository or template yet, and one must **not**
> be created until Jonah explicitly names and authorizes a new website project. Until then this
> blueprint lives in the AGYL repo (governance home) and is what Codex and Claude Code
> collaborate on. When authorized, the future starter implements this spec.
>
> **Architecture decision:** the starter **standardizes on Astro components/templates** (one
> layout + shared components, config-driven). `agyl-website` is the reference architecture.
> **`ekom-website`'s raw-HTML page duplication (per-page inline `<style>`/token copies) is a
> migration lesson and reference — NOT architecture to copy.** Everything is a component or
> template so a value/token is defined once.
>
> **Reference implementations:** `agyl-website` (clean Astro — the model) · `ekom-website`
> (Astro homepage + legacy raw-HTML pages + Cloudflare Pages Functions — migration reference).

## Target workflow (what a new launch looks like)

1. **Copy** the starter.
2. **Configure** — edit one config file (branding, ownership, domains, integration inventory, content).
3. **Validate** — `npm test` (config-schema validation + build + automated checks).
4. **Review disclosures** — fill/refresh `LEGAL-REVIEW.md`; get operator (and, where needed, counsel) sign-off.
5. **Preview-test** — smoke tests on the Cloudflare preview (browser + scriptable; consent matrix).
6. **Deploy** — follow `MERGE-DEPLOY-PLAN.md`: mark ready → merge → prod-verify.
7. **Manual cleanup** — any vendor/worker/secret teardown per the plan.

## 1. Foundation

- **Astro** (`output: 'static'`) on **Cloudflare Pages** (auto-deploy on merge to `main`; per-branch previews). Standardized components/templates — no per-page style/token duplication.
- Build → `dist/`; verification `npm test` = config validation + `astro build` + `node scripts/check-site.mjs`.
- **`.gitignore` MUST exclude `node_modules/`, `dist/`, `.astro/` from day one.**

## 2. Configuration surface (single source of truth)

One typed `site.config` object drives every template, the CSP, disclosures, checks, and cleanup.

### 2a. Public identifiers vs. secrets (hard separation)
- **Public identifiers** (safe in config / shipped to the client): GA4 measurementId, Clarity projectId, LinkedIn partnerId, Apollo appId, Cloudflare Web Analytics token, canonical domain, contact addresses.
- **Secrets / environment bindings** (NEVER in `site.config` or client code — Cloudflare env only): webhook keys, API keys, service-account JSON (e.g. `APOLLO_WEBHOOK_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`). The config schema references these by *name*, never value.

### 2b. Config fields
- **brand** — name, wordmark, color tokens (choose AA-compliant secondary-text tokens up front — see §11).
- **ownership** — operating legal entity, parent-vs-product relationship, d.b.a.
- **domains** — canonical origin, `www`→apex redirect.
- **content** — page copy blocks.
- **integrationInventory** — see §2d.
- **compliance claims** — SOC 2 / DPA / certifications: each must be explicitly confirmed *for this entity* (see §2c).

### 2c. Config schema validation (`npm test` fails the build on any of these)
- Malformed **domain**, **email**, or vendor **ID** formats.
- **Impossible feature combinations** (e.g. Apollo `mode: preConsent` while Apollo is disabled; analytics enabled with no consent banner; `postConsent` identification with no consent flow).
- **Unresolved placeholders** (`__GA_ID__`, `TODO`, `example.com`, `AGYL AI, Inc.` copied into a different site, etc.).
- **Unconfirmed copied legal / entity / compliance claims** — any SOC 2 / DPA / "certified" / entity-name string not explicitly marked confirmed-for-this-site fails validation (prevents pasting another company's claims).

### 2d. Integration inventory (the one place vendors are declared)
A single `integrations[]` array is the authority. Each entry: `{ id, enabled, managedBy, type, publicId, cspOrigins[], scripts[], loadTiming, disclosureKey, previewChecks[], cleanupTasks[] }`, where **`managedBy: 'repo' | 'dashboard'`**. **Enabling a vendor here — and only here — drives:**
1. **Script loading** (which scripts load, and when),
2. **CSP origins** (the `_headers` allowlist is generated from `cspOrigins`),
3. **Disclosure text + disclosure checks** (privacy/banner copy keyed off `disclosureKey`),
4. **Preview smoke tests** (each enabled vendor contributes its `previewChecks`),
5. **Cleanup tasks** (teardown checklist generated from enabled vendors).

Supported integration types: **analytics** (GA4, Microsoft Clarity, LinkedIn Insight Tag, **Cloudflare Web Analytics / dashboard injection**), **identification** (Apollo — see §4), **scheduling** (Roam), **consent** (first-party banner), **bot** (Turnstile). No vendor may be wired anywhere except through this inventory (prevents drift between scripts, CSP, disclosures, and cleanup).

**repo-managed vs dashboard-managed:** `repo`-managed integrations are injected by the repository's own code — the config directly controls loading. `dashboard`-managed integrations may be injected *outside* the repo — e.g. **Cloudflare Web Analytics can be auto-injected via the Cloudflare Pages dashboard** — so the config only **records the expected state** and cannot directly control it. For every `dashboard`-managed integration, preview **and** production smoke tests must **reconcile config against observed scripts/network requests**: the declared expected state must match what the deployed page actually loads (catches both missing-but-expected and present-but-undeclared injections).

## 3. Page templates (Astro components)

`home`, `contact` (Roam embed + `mailto:`), `privacy`, `terms`, `security`, `404` + a reusable **legal-page shell**. **Page-aware layout** injects unique `title`, `description`, `canonical`, OG, Twitter, and `noindex` per page. One `<main id="main-content">`, one `<h1>` per page, skip link, semantic landmarks (see §11).

## 4. Consent + identification

- **First-party consent banner** (no third-party CMP). Cookie `<brand>_consent`, 365d. "Accept all" → all enabled **analytics** integrations. "Essential only" → none.
- **Apollo identification `mode`** (replaces the old boolean): `disabled` | `preConsent` | `postConsent`.
  - `disabled` — never loads.
  - `preConsent` — loads before consent (company-level), **suppressed on internal-device flag and GPC**, disclosed in banner + privacy.
  - `postConsent` — loads only after "Accept all", like the analytics tools.
- **Cloudflare Web Analytics** (integration) — cookieless; document whether it is consent-gated (it is privacy-friendly/cookieless, so may run without consent — record the decision).
- Banner copy must state exact behavior for the active config.

### 4a. Consent behavior matrix (documented AND tested — §8)
Matrix is for the analytics tools + Apollo in **`mode: preConsent`** (the AGYL/EKOM shipped behavior). **Key fact: in `preConsent`, the cookie choice never gates Apollo — only GPC and the internal-device flag suppress it.** The banner always follows normal cookie state.

| Scenario | Analytics (GA4/Clarity/LinkedIn) | Apollo (preConsent) | Banner |
|---|---|---|---|
| First visit (no cookie) | not loaded until choice | loads (unless GPC/internal) | shown |
| Returning — "all" | loaded | loads (unless GPC/internal) | hidden |
| Returning — "essential" | not loaded | loads (unless GPC/internal) | hidden |
| GPC signal on | still require "all"; document | **suppressed** | follows cookie state (shown if none) |
| Internal-device flag | **suppressed** | **suppressed** | **follows normal cookie state — NOT suppressed** |
| Reopened settings + change choice | reloads per new choice | **unchanged — cookie choice does not gate preConsent Apollo** | shown, then hides on choice |
| Consent revocation (all→essential / cleared) | no new loads; already-loaded persist until reload, don't reload after | **unchanged (loads unless GPC/internal)** | shown if cleared |

**Behavior note (accuracy):** AGYL/EKOM do **not** suppress the banner on internal devices — the internal flag suppresses the *trackers* (Apollo + analytics) only, while the banner still follows cookie state. Hiding the banner on internal devices is an **explicit future starter improvement**, not current behavior; do not spec it as shipped.

**Test expectations per Apollo `mode` (all three required):**
- **`disabled`** — `assets.apollo.io` is never requested in any scenario.
- **`preConsent`** — requested on first visit and on every return regardless of cookie choice; suppressed **only** by GPC or the internal-device flag; unaffected by reopening settings or revoking consent.
- **`postConsent`** — requested **only** after "Accept all" (like analytics); not before a choice, not on "essential"; also suppressed by GPC/internal.

Each row + each mode is a required preview/automated test case.

## 5. Roam scheduling

Embed on `/contact` via `https://ro.am/lobbylinks/embed.js`; iframe `src` = the ro.am booking URL (apex). CSP allows `https://ro.am` in `script-src` + `frame-src` (from the integration inventory). Verify the widget renders under CSP on the preview (browser check).

## 6. CSP / security headers (`public/_headers`, generated from the integration inventory)

Baseline: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` + inventory origins; `style-src 'self' 'unsafe-inline'`; `font-src 'self'` (self-host fonts); `img-src`; `connect-src` + inventory origins; `frame-src` (Roam/Turnstile if enabled); `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`. Plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.

### 6a. HSTS — qualified (do NOT copy AGYL/EKOM's aggressive value blindly)
A **new** site starts with `Strict-Transport-Security: max-age=<short>` **only** — **no `includeSubDomains`, no `preload`** by default.
- `includeSubDomains` requires **verified HTTPS on every subdomain** first (it will break any HTTP-only subdomain).
- `preload` is a **separate, explicitly recorded decision** (hard to reverse; requires submission to the preload list). Record it in `DECISIONS.md` before enabling.

*(`'unsafe-inline'` in `script-src` stays until inline scripts move to nonces/hashes — deferred hardening item.)*

## 7. SEO / metadata

Per-page unique title/description/canonical/OG/Twitter. `sitemap.xml` (exclude `noindex` pages; current `lastmod`). `robots.txt`. **JSON-LD**: Organization with stable `@id` (`<origin>/#org`), WebSite + any SoftwareApplication/FAQPage all referencing it via `publisher: {@id}` — entity-linked, no unlinked orgs. **Self-host fonts** (no Google Fonts CDN). Favicon/PWA block on every page (root paths; manifest references only existing files).

## 8. Automated checks (`scripts/check-site.mjs`, run by `npm test`)

Recursively inspect **every built HTML page** in `dist/` and assert:
- **Exactly one `<h1>`** per page (unless the page is explicitly exempted in config) and logical heading order.
- **JSON-LD parses** and `@id` entity links resolve (Organization `#org` referenced as publisher by WebSite/others).
- **All manifest + favicon assets referenced actually exist** on disk.
- **No Google Fonts** references and **no unexpected third-party scripts** — every external script origin must be declared in the integration inventory.
- **Integrations ⇄ CSP ⇄ disclosures ⇄ smoke tests agree** — every enabled vendor has its CSP origins, disclosure text, and preview checks; nothing enabled is undisclosed; nothing disclosed is disabled.
- **Preview deployments are `noindex`** (preview builds must carry a robots noindex so `*.pages.dev` previews aren't indexed).
- **Consent behavior matrix** (§4a) is exercised (headless/consent-state simulation of the 7 scenarios).
- **Reject encoded/placeholder/unresolved pages** — no base64-encoded HTML, no `TODO`/placeholder/unresolved-template markers in shipped pages.
- Required routes exist; canonical present per page.
- **No generated artifacts tracked** in git (`node_modules/`, `dist/`, `.astro/`).
- Config-schema validation (§2c) passes.
- *(Contrast is verified by direct WCAG computation, never a tool's alpha-over-dark estimate — see §11.)*

## 9. Accessibility acceptance (required before approval)

- **One `<h1>`** per page; logical, unskipped heading hierarchy.
- **Semantic landmarks** (`header`/`nav`/`main`/`footer`) + a working **skip link** to `#main-content`.
- **Keyboard navigation**: all interactive elements reachable/operable, logical order, no traps; **visible `:focus-visible`** styling.
- **Accessible consent banner**: must have an accessible name/description, keyboard-operable real `<button>`s, appropriate announcement, and **tested focus behavior**. Implement as a **named region** (`role="region"` + label) **or** a **non-modal dialog**, chosen to match the actual behavior (a `role="dialog"` implies focus management/trap; a persistent bar is better as a labeled region). Do **not** universally prescribe one — pick per implementation and verify it.
- **Forms**: programmatic label association, `aria-required` + visible required markers, accessible error messaging.
- **Images/SVGs**: `alt`/accessible names for meaningful graphics; `aria-hidden` for decorative; data-viz SVGs carry a `<title>` or text equivalent.
- **Reduced motion**: honor `prefers-reduced-motion` in CSS and JS.
- **Contrast — computed, AA (4.5:1 text / 3:1 large & UI)** across **all** surfaces: color **tokens**, **hard-coded** colors, **SVG text fills**, and **dark footers** (white-on-navy at reduced opacity is the classic miss). Verify by direct computation.

## 10. Performance budgets (lightweight, reviewed each launch)

- **Fonts**: self-hosted, subset, `font-display: swap`, preload only the critical face; cap total font weight (target ≤ ~100 KB).
- **JavaScript**: minimal; no render-blocking third-party in `<head>`; consent/analytics loaded async/deferred; cap initial JS.
- **Images**: correctly sized, `width`/`height` set, `loading="lazy"` below the fold, modern formats; cap hero/OG image weight.
- **Lighthouse / Core Web Vitals review**: targets LCP < 2.5s, CLS < 0.1, INP < 200ms; Lighthouse Accessibility & SEO ≥ 90. Run on the preview (browser) as part of smoke testing.

## 11. Governance / records (templates in `docs/`)

`DECISIONS.md` (incl. the HSTS preload decision), `WEBSITE-PLATFORM.md`, `LEGAL-REVIEW.md` (sign-off record; state clearly if counsel has not reviewed), `MERGE-DEPLOY-PLAN.md`.

## 12. Generated assets

`sitemap.xml`, `robots.txt`, favicon set + `site.webmanifest` (referencing existing files only), **`/.well-known/security.txt`** — RFC 9116 fields: `Contact` (required), `Expires` (a future date; required), preferably `Canonical`, optionally `Policy` — and OG image.

## 13. Preview / deploy / rollback / cleanup checklists

- **Preview smoke:** browser (Roam under CSP; consent behavior matrix incl. GPC/internal + all Apollo modes; Lighthouse/CWV) + scriptable (headers, routes, JSON-LD, non-mutating API checks); **reconcile dashboard-managed integrations — observed scripts/network requests vs config**. Preview is `noindex`.
- **Deploy:** mark ready → merge → auto-deploy → prod verify (headers/routes/JSON-LD + browser Apollo-without-GPC / Turnstile on the real domain).
- **Rollback:** Cloudflare per-deployment rollback, or `git revert` the merge.
- **Cleanup:** teardown tasks generated from the integration inventory — retire only the intended vendor's workers/routes/secrets (never siblings); cancel vendor accounts; scrub vendor-sourced data.

## 14. Lessons learned (bake into the starter)

1. Gitignore generated artifacts from day one.
2. Compute WCAG contrast directly; audit tools mis-model alpha-over-dark.
3. Any pre-consent identifier: GPC + internal suppression + accurate disclosure; person-level needs legal sign-off.
4. Removing a vendor is a full sweep: loader + banner + disclosure + CSP + backend + secrets + vendor account + retained data — all driven by the integration inventory.
5. Secret hygiene: touch only the target vendor's secrets, never siblings.
6. Components/templates over per-page duplication — a value is defined once (EKOM raw-HTML is the anti-pattern/migration reference).
7. A base64/placeholder page copied verbatim ships as garbage — validate rendered output.
8. Compliance wording: SOC 2 is *attested*, not "certified"; CCPA "sell/share" nuance; state when counsel has not reviewed; never paste another entity's claims (config validation enforces).
9. Preview smoke tests catch what CI can't (Roam under CSP; Turnstile domain-allowlist on `*.pages.dev`).
10. Build/review split (Claude Code builds, Codex reviews) catches artifact bloat, CSP gaps, and over-broad legal copy.

---

*When Jonah authorizes a new website project, the starter repo implements the above; this doc is the acceptance checklist for that starter.*
