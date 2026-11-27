/**
 * Qareeb (قريب) — Core Application Orchestrator & View Controller
 */
window.Qareeb = window.Qareeb || {};

(function() {
  const { state, actions, t } = window.Qareeb;
  const { 
    Navigation, 
    CustomerHome, 
    SearchResults, 
    ProviderProfile, 
    BookingModal, 
    MyBookings, 
    ProviderPortal, 
    AdminPortal, 
    ToastContainer 
  } = window.Qareeb.components;

  function renderFooter() {
    const { currentLang } = window.Qareeb.state;

    return `
      <footer class="py-12 mt-auto" style="background-color: var(--bg-surface); border-top: 1px solid var(--border-default);">
        <div class="container">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div class="md:col-span-2">
              <div class="flex items-center gap-2 mb-3">
                <div class="brand-icon-box" style="width: 2rem; height: 2rem;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                    <circle cx="12" cy="9" r="2.5"></circle>
                  </svg>
                </div>
                <span class="font-extrabold text-xl">${t("brandName")}</span>
                <span class="brand-tag">${t("brandTagline")}</span>
              </div>
              <p class="text-xs text-secondary leading-relaxed mb-4" style="max-width: 440px;">
                ${t("footerDesc")}
              </p>
              <div class="text-xs text-muted">
                ${t("footerDisclaimer")}
              </div>
            </div>

            <div>
              <h4 class="font-bold text-sm text-primary mb-3">${t("footerCustomerLinks")}</h4>
              <ul class="flex flex-col gap-2 text-xs text-secondary">
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.setCustomerView('search')">${t("navExplore")}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.setCustomerView('my-bookings')">${t("navMyBookings")}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.updateSearchFilters({ category: 'barber' }); window.Qareeb.actions.setCustomerView('search');">${t("catBarber")}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.updateSearchFilters({ category: 'facial' }); window.Qareeb.actions.setCustomerView('search');">${t("catFacial")}</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold text-sm text-primary mb-3">${t("footerProviderLinks")}</h4>
              <ul class="flex flex-col gap-2 text-xs text-secondary">
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.setRole('provider')">${t("roleProvider")}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.setRole('admin')">${t("roleAdmin")}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.addToast('Partner with Qareeb: Demo link', 'info')">${currentLang === 'ar' ? 'انضم كشريك تجاري' : 'Join as Partner'}</a></li>
                <li><a href="javascript:void(0)" onclick="window.Qareeb.actions.addToast('Community Guidelines: Demo link', 'info')">${currentLang === 'ar' ? 'معايير الجودة والسلامة' : 'Quality Standards'}</a></li>
              </ul>
            </div>
          </div>

          <div class="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4" style="border-top: 1px solid var(--border-subtle);">
            <div>${t("footerCopy")}</div>
            <div class="flex items-center gap-4">
              <button onclick="window.Qareeb.actions.toggleLanguage()" class="hover:underline font-semibold">
                🌐 ${currentLang === 'en' ? 'تغيير إلى العربية' : 'Switch to English'}
              </button>
              <span>•</span>
              <button onclick="window.Qareeb.actions.toggleTheme()" class="hover:underline font-semibold">
                ${state.currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function renderApp() {
    const root = document.getElementById("app-root");
    if (!root) return;

    // Apply document attributes
    document.documentElement.setAttribute("data-theme", state.currentTheme);
    document.documentElement.setAttribute("lang", state.currentLang);
    document.documentElement.setAttribute("dir", state.currentLang === "ar" ? "rtl" : "ltr");
    document.title = (state.currentLang === "ar" ? "قريب | منصة حجز الخدمات المحلية" : "Qareeb | Local Services Marketplace") + ` (${state.currentRole.toUpperCase()})`;

    // Route view rendering
    let mainViewHtml = "";
    if (state.currentRole === "customer") {
      if (state.activeCustomerView === "home") mainViewHtml = CustomerHome();
      else if (state.activeCustomerView === "search") mainViewHtml = SearchResults();
      else if (state.activeCustomerView === "provider-detail") mainViewHtml = ProviderProfile();
      else if (state.activeCustomerView === "my-bookings") mainViewHtml = MyBookings();
      else mainViewHtml = CustomerHome();
    } else if (state.currentRole === "provider") {
      mainViewHtml = ProviderPortal();
    } else if (state.currentRole === "admin") {
      mainViewHtml = AdminPortal();
    }

    root.innerHTML = `
      ${Navigation()}
      ${window.Qareeb.account.bar()}
      <div id="main-content-wrapper" style="min-height: 80vh; display: flex; flex-direction: column;">
        ${mainViewHtml}
      </div>
      ${renderFooter()}
      ${BookingModal()}
      ${ToastContainer()}
    `;
  }

  // Subscribe and initialize on DOM ready
  window.Qareeb.subscribe(renderApp);

  document.addEventListener("DOMContentLoaded", () => {
    // Initial sync
    document.documentElement.setAttribute("data-theme", state.currentTheme);
    document.documentElement.setAttribute("lang", state.currentLang);
    document.documentElement.setAttribute("dir", state.currentLang === "ar" ? "rtl" : "ltr");
    renderApp();
    window.Qareeb.discovery?.initialize();
  });
})();
