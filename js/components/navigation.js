/**
 * Qareeb (قريب) — Navigation & Demo Role Switcher Component
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.Navigation = function() {
  const { currentRole, currentLang, currentTheme, activeCustomerView, activeProviderTab, activeAdminTab, customerBookings, pendingApprovals } = window.Qareeb.state;
  const t = window.Qareeb.t;

  const upcomingCount = customerBookings.filter(b => b.status === "confirmed" || b.status === "pending").length;
  const pendingApprovalsCount = pendingApprovals.length;

  return `
    <!-- Top Demo Announcement & Multi-Role Switcher -->
    <aside class="demo-banner" aria-label="Demo banner">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="demo-chip">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10B981; animation: pulse 2s infinite;"></span>
          ${t("demoBadge")}
        </span>
        <span class="text-xs" style="color: #CBD5E1; display: inline-block;">
          ${t("demoNotice")}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold" style="color: #94A3B8; display: none;" id="demo-role-label">
          ${t("switchRole")}:
        </span>
        <div class="demo-role-pills" role="radiogroup" aria-label="Role Switcher">
          <button 
            type="button"
            class="demo-role-btn ${currentRole === 'customer' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setRole('customer')"
            title="Preview as Customer"
          >
            <span>👤</span> ${t("roleCustomer")}
          </button>
          <button 
            type="button"
            class="demo-role-btn ${currentRole === 'provider' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setRole('provider')"
            title="Preview as Service Provider"
          >
            <span>✂️</span> ${t("roleProvider")}
          </button>
          <button 
            type="button"
            class="demo-role-btn ${currentRole === 'admin' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setRole('admin')"
            title="Preview as Platform Administrator"
          >
            <span>🛡️</span> ${t("roleAdmin")}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Navigation Bar -->
    <header class="main-header">
      <div class="container nav-container">
        <!-- Logo -->
        <div class="brand-logo" onclick="window.Qareeb.actions.setCustomerView('home')">
          <div class="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
              <circle cx="12" cy="9" r="2.5"></circle>
            </svg>
          </div>
          <div class="flex flex-col">
            <div class="brand-name">
              <span>${t("brandName")}</span>
              <span class="brand-tag">${currentLang === "ar" ? "قريب" : "Local"}</span>
            </div>
          </div>
        </div>

        <!-- Role-Specific Navigation Links (Desktop) -->
        <nav class="nav-links" aria-label="Main Navigation">
          ${currentRole === 'customer' ? `
            <a href="javascript:void(0)" class="nav-link ${activeCustomerView === 'home' ? 'active' : ''}" onclick="window.Qareeb.actions.setCustomerView('home')">
              ${t("navHome")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeCustomerView === 'search' ? 'active' : ''}" onclick="window.Qareeb.actions.setCustomerView('search')">
              ${t("navExplore")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeCustomerView === 'my-bookings' ? 'active' : ''}" onclick="window.Qareeb.actions.setCustomerView('my-bookings')">
              ${t("navMyBookings")}
              ${upcomingCount > 0 ? `<span class="badge badge-amber" style="padding: 0.1rem 0.4rem; font-size: 0.7rem; margin-inline-start: 0.25rem;">${upcomingCount}</span>` : ''}
            </a>
          ` : ''}

          ${currentRole === 'provider' ? `
            <a href="javascript:void(0)" class="nav-link ${activeProviderTab === 'dashboard' ? 'active' : ''}" onclick="window.Qareeb.actions.setProviderTab('dashboard')">
              ${t("navProviderSchedule")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeProviderTab === 'services' ? 'active' : ''}" onclick="window.Qareeb.actions.setProviderTab('services')">
              ${t("navProviderServices")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeProviderTab === 'hours' ? 'active' : ''}" onclick="window.Qareeb.actions.setProviderTab('hours')">
              ${t("navProviderHours")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeProviderTab === 'reviews' ? 'active' : ''}" onclick="window.Qareeb.actions.setProviderTab('reviews')">
              ${t("navProviderReviews")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeProviderTab === 'preview' ? 'active' : ''}" onclick="window.Qareeb.actions.setProviderTab('preview')">
              <span style="color: var(--primary);">👁️</span> ${t("navProviderPreview")}
            </a>
          ` : ''}

          ${currentRole === 'admin' ? `
            <a href="javascript:void(0)" class="nav-link ${activeAdminTab === 'dashboard' ? 'active' : ''}" onclick="window.Qareeb.actions.setAdminTab('dashboard')">
              ${t("navAdminDashboard")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeAdminTab === 'approvals' ? 'active' : ''}" onclick="window.Qareeb.actions.setAdminTab('approvals')">
              ${t("navAdminApprovals")}
              ${pendingApprovalsCount > 0 ? `<span class="badge badge-danger" style="padding: 0.1rem 0.4rem; font-size: 0.7rem; margin-inline-start: 0.25rem;">${pendingApprovalsCount}</span>` : ''}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeAdminTab === 'bookings' ? 'active' : ''}" onclick="window.Qareeb.actions.setAdminTab('bookings')">
              ${t("navAdminBookings")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeAdminTab === 'moderation' ? 'active' : ''}" onclick="window.Qareeb.actions.setAdminTab('moderation')">
              ${t("navAdminModeration")}
            </a>
            <a href="javascript:void(0)" class="nav-link ${activeAdminTab === 'keywords' ? 'active' : ''}" onclick="window.Qareeb.actions.setAdminTab('keywords')">
              ${t("navAdminKeywords")}
            </a>
          ` : ''}
        </nav>

        <!-- Right Controls: Language & Theme Switchers -->
        <div class="nav-controls">
          <!-- Language Toggle -->
          <button 
            type="button" 
            class="control-btn" 
            onclick="window.Qareeb.actions.toggleLanguage()"
            title="Switch Language (English / العربية)"
          >
            <span>🌐</span>
            <span>${currentLang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <!-- Theme Toggle -->
          <button 
            type="button" 
            class="control-btn icon-only" 
            onclick="window.Qareeb.actions.toggleTheme()"
            title="${currentTheme === 'light' ? t('themeToggleDark') : t('themeToggleLight')}"
            aria-label="Toggle Color Theme"
          >
            <span>${currentTheme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button 
            type="button" 
            class="mobile-nav-toggle" 
            onclick="document.getElementById('mobile-drawer').classList.toggle('open')"
            aria-label="Toggle Mobile Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Menu -->
    <div id="mobile-drawer" class="mobile-drawer" onclick="if(event.target === this) this.classList.remove('open')">
      <div class="mobile-drawer-content">
        <div class="flex items-center justify-between pb-3" style="border-bottom: 1px solid var(--border-default);">
          <div class="brand-name text-lg font-bold">
            ${t("brandName")}
          </div>
          <button onclick="document.getElementById('mobile-drawer').classList.remove('open')" class="text-secondary" style="font-size: 1.25rem;">
            ✕
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold text-muted uppercase">${t("switchRole")}</span>
          <div class="flex flex-col gap-1">
            <button class="btn ${currentRole === 'customer' ? 'btn-primary' : 'btn-secondary'} btn-sm justify-start" onclick="window.Qareeb.actions.setRole('customer'); document.getElementById('mobile-drawer').classList.remove('open')">
              👤 ${t("roleCustomer")}
            </button>
            <button class="btn ${currentRole === 'provider' ? 'btn-primary' : 'btn-secondary'} btn-sm justify-start" onclick="window.Qareeb.actions.setRole('provider'); document.getElementById('mobile-drawer').classList.remove('open')">
              ✂️ ${t("roleProvider")}
            </button>
            <button class="btn ${currentRole === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm justify-start" onclick="window.Qareeb.actions.setRole('admin'); document.getElementById('mobile-drawer').classList.remove('open')">
              🛡️ ${t("roleAdmin")}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2 pt-2" style="border-top: 1px solid var(--border-default);">
          <span class="text-xs font-semibold text-muted uppercase">Navigation</span>
          ${currentRole === 'customer' ? `
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setCustomerView('home'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navHome")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setCustomerView('search'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navExplore")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setCustomerView('my-bookings'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navMyBookings")}</button>
          ` : ''}
          ${currentRole === 'provider' ? `
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setProviderTab('dashboard'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navProviderSchedule")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setProviderTab('services'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navProviderServices")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setProviderTab('hours'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navProviderHours")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setProviderTab('reviews'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navProviderReviews")}</button>
          ` : ''}
          ${currentRole === 'admin' ? `
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setAdminTab('dashboard'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navAdminDashboard")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setAdminTab('approvals'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navAdminApprovals")}</button>
            <button class="btn btn-secondary btn-sm justify-start" onclick="window.Qareeb.actions.setAdminTab('bookings'); document.getElementById('mobile-drawer').classList.remove('open')">${t("navAdminBookings")}</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};
