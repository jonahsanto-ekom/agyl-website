# AGYL website platform

## Purpose

The AGYL site is a static Astro marketing site deployed through Cloudflare Pages. It explains the company, captures interest, and links visitors to separately operated client experiences. It should not grow into a second application platform.

## Platform responsibilities

- brand presentation and editorial content;
- navigation, contact, legal, security, and error routes;
- page-specific titles, descriptions, canonical URLs, social metadata, and structured data;
- consent state and third-party analytics loading;
- Cloudflare security and cache headers;
- links into external scheduling and client experiences;
- build-time verification of required public routes and controls.

## Boundaries

- Product and client application behavior belongs outside this repository.
- EKOM-specific application behavior belongs in `ekom-os`.
- Shared CRM ingestion currently belongs to EKOM’s existing Cloudflare function layer until a deliberate cross-brand service boundary replaces it.
- Secrets and Cloudflare environment bindings must never be committed.

## Reuse model

AGYL is the pilot for a configuration-driven website pattern. Once this implementation is verified, reusable pieces can be extracted for EKOM:

1. page-aware layout metadata;
2. legal-page shell;
3. consent and analytics loader contract;
4. Cloudflare header baseline;
5. required-route and configuration checks.

Brand content, analytics IDs, domains, legal text, and product-specific pages remain explicit per site. Reuse must not blur ownership or silently copy disclosures between AGYL and EKOM.

## Deployment contract

- Build command: `npm run build`
- Output directory: `dist`
- Verification command: `npm test`
- Canonical origin: `https://agyl.ai`
- `www.agyl.ai` redirects permanently to the canonical origin.

Cloudflare Pages settings, DNS, environment bindings, deployed response headers, and analytics network requests must be verified after deployment; repository checks cannot prove dashboard state.
