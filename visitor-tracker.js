/*
 * visitor-tracker.js
 * Drop this on every page of the portfolio. It sends one lightweight
 * "visit" beacon to your Cloudflare Worker, which writes it to visits.json.
 *
 * SETUP: replace WORKER_URL below with your deployed Worker URL.
 * Then add this to each HTML page, just before </body>:
 *   <script src="visitor-tracker.js" defer></script>
 */
(function () {
  // 1) Your deployed Cloudflare Worker URL (see SETUP.md). No trailing slash.
  //var WORKER_URL = "https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev";
  var WORKER_URL = "https://portfolio-visits.ersakshigoel.workers.dev";
  // 2) Count each page load once per browser session (set to false to log
  //    every page navigation, including moving between your pages).
  var ONCE_PER_SESSION = false;

  try {
    if (ONCE_PER_SESSION && sessionStorage.getItem("visit_logged") === "1") return;

    var payload = {
      page: location.pathname + location.search,
      title: document.title || "",
      referrer: document.referrer || "(direct)",
      language: navigator.language || "",
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone) || "",
      screen: screen.width + "x" + screen.height,
      viewport: window.innerWidth + "x" + window.innerHeight,
      clientTime: new Date().toISOString()
    };

    // Fire-and-forget; keepalive lets it finish even if the page unloads.
    fetch(WORKER_URL + "/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
      keepalive: true
    }).catch(function () { /* never break the page over analytics */ });

    if (ONCE_PER_SESSION) sessionStorage.setItem("visit_logged", "1");
  } catch (e) {
    /* silent: analytics must never affect the visitor experience */
  }
})();
