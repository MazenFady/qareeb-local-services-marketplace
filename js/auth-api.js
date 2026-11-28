window.Qareeb = window.Qareeb || {};
(function () {
  class ApiError extends Error {
    constructor(status, detail) { super(detail || ""); this.status = status; }
  }
  function base() {
    const url = new URL(window.QareebConfig.apiBaseUrl, location.href);
    if (location.protocol !== "https:" || url.origin !== location.origin || url.search || url.hash)
      throw new ApiError(0, "configuration");
    return url.href.replace(/\/$/, "");
  }
  function target(path) {
    const baseUrl = base().replace(/\/$/, "");
    const raw = String(path);
    if (raw.startsWith("/")) {
      const clean = raw.replace(/^\/+/, "");
      return baseUrl + "/" + clean;
    }
    let clean = raw.replace(/^\/+/, "");
    if (clean.startsWith("auth/")) clean = clean.slice("auth/".length);
    return baseUrl + "/auth/" + clean;
  }
  async function request(path, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      // Fresh tokens handle identity changes and multiple tabs. Never retry mutations.
      const headers = { Accept: "application/json" };
      if (body !== undefined) {
        const csrf = await fetch(target("csrf"), { credentials: "same-origin", cache: "no-store", signal: controller.signal });
        if (!csrf.ok) throw new ApiError(csrf.status);
        headers["X-CSRF-TOKEN"] = (await csrf.json()).token;
        headers["Content-Type"] = "application/json";
      }
      const response = await fetch(target(path), {
        method: body === undefined ? "GET" : "POST", credentials: "same-origin",
        cache: "no-store", headers, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal
      });
      const text = await response.text();
      let result;
      try { result = text ? JSON.parse(text) : null; } catch { throw new ApiError(502); }
      if (!response.ok) throw new ApiError(response.status, result?.detail);
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error.name === "AbortError" ? "timeout" : "network");
    } finally { clearTimeout(timeout); }
  }
  window.Qareeb.authApi = { request };
})();
