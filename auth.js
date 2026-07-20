/* =========================================================================
   AJobThing preview — access gate (self-contained, drop-in)
   -------------------------------------------------------------------------
   Add  <script src="auth.js"></script>  as the FIRST tag inside <head> of
   every page you want gated. The script injects its own styles + login
   overlay, so nothing else in the page needs to change.

   Limits access to @ajobthing.com users who know the shared team access
   code. One localStorage key is used across the whole rayteng.github.io
   origin, so signing in on any page unlocks all of them.

   This is a DETERRENT, not real security: the site is static, so files are
   still publicly downloadable and a technical user can bypass this in the
   browser. For true access control, front the site with Cloudflare Access
   (email one-time-PIN, restricted to @ajobthing.com).

   To change the access code, run:
     node -e "console.log(require('crypto').createHash('sha256').update('YOUR-NEW-CODE').digest('hex'))"
   and paste the result into CODE_HASH below (in every repo's copy).
   ========================================================================= */
(function () {
  "use strict";

  var ALLOW_RE   = /^[^\s@]+@ajobthing\.com$/i;                                     // only @ajobthing.com
  var CODE_HASH  = "ca2212117cba920e2867dd1a28c92a0f05b54d36e9817dc756a983ab6695cc66"; // sha256("ajobthing-demo-2026")
  var AUTH_KEY   = "aichat.access.v1";                                              // shared across the origin
  var LOCK_CLASS = "ag-locked";

  function stored() { try { return localStorage.getItem(AUTH_KEY) || ""; } catch (e) { return ""; } }
  if (ALLOW_RE.test(stored())) return; // already signed in on this origin — show the page

  var doc = document, de = doc.documentElement;
  de.classList.add(LOCK_CLASS);

  // Inject styles right away so page content stays hidden until sign-in.
  var css =
    'html.ag-locked body{visibility:hidden!important}' +
    '#agGate,#agGate *{visibility:visible!important}' +
    '#agGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'background:linear-gradient(160deg,#eef1fb 0%,#f6f7fb 55%,#eef4f1 100%)}' +
    '#agGate.ag-out{opacity:0;pointer-events:none;transition:opacity .26s ease}' +
    '#agGate .ag-card{width:100%;max-width:384px;box-sizing:border-box;background:#fff;border:1px solid #e7e9f0;border-radius:18px;padding:30px 28px 26px;box-shadow:0 22px 60px rgba(23,27,48,.16)}' +
    '#agGate .ag-brand{display:flex;align-items:center;gap:8px}' +
    '#agGate .ag-mark{color:#6366f1;font-size:16px}' +
    '#agGate .ag-logo{font-weight:800;font-size:19px;letter-spacing:-.2px;color:#1f2430}' +
    '#agGate .ag-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#7a8296;background:#f0f1f6;border-radius:999px;padding:3px 9px}' +
    '#agGate .ag-title{font-size:21px;font-weight:700;color:#1f2430;margin:20px 0 7px}' +
    '#agGate .ag-desc{font-size:13px;line-height:1.55;color:#667085;margin:0 0 20px}' +
    '#agGate .ag-desc b{color:#3a4152}' +
    '#agGate .ag-field{display:block;margin-bottom:13px}' +
    '#agGate .ag-lbl{display:block;font-size:12px;font-weight:600;color:#545c6e;margin-bottom:6px}' +
    '#agGate .ag-input{width:100%;box-sizing:border-box;font-family:inherit;font-size:14px;border:1px solid #dfe2ea;border-radius:11px;padding:12px 14px;color:#1f2430;background:#fff}' +
    '#agGate .ag-input::placeholder{color:#aab0bd}' +
    '#agGate .ag-input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15)}' +
    '#agGate .ag-inwrap{position:relative;display:flex}' +
    '#agGate .ag-inwrap .ag-input{flex:1;padding-right:44px}' +
    '#agGate .ag-eye{position:absolute;top:50%;right:6px;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:none;background:transparent;color:#9aa1ac;cursor:pointer;border-radius:8px}' +
    '#agGate .ag-eye:hover{color:#4f46e5;background:#f1f2f6}' +
    '#agGate .ag-btn{width:100%;margin-top:6px;border:none;cursor:pointer;background:#6366f1;color:#fff;font-family:inherit;font-size:15px;font-weight:600;border-radius:11px;padding:13px}' +
    '#agGate .ag-btn:hover{background:#4f46e5}' +
    '#agGate .ag-btn:disabled{opacity:.6;cursor:default}' +
    '#agGate .ag-err{min-height:18px;margin-top:11px;font-size:13px;color:#dc2626}' +
    '#agGate .ag-foot{margin-top:15px;text-align:center;font-size:12px;color:#98a2b3;line-height:1.6}' +
    '#agGate .ag-foot b{color:#d7dee8}' +
    '#agGate .ag-link{color:#5fa0ff;text-decoration:none;font-weight:600;white-space:nowrap}' +
    '#agGate .ag-link:hover{text-decoration:underline}' +
    '@media(max-width:480px){#agGate .ag-card{padding:24px 20px 22px;border-radius:15px}#agGate .ag-title{font-size:19px}}';
  var st = doc.createElement("style");
  st.id = "agGateCss";
  st.textContent = css;
  (doc.head || de).appendChild(st);

  var EYE = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  var GATE_HTML =
    '<div class="ag-card">' +
      '<div class="ag-brand"><span class="ag-mark">●</span><span class="ag-logo">AJobThing</span><span class="ag-tag">Private preview</span></div>' +
      '<h1 class="ag-title">Sign in to continue</h1>' +
      '<p class="ag-desc">This preview is limited to <b>AJobThing</b>. Sign in with your <b>@ajobthing.com</b> email and the team access code.</p>' +
      '<label class="ag-field"><span class="ag-lbl">Work email</span>' +
        '<input id="agEmail" class="ag-input" type="email" inputmode="email" placeholder="you@ajobthing.com" autocomplete="email" spellcheck="false"></label>' +
      '<label class="ag-field"><span class="ag-lbl">Access code</span>' +
        '<div class="ag-inwrap">' +
          '<input id="agCode" class="ag-input" type="password" placeholder="Team access code" autocomplete="off">' +
          '<button id="agEye" class="ag-eye" type="button" tabindex="-1" aria-label="Show code" title="Show code">' + EYE + '</button>' +
        '</div></label>' +
      '<button id="agBtn" class="ag-btn" type="button">Enter →</button>' +
      '<div id="agErr" class="ag-err" role="alert"></div>' +
      '<div class="ag-foot">Need the login password? Lark <b>Ray</b> or email <a class="ag-link" href="mailto:rayteng@ajobthing.com">rayteng@ajobthing.com</a></div>' +
    '</div>';

  function $(id) { return doc.getElementById(id); }

  function sha256hex(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  function unlock() {
    var g = $("agGate"); if (g && g.parentNode) g.parentNode.removeChild(g);
    de.classList.remove(LOCK_CLASS);
  }

  function mount() {
    if ($("agGate")) return;
    var g = doc.createElement("div");
    g.id = "agGate";
    g.innerHTML = GATE_HTML;
    doc.body.appendChild(g);

    var eye = $("agEye");
    if (eye) {
      eye.addEventListener("click", function () {
        var inp = $("agCode");
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        eye.innerHTML = show ? EYE_OFF : EYE;
        eye.setAttribute("aria-label", show ? "Hide code" : "Show code");
        eye.setAttribute("title", show ? "Hide code" : "Show code");
        inp.focus();
      });
    }

    function err(m) { $("agErr").textContent = m || ""; }
    function submit() {
      var email = ($("agEmail").value || "").trim(), code = $("agCode").value || "";
      err("");
      if (!ALLOW_RE.test(email)) { err("Please sign in with your @ajobthing.com email (check for typos)."); $("agEmail").focus(); return; }
      if (!code) { err("Enter the team access code."); $("agCode").focus(); return; }
      var b = $("agBtn"); b.disabled = true;
      sha256hex(code).then(function (h) {
        if (h !== CODE_HASH) {
          err("That access code isn’t right. Lark Ray or email rayteng@ajobthing.com for the password.");
          b.disabled = false; $("agCode").focus(); $("agCode").select(); return;
        }
        try { localStorage.setItem(AUTH_KEY, email); } catch (e) {}
        g.classList.add("ag-out"); setTimeout(unlock, 260);
      }).catch(function () {
        err("Your browser blocked secure verification. Use a modern browser over HTTPS.");
        b.disabled = false;
      });
    }
    $("agBtn").addEventListener("click", submit);
    g.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); submit(); } });
    try { $("agEmail").focus(); } catch (e) {}
  }

  if (doc.body) mount();
  else doc.addEventListener("DOMContentLoaded", mount);
})();
