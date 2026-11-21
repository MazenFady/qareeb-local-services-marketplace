/**
 * Qareeb (قريب) — Search & Discovery Results with Multi-Filter Sidebar
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.SearchResults = function() {
  const { currentLang, searchFilters } = window.Qareeb.state;
  const { categories, providers } = window.Qareeb.mockData;
  const t = window.Qareeb.t;

  // Filter application logic
  let filtered = [...providers].filter(p => {
    // Category filter
    if (searchFilters.category && searchFilters.category !== "all") {
      if (p.category !== searchFilters.category) return false;
    }

    // Text query filter
    if (searchFilters.query && searchFilters.query.trim()) {
      const q = searchFilters.query.toLowerCase().trim();
      const matchName = (p.nameEn + " " + p.nameAr).toLowerCase().includes(q);
      const matchService = p.services.some(s => (s.titleEn + " " + s.titleAr).toLowerCase().includes(q));
      if (!matchName && !matchService) return false;
    }

    // Location query filter
    if (searchFilters.location && searchFilters.location.trim()) {
      const loc = searchFilters.location.toLowerCase().trim();
      const matchLoc = (p.neighborhoodEn + " " + p.neighborhoodAr + " " + p.addressEn + " " + p.addressAr).toLowerCase().includes(loc);
      if (!matchLoc) return false;
    }

    // Price tier filter
    if (searchFilters.priceTier && searchFilters.priceTier !== "all") {
      if (p.priceTier !== searchFilters.priceTier) return false;
    }

    // Min rating filter
    if (searchFilters.minRating && searchFilters.minRating > 0) {
      if (p.rating < searchFilters.minRating) return false;
    }

    // Availability filter
    if (searchFilters.availability === "today") {
      if (!p.badges.includes("availableToday")) return false;
    }

    return true;
  });

  // Sorting logic
  if (searchFilters.sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (searchFilters.sortBy === "price") {
    filtered.sort((a, b) => a.startingPrice - b.startingPrice);
  }

  return `
    <div class="search-results-page py-6 animate-fade-in">
      <div class="container">
        <!-- Breadcrumb & Results Header -->
        <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2 text-xs text-muted mb-1">
              <span style="cursor: pointer;" onclick="window.Qareeb.actions.setCustomerView('home')">${t("navHome")}</span>
              <span class="icon-flip-rtl">/</span>
              <span class="text-secondary font-medium">${t("searchPageTitle")}</span>
            </div>
            <h1 class="text-3xl font-extrabold">${t("searchPageTitle")}</h1>
            <p class="text-sm text-secondary">${t("resultsCount", { count: filtered.length })}</p>
          </div>

          <!-- Sort Select Control -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-muted">${t("sortBy")}:</span>
            <select 
              class="form-select text-sm py-2 px-3" 
              style="width: auto;"
              onchange="window.Qareeb.actions.updateSearchFilters({ sortBy: this.value })"
            >
              <option value="recommended" ${searchFilters.sortBy === 'recommended' ? 'selected' : ''}>${t("sortRecommended")}</option>
              <option value="rating" ${searchFilters.sortBy === 'rating' ? 'selected' : ''}>${t("sortRatingHigh")}</option>
              <option value="price" ${searchFilters.sortBy === 'price' ? 'selected' : ''}>${t("sortPriceLow")}</option>
            </select>
          </div>
        </div>

        <!-- Layout Grid: Sidebar Filters + Results Cards -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <!-- Sidebar Filters Card -->
          <aside class="card p-6 w-full lg:w-80 flex-shrink-0" style="position: sticky; top: 5rem;">
            <div class="flex items-center justify-between mb-4 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <h2 class="text-lg font-bold">${t("searchFilterTitle")}</h2>
              <button 
                type="button" 
                class="text-xs font-semibold text-brand"
                onclick="window.Qareeb.actions.resetSearchFilters()"
              >
                ${currentLang === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>

            <!-- Filter: Service Keyword -->
            <div class="form-group mb-4">
              <label class="form-label">${currentLang === 'ar' ? 'البحث بالاسم أو الخدمة' : 'Keyword or Service'}</label>
              <input 
                type="text" 
                class="form-input text-sm" 
                placeholder="${t("searchServicePlaceholder")}"
                value="${searchFilters.query || ''}"
                oninput="window.Qareeb.actions.updateSearchFilters({ query: this.value })"
              />
            </div>

            <!-- Filter: Location -->
            <div class="form-group mb-4">
              <label class="form-label">${currentLang === 'ar' ? 'الحي أو المنطقة' : 'Neighborhood / Location'}</label>
              <input 
                type="text" 
                class="form-input text-sm" 
                placeholder="${t("searchLocationPlaceholder")}"
                value="${searchFilters.location || ''}"
                oninput="window.Qareeb.actions.updateSearchFilters({ location: this.value })"
              />
            </div>

            <!-- Filter: Category -->
            <div class="form-group mb-4">
              <label class="form-label">${t("filterCategory")}</label>
              <select 
                class="form-select text-sm" 
                onchange="window.Qareeb.actions.updateSearchFilters({ category: this.value })"
              >
                <option value="all" ${searchFilters.category === 'all' ? 'selected' : ''}>${t("filterAllCategories")}</option>
                ${categories.map(c => `
                  <option value="${c.id}" ${searchFilters.category === c.id ? 'selected' : ''}>
                    ${currentLang === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- Filter: Price Tier -->
            <div class="form-group mb-4">
              <label class="form-label">${t("filterPriceTier")}</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  class="btn btn-sm ${searchFilters.priceTier === '$' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="window.Qareeb.actions.updateSearchFilters({ priceTier: searchFilters.priceTier === '$' ? 'all' : '$' })"
                >
                  $
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm ${searchFilters.priceTier === '$$' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="window.Qareeb.actions.updateSearchFilters({ priceTier: searchFilters.priceTier === '$$' ? 'all' : '$$' })"
                >
                  $$
                </button>
                <button 
                  type="button" 
                  class="btn btn-sm ${searchFilters.priceTier === '$$$' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="window.Qareeb.actions.updateSearchFilters({ priceTier: searchFilters.priceTier === '$$$' ? 'all' : '$$$' })"
                >
                  $$$
                </button>
              </div>
            </div>

            <!-- Filter: Rating -->
            <div class="form-group mb-4">
              <label class="form-label">${t("filterRating")}</label>
              <select 
                class="form-select text-sm" 
                onchange="window.Qareeb.actions.updateSearchFilters({ minRating: Number(this.value) })"
              >
                <option value="0" ${searchFilters.minRating === 0 ? 'selected' : ''}>${t("filterRatingAll")}</option>
                <option value="4.5" ${searchFilters.minRating === 4.5 ? 'selected' : ''}>★ ${t("filterRating45")}</option>
                <option value="4.0" ${searchFilters.minRating === 4.0 ? 'selected' : ''}>★ ${t("filterRating40")}</option>
              </select>
            </div>

            <!-- Filter: Availability -->
            <div class="form-group mb-2">
              <label class="form-label">${t("filterAvailability")}</label>
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2 text-sm text-secondary" style="cursor: pointer;">
                  <input 
                    type="radio" 
                    name="avail" 
                    value="any" 
                    ${searchFilters.availability === 'any' ? 'checked' : ''}
                    onchange="window.Qareeb.actions.updateSearchFilters({ availability: 'any' })"
                  />
                  <span>${t("filterAvailAny")}</span>
                </label>
                <label class="flex items-center gap-2 text-sm text-secondary" style="cursor: pointer;">
                  <input 
                    type="radio" 
                    name="avail" 
                    value="today" 
                    ${searchFilters.availability === 'today' ? 'checked' : ''}
                    onchange="window.Qareeb.actions.updateSearchFilters({ availability: 'today' })"
                  />
                  <span>⚡ ${t("filterAvailToday")}</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Results Grid -->
          <main class="flex-1 w-full">
            ${filtered.length === 0 ? `
              <div class="card p-12 text-center">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3 class="text-xl font-bold mb-2">${t("noResults")}</h3>
                <p class="text-sm text-secondary mb-4">${currentLang === 'ar' ? 'يمكنك تجربة مسح بعض الفلاتر لعرض مزودي الخدمة المتاحين.' : 'Try adjusting or clearing your filters to see available specialists.'}</p>
                <button class="btn btn-primary" onclick="window.Qareeb.actions.resetSearchFilters()">
                  ${currentLang === 'ar' ? 'مسح كافة الفلاتر' : 'Reset All Filters'}
                </button>
              </div>
            ` : `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${filtered.map(p => {
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
                        <h2 class="provider-title">${name}</h2>
                        <div class="provider-subtitle">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                          </svg>
                          <span>${neighborhood}</span>
                        </div>

                        <div class="provider-tags-row">
                          <span class="badge badge-gray">🕒 ${slot}</span>
                          <span class="badge badge-gray">${p.priceTier}</span>
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
                }).join("")}
              </div>
            `}
          </main>
        </div>
      </div>
    </div>
  `;
};
