/* AGYL first-party cookie consent — no third-party tool.
   Stores choice in agyl_consent cookie (365d). GA4 (G-HP9WD0TYLB),
   Microsoft Clarity, and the LinkedIn Insight Tag (partner 9648988) load ONLY
   after "Accept all". window.gtag is always stubbed so page calls queue safely
   either way. LinkedIn is consent-gated to mirror ekom.ai and because the
   Insight Tag sets advertising cookies.
   Apollo performs company-level visitor identification before consent as an
   approved business-interest exception. It is suppressed for internal devices
   and browsers that send a Global Privacy Control opt-out signal.
   RB2B (reb2b) PERSON-LEVEL visitor de-anonymization (key DNXY8HDE28O0) fires
   PRE-consent for all visitors — the SAME workspace key as ekom.ai (unified
   visitor intelligence) — suppressed on internal-flagged devices and Global
   Privacy Control (no verification bypass). Person-level via a third-party
   identity chain (LiveIntent, ip-api, usbrowserspeed); loader origin
   ddwl4m2hdecbv.cloudfront.net (see CSP script-src in public/_headers).
   Internal device flag: agyl.ai/?agyl-internal=1 disables all analytics on this browser. */
(function () {
  // Internal-traffic device flag
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.get('agyl-internal') === '1') { localStorage.setItem('agyl_internal', '1'); }
    if (qs.get('agyl-internal') === '0') { localStorage.removeItem('agyl_internal'); }
    if (qs.has('agyl-internal')) {
      qs.delete('agyl-internal');
      try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs.toString() : '') + location.hash); } catch (e2) {}
    }
  } catch (e) {}
  function isInternal() { try { return localStorage.getItem('agyl_internal') === '1'; } catch (e) { return false; } }

  var NAME = 'agyl_consent';
  var GA_ID = 'G-HP9WD0TYLB';
  var CLARITY_ID = 'xb4mkyp6nv';
  var LI_PARTNER_ID = '9648988'; // AGYL LinkedIn Campaign Manager 548962434 (separate from EKOM)

  function getConsent() {
    var m = document.cookie.match(/(?:^|; )agyl_consent=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setConsent(v) {
    var d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = NAME + '=' + encodeURIComponent(v) +
      '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  // gtag stub — queues calls before GA4 loads
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Consented analytics event helper
  window.agylTrack = function (name, params) {
    try { if (window.__agylGaLoaded && window.gtag) window.gtag('event', name, params || {}); } catch (e) {}
  };

  function loadGA() {
    if (window.__agylGaLoaded) return;
    window.__agylGaLoaded = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true, allow_google_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function loadClarity() {
    if (window.__agylClarityLoaded) return;
    if (CLARITY_ID === '__CLARITY_ID__') return; // placeholder not yet set
    window.__agylClarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  // LinkedIn Insight Tag — consent-gated (mirrors ekom.ai; sets advertising cookies).
  function loadLinkedIn() {
    if (window.__agylLiLoaded) return;
    window.__agylLiLoaded = true;
    window._linkedin_partner_id = LI_PARTNER_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LI_PARTNER_ID);
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(s);
  }

  function gpcOptOut() {
    try { return navigator.globalPrivacyControl === true; } catch (e) { return false; }
  }

  // Approved pre-consent exception: company-level identification only.
  function loadApollo() {
    if (window.__agylApolloLoaded || isInternal() || gpcOptOut()) return;
    window.__agylApolloLoaded = true;
    try {
      var nonce = Math.random().toString(36).substring(7);
      var s = document.createElement('script');
      s.src = 'https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=' + nonce;
      s.async = true;
      s.defer = true;
      s.onload = function () {
        try {
          if (window.trackingFunctions && window.trackingFunctions.onLoad) {
            window.trackingFunctions.onLoad({ appId: '67c0e4acb24ed0001d82a4fa' });
          }
        } catch (e) {}
      };
      document.head.appendChild(s);
    } catch (e) {}
  }

  // RB2B (reb2b) — PERSON-LEVEL visitor de-anonymization (key DNXY8HDE28O0, shared
  // with ekom.ai for unified visitor intelligence). Fires PRE-consent (called from
  // init(), like Apollo), suppressed on internal-flagged devices and Global Privacy
  // Control (the guards below). No verification bypass.
  function loadReb2b() {
    if (window.__agylReb2bLoaded) return;
    if (isInternal()) return;
    if (gpcOptOut()) return;
    window.__agylReb2bLoaded = true;
    try {
      (function (key) {
        if (window.reb2b) return;
        window.reb2b = { loaded: true };
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://ddwl4m2hdecbv.cloudfront.net/b/' + key + '/' + key + '.js.gz';
        var f = document.getElementsByTagName('script')[0];
        f.parentNode.insertBefore(s, f);
      })('DNXY8HDE28O0');
    } catch (e) { /* best-effort */ }
  }

  function loadOnConsent() {
    if (isInternal()) return;
    loadGA();
    loadClarity();
    loadLinkedIn();
  }

  var STYLES = '#agyl-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1a2e2b;color:#fff;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;box-shadow:0 -4px 24px rgba(0,0,0,.18)}#agyl-consent .akc-inner{max-width:1080px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}#agyl-consent p{margin:0;flex:1 1 380px;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.85);letter-spacing:-.005em}#agyl-consent a{color:#fff;text-decoration:underline;text-underline-offset:2px}#agyl-consent .akc-actions{display:flex;gap:10px;flex:0 0 auto}#agyl-consent button{font-family:inherit;font-size:13.5px;font-weight:600;letter-spacing:-.005em;border-radius:6px;padding:10px 18px;cursor:pointer;transition:opacity .15s ease}#agyl-consent .akc-accept{background:#4A7C6F;color:#fff;border:1px solid #4A7C6F}#agyl-consent .akc-accept:hover{opacity:.88}#agyl-consent .akc-essential{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4)}#agyl-consent .akc-essential:hover{border-color:#fff}@media(max-width:560px){#agyl-consent .akc-inner{padding:16px}#agyl-consent .akc-actions{width:100%}#agyl-consent button{flex:1}}';

  function removeBanner() {
    var el = document.getElementById('agyl-consent');
    if (el) el.remove();
  }

  function showBanner() {
    if (document.getElementById('agyl-consent')) return;
    if (!document.getElementById('agyl-consent-styles')) {
      var st = document.createElement('style');
      st.id = 'agyl-consent-styles';
      st.textContent = STYLES;
      document.head.appendChild(st);
    }
    var div = document.createElement('div');
    div.id = 'agyl-consent';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Cookie consent');
    div.innerHTML =
      '<div class="akc-inner">' +
      '<p>Before you choose, AGYL identifies the company (Apollo) and individual visitors (RB2B) associated with your visit — both suppressed when your browser sends a Global Privacy Control signal. Optional analytics (Google Analytics, Microsoft Clarity, LinkedIn) load only if you Accept all. See our <a href="/privacy">privacy policy</a>.</p>' +
      '<div class="akc-actions">' +
      '<button class="akc-essential" type="button">Essential only</button>' +
      '<button class="akc-accept" type="button">Accept all</button>' +
      '</div></div>';
    document.body.appendChild(div);
    div.querySelector('.akc-accept').addEventListener('click', function () {
      setConsent('all');
      removeBanner();
      loadOnConsent();
    });
    div.querySelector('.akc-essential').addEventListener('click', function () {
      setConsent('essential');
      removeBanner();
    });
  }

  window.agylShowConsent = function () { showBanner(); };

  function init() {
    loadApollo();
    loadReb2b();
    var c = getConsent();
    if (c === 'all') { loadOnConsent(); return; }
    if (c === 'essential') return;
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
