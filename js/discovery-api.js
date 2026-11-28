/**
 * Qareeb (قريب) — Public discovery API cache.
 * The API is the source of truth when available. The bundled mock catalog is
 * retained only for the offline prototype/server.js experience.
 */
window.Qareeb = window.Qareeb || {};
(function () {
  const data = {
    categories: [],
    providers: [],
    details: {},
    loaded: false,
    loading: false,
    error: null
  };

  let initialized = false;
  let providerRequest = 0;

  function notify() {
    if (typeof window.Qareeb.notify === "function") window.Qareeb.notify();
  }

  function queryString(filters) {
    const params = new URLSearchParams();
    if (filters.query && filters.query.trim()) params.set("query", filters.query.trim());
    if (filters.location && filters.location.trim()) params.set("location", filters.location.trim());
    if (filters.category && filters.category !== "all") params.set("category", filters.category);
    if (filters.priceTier && filters.priceTier !== "all") params.set("priceTier", filters.priceTier);
    if (Number(filters.minRating) > 0) params.set("minRating", String(filters.minRating));
    if (filters.availability && filters.availability !== "any") params.set("availability", filters.availability);
    if (filters.sortBy && filters.sortBy !== "recommended") params.set("sortBy", filters.sortBy);
    const query = params.toString();
    return query ? "?" + query : "";
  }

  function fail(error) {
    data.error = error;
    data.loaded = false;
    data.categories = [];
    data.providers = [];
    data.loading = false;
    notify();
  }

  async function loadCategories() {
    data.categories = await window.Qareeb.authApi.request("/public/categories");
  }

  async function loadProviders(filters) {
    const requestId = ++providerRequest;
    data.loading = true;
    try {
      const rows = await window.Qareeb.authApi.request("/public/providers" + queryString(filters));
      if (requestId !== providerRequest) return;
      data.providers = rows;
      data.categories = await window.Qareeb.authApi.request("/public/categories");
      data.loaded = true;
      data.error = null;
    } finally {
      if (requestId === providerRequest) data.loading = false;
    }
    notify();
  }

  async function loadProvider(id) {
    if (!id) return null;
    const cached = data.providers.find(p => p.id === id) || data.details[id];
    if (cached) return cached;
    if (!data.loaded) return null;
    const provider = await window.Qareeb.authApi.request("/public/providers/" + encodeURIComponent(id));
    data.details[id] = provider;
    return provider;
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    const filters = window.Qareeb.state?.searchFilters || {};
    loadProviders(filters).catch(fail);
  }

  function onFiltersChanged() {
    if (!initialized) return;
    loadProviders(window.Qareeb.state.searchFilters).catch(fail);
  }

  function catalog() {
    return data.loaded ? data : window.Qareeb.mockData;
  }

  function providerFor(id) {
    return catalog().providers.find(p => p.id === id) || null;
  }

  window.Qareeb.discoveryData = data;
  window.Qareeb.discovery = {
    data,
    initialize,
    onFiltersChanged,
    loadCategories,
    loadProviders,
    loadProvider,
    catalog,
    providerFor
  };
})();
