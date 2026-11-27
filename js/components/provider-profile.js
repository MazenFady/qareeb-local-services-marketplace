/**
 * Qareeb (قريب) — Public Service Provider Profile View
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.ProviderProfile = function() {
  const { currentLang, selectedProviderId } = window.Qareeb.state;
  const catalog = window.Qareeb.discovery?.catalog() || window.Qareeb.mockData;
  const t = window.Qareeb.t;

  const provider = catalog.providers.find(p => p.id === selectedProviderId)
    || window.Qareeb.discoveryData?.details?.[selectedProviderId];
  if (!provider) {
    return `
      <div class="container py-12 animate-fade-in">
        <div class="card p-10 text-center">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
          <h1 class="text-2xl font-extrabold mb-2">${currentLang === 'ar' ? 'مزود الخدمة غير متاح' : 'Provider unavailable'}</h1>
          <p class="text-sm text-secondary mb-5">${currentLang === 'ar' ? 'قد لا يكون هذا المزود معتمداً أو متاحاً حالياً.' : 'This provider may not be approved or available right now.'}</p>
          <button class="btn btn-primary" onclick="window.Qareeb.actions.setCustomerView('search')">
            ${t("btnBackToSearch") || (currentLang === 'ar' ? 'العودة للبحث' : 'Back to Search')}
          </button>
        </div>
      </div>
    `;
  }
  const name = currentLang === "ar" ? provider.nameAr : provider.nameEn;
  const bio = currentLang === "ar" ? provider.bioAr : provider.bioEn;
  const address = currentLang === "ar" ? provider.addressAr : provider.addressEn;
  const neighborhood = currentLang === "ar" ? provider.neighborhoodAr : provider.neighborhoodEn;
  const slot = currentLang === "ar" ? provider.nextAvailableSlotAr : provider.nextAvailableSlotEn;

  return `
    <div class="provider-profile-page animate-fade-in pb-12">
      <!-- Hero Cover & Business Header -->
      <section class="profile-hero-section" style="position: relative; background: var(--bg-surface); border-bottom: 1px solid var(--border-default);">
        <div style="height: 280px; width: 100%; overflow: hidden; position: relative;">
          <img src="${provider.heroImage}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%);"></div>
          
          <div class="container" style="position: absolute; top: 1.25rem; inset-inline: 0;">
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              style="backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.75); color: #FFFFFF; border-color: rgba(255, 255, 255, 0.2);"
              onclick="window.Qareeb.actions.setCustomerView('search')"
            >
              <span class="icon-flip-rtl">←</span>
              <span>${currentLang === 'ar' ? 'الرجوع إلى نتائج البحث' : 'Back to Search'}</span>
            </button>
          </div>
        </div>

        <div class="container" style="position: relative; margin-top: -3.5rem; padding-bottom: 2rem;">
          <div class="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style="box-shadow: var(--shadow-xl);">
            <!-- Avatar & Details -->
            <div class="flex items-center gap-5 flex-wrap">
              <div style="width: 5.5rem; height: 5.5rem; border-radius: var(--radius-xl); overflow: hidden; border: 3px solid var(--bg-surface); box-shadow: var(--shadow-md); flex-shrink: 0; background: var(--bg-surface-subtle);">
                <img src="${provider.avatarImage}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>

              <div>
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <h1 class="text-2xl font-extrabold text-primary">${name}</h1>
                  <span class="badge badge-emerald">✓ ${t("verifiedBusiness")}</span>
                  ${provider.badges.includes("topRated") ? `<span class="badge badge-amber">★ ${t("badgeTopRated")}</span>` : ''}
                </div>

                <div class="flex items-center gap-4 text-xs text-secondary flex-wrap">
                  <span class="flex items-center gap-1 font-semibold text-brand" style="font-size: 0.95rem;">
                    ★ ${provider.rating.toFixed(1)} <span class="text-muted font-normal">(${provider.reviewsCount} ${currentLang === 'ar' ? 'تقييم' : 'reviews'})</span>
                  </span>
                  <span>•</span>
                  <span>📍 ${neighborhood}</span>
                  <span>•</span>
                  <span class="text-brand font-medium">🕒 ${slot}</span>
                </div>
              </div>
            </div>

            <!-- Prominent Book Action Button -->
            <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <button 
                type="button" 
                class="btn btn-primary btn-lg w-full md:w-auto" 
                style="padding: 0.85rem 2.25rem; font-size: 1.05rem;"
                onclick="window.Qareeb.actions.openBookingModal('${provider.id}')"
              >
                <span>📅</span>
                <span>${t("btnQuickBook")}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Profile Content: 2-Column Responsive Layout -->
      <div class="container mt-6">
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          
          <!-- Left Main Content Column: Services, Highlights, Gallery, Reviews -->
          <main class="flex-1 w-full flex flex-col gap-8">
            
            <!-- Bio & Highlights Card -->
            <section class="card p-6">
              <h2 class="text-lg font-bold mb-3">${t("aboutProvider")}</h2>
              <p class="text-secondary text-sm leading-relaxed mb-6">${bio}</p>

              ${(provider.highlights || []).length ? `
                <h3 class="text-sm font-bold uppercase text-muted tracking-wider mb-3">${t("businessHighlights")}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${provider.highlights.map(hlKey => `
                    <div class="flex items-center gap-2 p-2 rounded-md" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle);">
                      <span style="color: var(--primary); font-size: 1rem;">✨</span>
                      <span class="text-xs font-semibold">${t(hlKey)}</span>
                    </div>
                  `).join("")}
                </div>
              ` : ''}
            </section>

            <!-- Service Menu & Pricing Card -->
            <section class="card p-6" id="service-menu-section">
              <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
                <div>
                  <h2 class="text-xl font-bold">${t("serviceMenu")}</h2>
                  <p class="text-xs text-secondary">${currentLang === 'ar' ? 'حدد الخدمة المطلوبة لحجز موعد فوري' : 'Choose a service to begin instant appointment scheduling'}</p>
                </div>
                <span class="badge badge-gray">${provider.services.length} ${currentLang === 'ar' ? 'خدمات' : 'services'}</span>
              </div>

              <div class="flex flex-col gap-4">
                ${provider.services.map(srv => {
                  const srvTitle = currentLang === "ar" ? srv.titleAr : srv.titleEn;
                  const srvDesc = currentLang === "ar" ? srv.descAr : srv.descEn;
                  const srvCat = currentLang === "ar" ? srv.categoryAr : srv.categoryEn;

                  return `
                    <div class="p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default); transition: border-color var(--transition-fast);">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h3 class="font-bold text-base text-primary">${srvTitle}</h3>
                          <span class="badge badge-gray" style="font-size: 0.7rem;">${srvCat}</span>
                        </div>
                        <p class="text-xs text-secondary mb-2 leading-relaxed">${srvDesc}</p>
                        <div class="flex items-center gap-3 text-xs text-muted font-medium">
                          <span>⏱️ ${srv.duration} ${currentLang === 'ar' ? 'دقيقة' : 'min'}</span>
                        </div>
                      </div>

                      <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 flex-shrink-0">
                        <div class="text-lg font-extrabold text-primary">
                          ${window.Qareeb.formatCurrency(srv.price, currentLang)}
                        </div>
                        <button 
                          type="button" 
                          class="btn btn-primary btn-sm"
                          onclick="window.Qareeb.actions.openBookingModal('${provider.id}', { id: '${srv.id}', titleEn: '${srv.titleEn.replace(/'/g, "\\'")}', titleAr: '${srv.titleAr.replace(/'/g, "\\'")}', price: ${srv.price}, duration: ${srv.duration} })"
                        >
                          <span>+</span>
                          <span>${t("btnQuickBook")}</span>
                        </button>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </section>

            <!-- Venue & Work Gallery Section -->
            <section class="card p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold">${t("galleryTitle")}</h2>
                <div class="flex gap-2">
                  <span class="badge badge-amber">${t("tabVenue")}</span>
                  <span class="badge badge-gray">${t("tabWork")}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                ${provider.gallery.map(img => {
                  const caption = currentLang === "ar" ? img.captionAr : img.captionEn;
                  return `
                    <div class="rounded-lg overflow-hidden relative" style="height: 120px; background: var(--bg-surface-subtle); border: 1px solid var(--border-default); cursor: pointer;" onclick="window.Qareeb.actions.addToast('${caption}', 'info')">
                      <img src="${img.url}" alt="${caption}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                      <div class="text-xs p-1" style="position: absolute; bottom: 0; inset-inline: 0; background: rgba(0,0,0,0.65); color: #FFF; font-size: 0.6875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${caption}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </section>

            <!-- Customer Ratings & Reviews Section -->
            <section class="card p-6">
              <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
                <div>
                  <h2 class="text-xl font-bold">${t("clientReviews")}</h2>
                  <p class="text-xs text-secondary">${t("basedOnReviews", { count: provider.reviewsCount })}</p>
                </div>

                <button 
                  type="button" 
                  class="btn btn-secondary btn-sm"
                  onclick="window.Qareeb.actions.addToast(window.Qareeb.t('reviewModalTitle') + ': ' + (window.Qareeb.state.currentLang === 'ar' ? 'شكراً لاهتمامك بمشاركة تجربتك!' : 'Thank you for your feedback!'), 'success')"
                >
                  ✍️ ${t("btnWriteReview")}
                </button>
              </div>

              <!-- Rating Score Meter Breakdown -->
              <div class="p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-6" style="background: var(--bg-surface-subtle);">
                <div class="text-center sm:border-inline-end sm:pe-6" style="border-color: var(--border-default);">
                  <div class="text-4xl font-extrabold text-primary mb-1">${provider.rating.toFixed(1)}</div>
                  <div class="text-brand text-base mb-1">★★★★★</div>
                  <div class="text-xs text-muted">${t("ratingOverall")}</div>
                </div>

                <div class="flex-1 w-full flex flex-col gap-1 text-xs">
                  <div class="flex items-center gap-2">
                    <span style="width: 2rem;">5 ★</span>
                    <div style="flex: 1; height: 6px; background: var(--border-default); border-radius: 99px; overflow: hidden;">
                      <div style="width: 88%; height: 100%; background: var(--primary);"></div>
                    </div>
                    <span class="text-muted">88%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span style="width: 2rem;">4 ★</span>
                    <div style="flex: 1; height: 6px; background: var(--border-default); border-radius: 99px; overflow: hidden;">
                      <div style="width: 10%; height: 100%; background: var(--primary);"></div>
                    </div>
                    <span class="text-muted">10%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span style="width: 2rem;">3 ★</span>
                    <div style="flex: 1; height: 6px; background: var(--border-default); border-radius: 99px; overflow: hidden;">
                      <div style="width: 2%; height: 100%; background: var(--primary);"></div>
                    </div>
                    <span class="text-muted">2%</span>
                  </div>
                </div>
              </div>

              <!-- Reviews List -->
              <div class="flex flex-col gap-4">
                ${provider.reviews.map(rev => {
                  const author = currentLang === "ar" ? rev.authorAr : rev.authorEn;
                  const date = currentLang === "ar" ? rev.dateAr : rev.dateEn;
                  const text = currentLang === "ar" ? rev.textAr : rev.textEn;
                  const reply = currentLang === "ar" ? rev.replyAr : rev.replyEn;

                  return `
                    <div class="p-4 rounded-lg" style="border: 1px solid var(--border-subtle); background: var(--bg-surface);">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <div style="width: 2rem; height: 2rem; border-radius: 50%; background: var(--primary-subtle); color: var(--primary); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                            ${author.charAt(0)}
                          </div>
                          <div>
                            <span class="font-bold text-sm text-primary block">${author}</span>
                            <span class="text-xs text-muted">${date} • <span class="badge badge-emerald" style="padding: 0 0.4rem; font-size: 0.65rem;">✓ ${t("verifiedCustomer")}</span></span>
                          </div>
                        </div>

                        <div class="text-brand text-xs font-bold">
                          ${"★".repeat(rev.rating)}
                        </div>
                      </div>

                      <p class="text-xs text-secondary leading-relaxed mb-3">${text}</p>

                      ${reply ? `
                        <div class="p-3 rounded-md mt-2" style="background: var(--bg-surface-subtle); border-inline-start: 3px solid var(--primary); font-size: 0.75rem;">
                          <div class="font-bold text-primary mb-1">
                            ${currentLang === 'ar' ? 'رد من إدارة المركز:' : 'Response from Management:'}
                          </div>
                          <p class="text-secondary">${reply}</p>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join("")}
              </div>
            </section>
          </main>

          <!-- Right Sidebar: Location, Interactive Vector Map, Social & Direct Contact -->
          <aside class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6" style="position: sticky; top: 5rem;">
            
            <!-- Location & Vector Map Placeholder Card -->
            <section class="card p-6">
              <h3 class="text-base font-bold mb-3">${t("contactAndLocation")}</h3>
              
              <div class="mb-4">
                <div class="text-xs text-muted mb-1 font-semibold uppercase">Address</div>
                <div class="text-sm text-primary font-medium mb-2">${address}</div>
                <button 
                  type="button" 
                  class="btn btn-secondary btn-sm w-full"
                  onclick="navigator.clipboard && navigator.clipboard.writeText('${address.replace(/'/g, "\\'")}'); window.Qareeb.actions.addToast('${t("addressCopied")}', 'success')"
                >
                  📋 ${currentLang === 'ar' ? 'نسخ العنوان' : 'Copy Address'}
                </button>
              </div>

              <!-- Interactive Custom Vector Map Placeholder -->
              <div class="vector-map-box mb-4">
                <!-- SVG Vector Grid & Streets -->
                <svg class="vector-map-grid" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
                  <!-- Road grid lines -->
                  <path d="M 0,40 L 400,40 M 0,110 L 400,110 M 0,170 L 400,170" stroke="#CBD5E1" stroke-width="4" fill="none" />
                  <path d="M 60,0 L 60,220 M 160,0 L 160,220 M 270,0 L 270,220 M 350,0 L 350,220" stroke="#CBD5E1" stroke-width="4" fill="none" />
                  <path d="M 0,90 Q 200,60 400,140" stroke="#D97706" stroke-width="6" fill="none" opacity="0.6" />
                  <!-- City zones -->
                  <rect x="70" y="50" width="80" height="50" rx="6" fill="#0F766E" opacity="0.15" />
                  <rect x="170" y="120" width="90" height="40" rx="6" fill="#D97706" opacity="0.15" />
                  <rect x="280" y="50" width="60" height="50" rx="6" fill="#64748B" opacity="0.12" />
                </svg>

                <!-- Center Animated Pin -->
                <div class="map-pin-pulse">
                  <div class="map-pin-bubble">
                    📍 ${name}
                  </div>
                  <div style="width: 12px; height: 12px; background: var(--primary); border: 2px solid #FFF; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.4);"></div>
                </div>

                <!-- Overlay Controls -->
                <div class="map-overlay-controls">
                  <span class="badge badge-gray" style="backdrop-filter: blur(8px); background: rgba(15, 23, 42, 0.7); color: #FFF; font-size: 0.6875rem;">
                    🗺️ ${currentLang === 'ar' ? 'خريطة تفاعلية تجريبية' : 'Interactive Map Demo'}
                  </span>
                  <button 
                    type="button" 
                    class="btn btn-primary btn-sm"
                    style="padding: 0.25rem 0.65rem; font-size: 0.75rem;"
                    onclick="window.Qareeb.actions.addToast('${t("btnDirections")}: ' + '${address.replace(/'/g, "\\'")}', 'info')"
                  >
                    ${t("btnDirections")}
                  </button>
                </div>
              </div>

              <!-- Direct Contact & Social Links from the public provider record -->
              <div class="flex flex-col gap-2">
                ${provider.phone ? `
                  <a href="tel:${provider.phone.replace(/[^+\d]/g, "")}" class="btn btn-secondary btn-sm justify-start" dir="ltr">
                    <span style="font-size: 1.1rem;">📞</span>
                    <span class="font-bold">${currentLang === 'ar' ? 'اتصال مباشر' : 'Call provider'}</span>
                    <span class="text-xs text-muted ms-auto">${provider.phone}</span>
                  </a>
                ` : ''}
                ${provider.whatsapp ? `
                  <a
                    href="javascript:void(0)"
                    class="btn btn-secondary btn-sm justify-start"
                    style="border-color: #25D366; color: #16A34A;"
                    onclick="window.Qareeb.actions.addToast('WhatsApp (' + ${JSON.stringify(provider.whatsapp)} + '): ' + ${JSON.stringify(t("socialDemoAlert"))}, 'info')"
                  >
                    <span style="font-size: 1.1rem;">💬</span>
                    <span class="font-bold">${t("btnChatWhatsapp")}</span>
                    <span class="text-xs text-muted ms-auto" dir="ltr">${provider.whatsapp}</span>
                  </a>
                ` : ''}
                ${provider.instagram ? `
                  <a
                    href="javascript:void(0)"
                    class="btn btn-secondary btn-sm justify-start"
                    style="color: #E1306C;"
                    onclick="window.Qareeb.actions.addToast('Instagram (' + ${JSON.stringify(provider.instagram)} + '): ' + ${JSON.stringify(t("socialDemoAlert"))}, 'info')"
                  >
                    <span style="font-size: 1.1rem;">📸</span>
                    <span>${t("btnInstagram")}</span>
                    <span class="text-xs text-muted ms-auto" dir="ltr">${provider.instagram}</span>
                  </a>
                ` : ''}
                ${provider.facebook ? `
                  <a
                    href="javascript:void(0)"
                    class="btn btn-secondary btn-sm justify-start"
                    style="color: #1877F2;"
                    onclick="window.Qareeb.actions.addToast('Facebook (' + ${JSON.stringify(provider.facebook)} + '): ' + ${JSON.stringify(t("socialDemoAlert"))}, 'info')"
                  >
                    <span style="font-size: 1.1rem;">🌐</span>
                    <span>${t("btnFacebook")}</span>
                  </a>
                ` : ''}
              </div>
            </section>

            <!-- Published Opening Hours -->
            <section class="card p-6">
              <h3 class="text-base font-bold mb-3">${currentLang === 'ar' ? 'ساعات العمل' : 'Opening Hours'}</h3>
              <div class="flex flex-col gap-2">
                ${(provider.hours || []).map(h => {
                  const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  const daysAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
                  const day = currentLang === "ar" ? daysAr[h.day] : daysEn[h.day];
                  return `
                    <div class="flex items-center justify-between text-xs p-2 rounded-md" style="background: var(--bg-surface-subtle);">
                      <span class="font-semibold text-primary">${day}</span>
                      <span class="text-secondary" dir="ltr">${h.opensAt} – ${h.closesAt}</span>
                    </div>
                  `;
                }).join("") || `<div class="text-xs text-muted">${currentLang === 'ar' ? 'لا توجد ساعات منشورة' : 'No hours published'}</div>`}
              </div>
            </section>

            <!-- Working Staff Specialists -->
            <section class="card p-6">
              <h3 class="text-base font-bold mb-3">${currentLang === 'ar' ? 'فريق العمل والخبراء' : 'Specialist Team'}</h3>
              <div class="flex flex-col gap-3">
                ${provider.staff.map(member => {
                  const staffName = currentLang === "ar" ? member.nameAr : member.nameEn;
                  const staffTitle = currentLang === "ar" ? (member.titleAr || "") : (member.titleEn || "");

                  return `
                    <div class="flex items-center gap-3 p-2 rounded-md" style="background: var(--bg-surface-subtle);">
                      ${member.image
                        ? `<img src="${member.image}" alt="${staffName}" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover;" />`
                        : `<div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--primary-subtle); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">${staffName.charAt(0)}</div>`}
                      <div class="flex-1">
                        <div class="text-xs font-bold text-primary">${staffName}</div>
                        <div class="text-xs text-muted">${staffTitle}</div>
                      </div>
                      ${member.rating ? `<span class="text-xs font-bold text-brand">★ ${member.rating}</span>` : ''}
                    </div>
                  `;
                }).join("")}
              </div>
            </section>

          </aside>
        </div>
      </div>
    </div>
  `;
};
