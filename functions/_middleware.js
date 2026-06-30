// Cloudflare Pages global middleware — runs on every agyl.ai request at the edge.
// Injects Opensend person-level visitor identification into HTML pages.
// Jonah decision 2026-06-30: fires for all visitors, NOT consent-gated,
// except internal-flagged devices and Global Privacy Control opt-outs.
// Pixel: cdn.aggle.net (oirtyp 6311ae17, oirid P4MC46L22).
// Site field auto-populated as 'agyl.ai' by the Opensend SDK.
// Identified visitors route to EKOM CRM via the opensend-webhook Pages Function.

const OPENSEND_SCRIPT = `<!-- Opensend person-level visitor identification (Jonah decision 2026-06-30).
     Fires for all agyl.ai visitors — NOT consent-gated — except internal-flagged
     devices and Global Privacy Control opt-outs. SDK: cdn.aggle.net
     (oirtyp 6311ae17, oirid P4MC46L22). Site auto-detected as agyl.ai by SDK.
     Internal flag: agyl.ai/?agyl-internal=1 sets; ?agyl-internal=0 clears. -->
<script>
(function() {
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get('agyl-internal') === '1') { localStorage.setItem('agyl_internal', '1'); }
    if (qs.get('agyl-internal') === '0') { localStorage.removeItem('agyl_internal'); }
    if (qs.has('agyl-internal')) {
      qs.delete('agyl-internal');
      try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs.toString() : '') + location.hash); } catch(e2) {}
    }
  } catch(e) {}
  function isInternal() { try { return localStorage.getItem('agyl_internal') === '1'; } catch(e) { return false; } }
  function gpcOptOut() { try { return navigator.globalPrivacyControl === true; } catch(e) { return false; } }
  if (isInternal() || gpcOptOut()) return;
  window._oirtrk = window._oirtrk || [];
  try {
    var o = document.createElement('script'), u = document.getElementsByTagName('script')[0];
    o.src = 'https://cdn.aggle.net/oir/oir.min.js';
    o.async = true;
    o.setAttribute('oirtyp', '6311ae17');
    o.setAttribute('oirid', 'P4MC46L22');
    u.parentNode.insertBefore(o, u);
  } catch(e) {}
})();
<\/script>`;

export async function onRequest(context) {
  const response = await context.next();

  // Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const html = await response.text();

  // Skip if </head> not found (safety)
  if (!html.includes('</head>')) {
    return new Response(html, response);
  }

  const modified = html.replace('</head>', OPENSEND_SCRIPT + '\n</head>');

  const headers = new Headers(response.headers);
  headers.delete('content-length'); // Length changes after injection

  return new Response(modified, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
