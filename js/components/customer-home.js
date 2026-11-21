/**
 * Qareeb (قريب) — Customer Experience Homepage
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.CustomerHome = function() {
  const { currentLang, searchFilters } = window.Qareeb.state;
  const { categories, providers } = window.Qareeb.mockData;
  const t = window.Qareeb.t;

  // Filter sections
  const availableTodayProviders = providers.filter(p => p.badges.includes("availableToday"));
  const popularProviders = providers.slice(0, 3);
  const topRatedProviders = [...providers].sort((a, b) => b.rating - a.rating).slice(0, 3);

  // Helper to render provider card
  function renderCard(p) {
    const name = currentLang === "ar" ? p.nameAr : p.nameEn;
    const neighborhood = currentLang === "ar" ? p.neighborhoodAr : p.neighborhoodEn;
    const slot = currentLang === "ar" ? p.nextAvailableSlotAr : p.nextAvailableSlotEn;

    return `
      <article class="provider-card" onclick="window.Qareeb.actions.setCustomerView('provider-detail', '${p.id}')">
        <div class="provider-img-box">
          <img src="${p.heroImage}" alt="${name}" loading="lazy" />
          <div class="provider-chip-slot">
            ${p.badges.includes("instant") ? `<span class="badge badge-emerald">⚡ ${t("badgeInstant")}</span>` : ''}
            ${p.badges.includes("topRated") ? `<span class="badge badge-amber">★ ${t("badgeTopRated")}</span>` : ''}
          </div>
          <div class="provider-rating-pill">
            <span style="color: #FBBF24;">★</span>
            <span>${p.rating.toFixed(1)}</span>
            <span style="color: #94A3B8; font-weight: normal;">(${p.reviewsCount})</span>
          </div>
        </div>

        <div class="provider-content">
          <h3 class="provider-title">${name}</h3>
          <div class="provider-subtitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
            </svg>
            <span>${neighborhood}</span>
          </div>

          <div class="provider-tags-row">
            <span class="badge badge-gray">🕒 ${slot}</span>
          </div>

          <div class="provider-footer">
            <div class="provider-price">
              <span class="text-xs text-muted block">${t("priceStartsAt")}</span>
              <strong>$${p.startingPrice}</strong>
            </div>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                class="btn btn-secondary btn-sm"
                onclick="event.stopPropagation(); window.Qareeb.actions.setCustomerView('provider-detail', '${p.id}')"
              >
                ${t("btnViewProfile")}
              </button>
              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                onclick="event.stopPropagation(); window.Qareeb.actions.openBookingModal('${p.id}')"
              >
                ${t("btnQuickBook")}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <div class="customer-home animate-fade-in">
      <!-- Hero Section with Integrated Discovery Search -->
      <section class="hero-wrapper">
        <div class="container text-center" style="max-width: 860px;">
          <span class="badge badge-amber mb-3" style="box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);">
            ✨ ${currentLang === 'ar' ? 'أكثر من 150 مزود خدمة معتمد في منطقتك' : '150+ Verified Neighborhood Specialists'}
          </span>
          <h1 class="text-4xl font-extrabold mb-3" style="letter-spacing: -0.02em;">
            ${t("heroTitle")}
          </h1>
          <p class="text-secondary text-base" style="max-width: 650px; margin-inline: auto;">
            ${t("heroSubtitle")}
          </p>

          <!-- Interactive Search Box Component -->
          <div class="hero-search-box">
            <!-- Service Query -->
            <div class="search-field-item">
              <span class="search-field-icon">🔍</span>
              <div class="search-field-content">
                <label class="search-field-label">${t("filterCategory")}</label>
                <input 
                  type="text" 
                  id="hero-service-query"
                  class="search-field-input" 
                  placeholder="${t("searchServicePlaceholder")}"
                  value="${searchFilters.query || ''}"
                  oninput="window.Qareeb.state.searchFilters.query = this.value"
                  onkeydown="if(event.key === 'Enter') { window.Qareeb.actions.setCustomerView('search'); }"
                />
              </div>
            </div>

            <!-- Location Query -->
            <div class="search-field-item">
              <span class="search-field-icon">📍</span>
              <div class="search-field-content">
                <label class="search-field-label">${currentLang === 'ar' ? 'الموقع' : 'Location'}</label>
                <input 
                  type="text" 
                  id="hero-location-query"
                  class="search-field-input" 
                  placeholder="${t("searchLocationPlaceholder")}"
                  value="${searchFilters.location || ''}"
                  oninput="window.Qareeb.state.searchFilters.location = this.value"
                  onkeydown="if(event.key === 'Enter') { window.Qareeb.actions.setCustomerView('search'); }"
                />
              </div>
            </div>

            <!-- Availability Date Select -->
            <div class="search-field-item" style="flex: 0.8;">
              <span class="search-field-icon">📅</span>
              <div class="search-field-content">
                <label class="search-field-label">${t("searchDateLabel")}</label>
                <select 
                  class="search-field-input" 
                  onchange="window.Qareeb.state.searchFilters.availability = this.value"
                >
                  <option value="any">${t("filterAvailAny")}</option>
                  <option value="today" selected>${t("dateToday")}</option>
                  <option value="tomorrow">${t("dateTomorrow")}</option>
                  <option value="weekend">${t("dateThisWeekend")}</option>
                </select>
              </div>
            </div>

            <!-- Search Button -->
            <button 
              type="button" 
              class="btn btn-primary btn-lg" 
              style="padding: 0.85rem 1.85rem;"
              onclick="window.Qareeb.actions.setCustomerView('search')"
            >
              <span>${t("btnSearch")}</span>
              <span class="icon-flip-rtl">→</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Category Cards Section -->
      <section class="py-8">
        <div class="container">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold">${t("browseCategories")}</h2>
            </div>
            <button 
              class="text-sm font-semibold text-brand flex items-center gap-1"
              onclick="window.Qareeb.actions.setCustomerView('search')"
            >
              <span>${currentLang === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <span class="icon-flip-rtl">→</span>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            ${categories.map(cat => {
              const name = currentLang === "ar" ? cat.nameAr : cat.nameEn;
              const isActive = searchFilters.category === cat.id;

              return `
                <div 
                  class="category-card ${isActive ? 'active' : ''}" 
                  onclick="window.Qareeb.actions.updateSearchFilters({ category: '${cat.id}' }); window.Qareeb.actions.setCustomerView('search');"
                >
                  <div class="category-icon-wrapper">
                    <span>${cat.icon}</span>
                  </div>
                  <div class="font-bold text-sm text-primary line-clamp-2">${name}</div>
                  <span class="text-xs text-muted">${cat.count} ${currentLang === 'ar' ? 'مركز' : 'spots'}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </section>

      <!-- Section: "Available Today" -->
      <section class="py-6" style="background-color: var(--bg-surface-subtle); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
        <div class="container">
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span style="font-size: 1.25rem;">⚡</span>
                <h2 class="text-2xl font-bold">${t("secAvailableToday")}</h2>
              </div>
              <p class="text-sm text-secondary">${t("secAvailableTodaySub")}</p>
            </div>
            <button 
              class="btn btn-secondary btn-sm"
              onclick="window.Qareeb.actions.updateSearchFilters({ availability: 'today' }); window.Qareeb.actions.setCustomerView('search');"
            >
              ${currentLang === 'ar' ? 'عرض مواعيد اليوم' : 'View Today Slots'}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${availableTodayProviders.map(p => renderCard(p)).join("")}
          </div>
        </div>
      </section>

      <!-- Section: "Popular Near You" -->
      <section class="py-8">
        <div class="container">
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span style="font-size: 1.25rem;">🔥</span>
                <h2 class="text-2xl font-bold">${t("secPopularNearYou")}</h2>
              </div>
              <p class="text-sm text-secondary">${t("secPopularNearYouSub")}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${popularProviders.map(p => renderCard(p)).join("")}
          </div>
        </div>
      </section>

      <!-- Section: "Top Rated" -->
      <section class="py-8" style="background-color: var(--bg-surface-subtle); border-top: 1px solid var(--border-subtle);">
        <div class="container">
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="flex items-center gap-2">
                <span style="font-size: 1.25rem;">🏆</span>
                <h2 class="text-2xl font-bold">${t("secTopRated")}</h2>
              </div>
              <p class="text-sm text-secondary">${t("secTopRatedSub")}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${topRatedProviders.map(p => renderCard(p)).join("")}
          </div>
        </div>
      </section>

      <!-- Value Props Trust Highlights -->
      <section class="py-8">
        <div class="container">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="card p-6 flex items-start gap-4">
              <div style="font-size: 2rem; background: var(--primary-subtle); width: 3.5rem; height: 3.5rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                🛡️
              </div>
              <div>
                <h4 class="font-bold text-base mb-1">${currentLang === 'ar' ? 'مزودون معتمدون ومرخصون' : '100% Vetted & Licensed'}</h4>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'كل صالون ومركز يمر بعملية تدقيق صارمة للسجلات والتراخيص ومعايير التعقيم.' : 'Every provider undergoes permit checks, hygiene audits, and in-person inspections.'}</p>
              </div>
            </div>

            <div class="card p-6 flex items-start gap-4">
              <div style="font-size: 2rem; background: var(--secondary-subtle); width: 3.5rem; height: 3.5rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ⚡
              </div>
              <div>
                <h4 class="font-bold text-base mb-1">${currentLang === 'ar' ? 'تأكيد فوري دون انتظار' : 'Real-Time Instant Slots'}</h4>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'اختر اليوم والوقت واحجز مقعدك فوراً دون الحاجة للاتصال الهاتفي.' : 'Book live openings directly into salon calendars without back-and-forth phone calls.'}</p>
              </div>
            </div>

            <div class="card p-6 flex items-start gap-4">
              <div style="font-size: 2rem; background: var(--primary-subtle); width: 3.5rem; height: 3.5rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ⭐
              </div>
              <div>
                <h4 class="font-bold text-base mb-1">${currentLang === 'ar' ? 'تقييمات حقيقية مؤكدة' : 'Verified Client Reviews'}</h4>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'التقييمات من عملاء أتموا زيارات حقيقية للمركز لضمان أقصى درجات الشفافية.' : 'Read authentic feedback exclusively from customers who attended completed appointments.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
};
