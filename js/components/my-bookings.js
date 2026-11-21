/**
 * Qareeb (قريب) — Customer "My Bookings" Screen
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.MyBookings = function() {
  const { customerBookings, currentLang } = window.Qareeb.state;
  const t = window.Qareeb.t;

  // We maintain local tab state inside closure or window
  window.Qareeb._myBookingsTab = window.Qareeb._myBookingsTab || "upcoming";
  const activeTab = window.Qareeb._myBookingsTab;

  const upcomingList = customerBookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const pastList = customerBookings.filter(b => b.status === "completed");
  const cancelledList = customerBookings.filter(b => b.status === "cancelled" || b.status === "rejected");

  let displayList = [];
  if (activeTab === "upcoming") displayList = upcomingList;
  else if (activeTab === "past") displayList = pastList;
  else if (activeTab === "cancelled") displayList = cancelledList;

  function renderStatusBadge(status) {
    if (status === "confirmed") return `<span class="badge badge-emerald">✓ ${t("statusConfirmed")}</span>`;
    if (status === "pending") return `<span class="badge badge-amber">⏳ ${t("statusPending")}</span>`;
    if (status === "completed") return `<span class="badge badge-info">✓ ${t("statusCompleted")}</span>`;
    if (status === "cancelled") return `<span class="badge badge-danger">✕ ${t("statusCancelled")}</span>`;
    return `<span class="badge badge-gray">${status}</span>`;
  }

  return `
    <div class="my-bookings-page py-8 animate-fade-in">
      <div class="container container-narrow">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center gap-2 text-xs text-muted mb-1">
            <span style="cursor: pointer;" onclick="window.Qareeb.actions.setCustomerView('home')">${t("navHome")}</span>
            <span class="icon-flip-rtl">/</span>
            <span class="text-secondary font-medium">${t("myBookingsTitle")}</span>
          </div>
          <h1 class="text-3xl font-extrabold mb-1">${t("myBookingsTitle")}</h1>
          <p class="text-sm text-secondary">${t("myBookingsSubtitle")}</p>
        </div>

        <!-- Filter Tabs -->
        <div class="tab-list">
          <button 
            type="button" 
            class="tab-btn ${activeTab === 'upcoming' ? 'active' : ''}" 
            onclick="window.Qareeb._myBookingsTab = 'upcoming'; window.Qareeb.actions.setCustomerView('my-bookings');"
          >
            <span>📅 ${t("tabUpcoming")}</span>
            <span class="badge badge-amber" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${upcomingList.length}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeTab === 'past' ? 'active' : ''}" 
            onclick="window.Qareeb._myBookingsTab = 'past'; window.Qareeb.actions.setCustomerView('my-bookings');"
          >
            <span>✓ ${t("tabPast")}</span>
            <span class="badge badge-gray" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${pastList.length}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeTab === 'cancelled' ? 'active' : ''}" 
            onclick="window.Qareeb._myBookingsTab = 'cancelled'; window.Qareeb.actions.setCustomerView('my-bookings');"
          >
            <span>✕ ${t("tabCancelled")}</span>
            <span class="badge badge-gray" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${cancelledList.length}</span>
          </button>
        </div>

        <!-- Bookings Cards List -->
        <div class="flex flex-col gap-4">
          ${displayList.length === 0 ? `
            <div class="card p-12 text-center">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🗓️</div>
              <h3 class="text-lg font-bold mb-2">${currentLang === 'ar' ? 'لا توجد حجوزات في هذه القائمة' : 'No appointments in this category'}</h3>
              <p class="text-xs text-secondary mb-4">${currentLang === 'ar' ? 'استكشف المراكز القريبة واحجز موعدك القادم بسهولة.' : 'Explore neighborhood centers and book your next session today.'}</p>
              <button class="btn btn-primary btn-sm" onclick="window.Qareeb.actions.setCustomerView('search')">
                ${t("navExplore")}
              </button>
            </div>
          ` : `
            ${displayList.map(booking => {
              const providerName = currentLang === "ar" ? booking.providerNameAr : booking.providerNameEn;
              const serviceName = currentLang === "ar" ? booking.serviceNameAr : booking.serviceNameEn;
              const specialistName = currentLang === "ar" ? booking.specialistNameAr : booking.specialistNameEn;

              return `
                <article class="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style="border-inline-start: 4px solid var(--primary);">
                  <!-- Booking Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2 flex-wrap">
                      <span class="text-xs font-bold text-muted">#${booking.id}</span>
                      ${renderStatusBadge(booking.status)}
                      <span class="text-xs text-muted">Created: ${booking.createdAt}</span>
                    </div>

                    <h2 class="text-xl font-bold text-primary mb-1">${providerName}</h2>
                    <div class="text-sm font-semibold text-brand mb-2">
                      ✂️ ${serviceName}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-secondary">
                      <div>
                        <span class="text-muted">${currentLang === 'ar' ? 'الموعد:' : 'Schedule:'}</span>
                        <strong>${booking.dateStr} @ ${booking.timeStr}</strong>
                      </div>
                      <div>
                        <span class="text-muted">${currentLang === 'ar' ? 'الأخصائي:' : 'Specialist:'}</span>
                        <span>${specialistName}</span>
                      </div>
                      <div>
                        <span class="text-muted">${currentLang === 'ar' ? 'المدة:' : 'Duration:'}</span>
                        <span>${booking.duration} min</span>
                      </div>
                      <div>
                        <span class="text-muted">${currentLang === 'ar' ? 'السعر للدفع:' : 'Price:'}</span>
                        <strong class="text-primary">$${booking.price}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Actions Column -->
                  <div class="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto flex-shrink-0 pt-4 sm:pt-0" style="border-top: 1px solid var(--border-subtle);">
                    ${booking.status === 'confirmed' || booking.status === 'pending' ? `
                      <button 
                        type="button" 
                        class="btn btn-secondary btn-sm w-full sm:w-auto"
                        onclick="window.Qareeb.actions.rescheduleCustomerBooking('${booking.id}')"
                      >
                        🔄 ${t("btnReschedule")}
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-danger btn-sm w-full sm:w-auto"
                        onclick="if(confirm('${t("confirmCancelPrompt")}')) window.Qareeb.actions.cancelCustomerBooking('${booking.id}')"
                      >
                        ✕ ${t("btnCancelBooking")}
                      </button>
                    ` : `
                      <button 
                        type="button" 
                        class="btn btn-primary btn-sm w-full sm:w-auto"
                        onclick="window.Qareeb.actions.openBookingModal('${booking.providerId}')"
                      >
                        ⚡ ${t("btnRebook")}
                      </button>
                    `}
                  </div>
                </article>
              `;
            }).join("")}
          `}
        </div>
      </div>
    </div>
  `;
};
