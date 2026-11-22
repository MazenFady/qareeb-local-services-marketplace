/**
 * Qareeb (قريب) — Service Provider Portal & Operations Hub
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.ProviderPortal = function() {
  const { 
    activeProviderTab, 
    providerSchedule, 
    incomingRequests, 
    providerServices, 
    providerHours, 
    vacationMode, 
    currentLang 
  } = window.Qareeb.state;
  const { providers } = window.Qareeb.mockData;
  const t = window.Qareeb.t;

  const currentProvider = providers[0]; // The Royal Fade Lounge
  const providerName = currentLang === "ar" ? currentProvider.nameAr : currentProvider.nameEn;

  // If in Preview Mode, render the public profile with a preview header banner!
  if (activeProviderTab === "preview") {
    return `
      <div class="provider-preview-container animate-fade-in">
        <aside class="p-3 text-center flex items-center justify-between gap-4" style="background: linear-gradient(90deg, #0F766E 0%, #115E59 100%); color: #FFF; position: sticky; top: 4.25rem; z-index: 80;">
          <div class="container flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span style="font-size: 1.25rem;">👁️</span>
              <span class="text-xs sm:text-sm font-semibold">${t("providerPublicPreviewBanner")}</span>
            </div>
            <button 
              type="button" 
              class="btn btn-secondary btn-sm"
              style="background: #FFF; color: #0F766E; font-weight: 700;"
              onclick="window.Qareeb.actions.setProviderTab('dashboard')"
            >
              <span class="icon-flip-rtl">←</span>
              <span>${t("btnReturnToDashboard")}</span>
            </button>
          </div>
        </aside>
        ${window.Qareeb.components.ProviderProfile()}
      </div>
    `;
  }

  // Calculate live stats
  const completedCount = providerSchedule.filter(s => s.status === "completed").length;
  const totalRevenue = providerSchedule.reduce((sum, s) => sum + s.price, 0);

  return `
    <div class="provider-portal py-8 animate-fade-in">
      <div class="container">
        
        <!-- Header Bar -->
        <div class="card p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style="background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%);">
          <div class="flex items-center gap-4">
            <div style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius-lg); overflow: hidden; border: 2px solid var(--primary); flex-shrink: 0;">
              <img src="${currentProvider.avatarImage}" alt="${providerName}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-extrabold text-primary">${providerName}</h1>
                <span class="badge badge-amber">${t("roleProvider")}</span>
                ${vacationMode ? `<span class="badge badge-danger">⏸️ Vacation Mode</span>` : `<span class="badge badge-emerald">● Live & Online</span>`}
              </div>
              <p class="text-xs text-secondary mt-1">${t("providerPortalSub")}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button 
              type="button" 
              class="btn btn-secondary btn-sm"
              onclick="window.Qareeb.actions.setProviderTab('preview')"
            >
              <span>👁️</span>
              <span>${t("navProviderPreview")}</span>
            </button>
            <button 
              type="button" 
              class="btn ${vacationMode ? 'btn-emerald' : 'btn-danger'} btn-sm"
              onclick="window.Qareeb.actions.toggleVacationMode()"
            >
              <span>${vacationMode ? '▶' : '⏸'}</span>
              <span>${vacationMode ? (currentLang === 'ar' ? 'استئناف الحجوزات' : 'Resume Bookings') : (currentLang === 'ar' ? 'إجازة مؤقتة' : 'Take a Break')}</span>
            </button>
          </div>
        </div>

        <!-- Navigation Sub-Tabs -->
        <div class="tab-list">
          <button 
            type="button" 
            class="tab-btn ${activeProviderTab === 'dashboard' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setProviderTab('dashboard')"
          >
            <span>📅 ${t("navProviderSchedule")}</span>
            ${incomingRequests.length > 0 ? `<span class="badge badge-amber" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${incomingRequests.length}</span>` : ''}
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeProviderTab === 'services' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setProviderTab('services')"
          >
            <span>✂️ ${t("navProviderServices")}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeProviderTab === 'hours' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setProviderTab('hours')"
          >
            <span>🕒 ${t("navProviderHours")}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeProviderTab === 'reviews' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setProviderTab('reviews')"
          >
            <span>⭐ ${t("navProviderReviews")}</span>
          </button>
        </div>

        <!-- ==================================================================
             TAB 1: Schedule & Incoming Requests
             ================================================================== -->
        ${activeProviderTab === 'dashboard' ? `
          <div>
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--primary-subtle); color: var(--primary);">📅</div>
                <div>
                  <div class="stat-kpi-value">${providerSchedule.length}</div>
                  <div class="stat-kpi-label">${t("statTodayBookings")}</div>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--secondary-subtle); color: var(--secondary);">⏳</div>
                <div>
                  <div class="stat-kpi-value text-brand">${incomingRequests.length}</div>
                  <div class="stat-kpi-label">${t("statPendingCount")}</div>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--success-subtle); color: var(--success-text);">💰</div>
                <div>
                  <div class="stat-kpi-value text-success">${window.Qareeb.formatCurrency(totalRevenue, currentLang)}</div>
                  <div class="stat-kpi-label">${t("statTodayEarnings")}</div>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--info-subtle); color: var(--info-text);">📊</div>
                <div>
                  <div class="stat-kpi-value">85%</div>
                  <div class="stat-kpi-label">${t("statOccupancy")}</div>
                </div>
              </div>
            </div>

            <!-- 2 Columns: Incoming Requests & Today's Schedule -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              <!-- Left Column: Incoming Requests Queue -->
              <section class="card p-6" style="border-inline-start: 4px solid var(--primary);">
                <div class="flex items-center justify-between mb-4 pb-2" style="border-bottom: 1px solid var(--border-default);">
                  <div>
                    <h2 class="text-lg font-bold">${t("pendingRequests")}</h2>
                    <p class="text-xs text-secondary">${currentLang === 'ar' ? 'طلبات جديدة تحتاج لموافقة المدير أو الإلغاء' : 'New requests awaiting confirmation or decline'}</p>
                  </div>
                  <span class="badge badge-amber">${incomingRequests.length} ${currentLang === 'ar' ? 'جديد' : 'new'}</span>
                </div>

                <div class="flex flex-col gap-4">
                  ${incomingRequests.length === 0 ? `
                    <div class="p-8 text-center text-muted text-sm">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                      <p>${t("noPendingRequests")}</p>
                    </div>
                  ` : `
                    ${incomingRequests.map(req => {
                      const srvName = currentLang === "ar" ? req.serviceAr : req.serviceEn;
                      const timeStr = currentLang === "ar" ? req.timeAr : req.timeEn;
                      const spec = currentLang === "ar" ? req.specialistAr : req.specialistEn;

                      return `
                        <div class="p-4 rounded-lg flex flex-col gap-3" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                          <div class="flex items-center justify-between">
                            <div>
                              <span class="font-bold text-sm text-primary block">${req.clientName}</span>
                              <span class="text-xs text-muted">📞 ${req.phone}</span>
                            </div>
                            <span class="font-extrabold text-brand text-base">${window.Qareeb.formatCurrency(req.price, currentLang)}</span>
                          </div>

                          <div class="text-xs text-secondary">
                            <div><strong>Service:</strong> ${srvName}</div>
                            <div><strong>Time:</strong> ${timeStr} • <strong>Specialist:</strong> ${spec}</div>
                          </div>

                          <div class="flex items-center justify-end gap-2 pt-2" style="border-top: 1px solid var(--border-subtle);">
                            <button 
                              type="button" 
                              class="btn btn-danger btn-sm"
                              onclick="window.Qareeb.actions.rejectIncomingRequest('${req.id}')"
                            >
                              ✕ ${t("btnRejectRequest")}
                            </button>
                            <button 
                              type="button" 
                              class="btn btn-emerald btn-sm"
                              onclick="window.Qareeb.actions.acceptIncomingRequest('${req.id}')"
                            >
                              ✓ ${t("btnAcceptRequest")}
                            </button>
                          </div>
                        </div>
                      `;
                    }).join("")}
                  `}
                </div>
              </section>

              <!-- Right Column: Today's Schedule Timeline -->
              <section class="card p-6">
                <div class="flex items-center justify-between mb-4 pb-2" style="border-bottom: 1px solid var(--border-default);">
                  <div>
                    <h2 class="text-lg font-bold">${t("todaySchedule")}</h2>
                    <p class="text-xs text-secondary">${providerSchedule.length} ${currentLang === 'ar' ? 'جلسة مجدولة لليوم' : 'appointments on today’s calendar'}</p>
                  </div>
                  <span class="badge badge-emerald">✓ ${completedCount} ${currentLang === 'ar' ? 'مكتمل' : 'completed'}</span>
                </div>

                <div class="flex flex-col">
                  ${providerSchedule.map(slot => {
                    const srvName = currentLang === "ar" ? slot.serviceAr : slot.serviceEn;
                    const spec = currentLang === "ar" ? slot.specialistAr : slot.specialistEn;
                    const isDone = slot.status === "completed";

                    return `
                      <div class="timeline-item">
                        <div class="timeline-time">${slot.time}</div>
                        <div class="timeline-card ${isDone ? 'opacity-70' : ''}">
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-bold text-sm text-primary">${slot.clientName}</span>
                            <span class="badge ${isDone ? 'badge-gray' : 'badge-emerald'}" style="font-size: 0.7rem;">
                              ${isDone ? t("statusCompleted") : t("statusConfirmed")}
                            </span>
                          </div>

                          <div class="text-xs text-secondary mb-2">
                            <span>${srvName}</span> • <span class="text-muted">${spec}</span>
                          </div>

                          <div class="flex items-center justify-between text-xs pt-2" style="border-top: 1px solid var(--border-subtle);">
                            <span class="font-bold text-primary">${window.Qareeb.formatCurrency(slot.price, currentLang)}</span>
                            ${!isDone ? `
                              <button 
                                type="button" 
                                class="btn btn-primary btn-sm py-1 px-2" 
                                style="font-size: 0.75rem;"
                                onclick="window.Qareeb.actions.completeScheduleBooking('${slot.id}')"
                              >
                                ✓ ${t("btnCompleteBooking")}
                              </button>
                            ` : `
                              <span class="text-muted text-xs">✓ Done</span>
                            `}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </section>

            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 2: Services & Pricing Management
             ================================================================== -->
        ${activeProviderTab === 'services' ? `
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("btnManageServices")}</h2>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'إضافة وتعديل الخدمات والأسعار ومدد الجلسات المعروضة للعملاء' : 'Manage your service menu, pricing, and treatment durations'}</p>
              </div>

              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                onclick="document.getElementById('add-service-box').classList.toggle('hidden')"
              >
                + ${t("btnAddService")}
              </button>
            </div>

            <!-- Inline Add Service Mock Form (Toggleable) -->
            <div id="add-service-box" class="p-4 rounded-lg mb-6 hidden" style="background: var(--bg-surface-subtle); border: 1.5px dashed var(--primary);">
              <h3 class="font-bold text-sm mb-3">${t("btnAddService")}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label class="form-label">${t("serviceName")} (EN)</label>
                  <input type="text" id="new-srv-name-en" class="form-input text-xs" placeholder="e.g. Deluxe Scalp Detox" />
                </div>
                <div>
                  <label class="form-label">${t("serviceName")} (AR)</label>
                  <input type="text" id="new-srv-name-ar" class="form-input text-xs" placeholder="مثال: تنظيف فروة الرأس الفاخر" />
                </div>
                <div>
                  <label class="form-label">${t("servicePrice")}</label>
                  <input type="number" id="new-srv-price" class="form-input text-xs" placeholder="250" />
                </div>
                <div>
                  <label class="form-label">${t("serviceDuration")}</label>
                  <input type="number" id="new-srv-duration" class="form-input text-xs" placeholder="30" />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('add-service-box').classList.add('hidden')">Cancel</button>
                <button 
                  type="button" 
                  class="btn btn-primary btn-sm"
                  onclick="
                    const en = document.getElementById('new-srv-name-en').value;
                    const ar = document.getElementById('new-srv-name-ar').value;
                    const pr = document.getElementById('new-srv-price').value;
                    const du = document.getElementById('new-srv-duration').value;
                    if(en || ar) {
                      window.Qareeb.actions.addProviderService({ titleEn: en || ar, titleAr: ar || en, price: pr || 50, duration: du || 45 });
                      document.getElementById('add-service-box').classList.add('hidden');
                    }
                  "
                >
                  ${t("btnSaveService")}
                </button>
              </div>
            </div>

            <!-- Services Table -->
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("serviceName")}</th>
                    <th>${t("serviceCategory")}</th>
                    <th>${t("servicePrice")}</th>
                    <th>${t("serviceDuration")}</th>
                    <th>${t("serviceStatus")}</th>
                    <th style="text-align: end;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${providerServices.map(srv => {
                    const title = currentLang === "ar" ? srv.titleAr : srv.titleEn;
                    const cat = currentLang === "ar" ? srv.categoryAr : srv.categoryEn;

                    return `
                      <tr>
                        <td>
                          <div class="font-bold text-primary">${title}</div>
                          <div class="text-xs text-muted">${srv.descEn || ''}</div>
                        </td>
                        <td><span class="badge badge-gray">${cat}</span></td>
                        <td><strong>${window.Qareeb.formatCurrency(srv.price, currentLang)}</strong></td>
                        <td>${srv.duration} min</td>
                        <td><span class="badge badge-success">✓ ${t("serviceActive")}</span></td>
                        <td style="text-align: end;">
                          <button 
                            type="button" 
                            class="text-xs font-semibold text-brand"
                            onclick="window.Qareeb.actions.addToast('Edit service modal simulated for ' + '${title}', 'info')"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 3: Schedule & Working Hours
             ================================================================== -->
        ${activeProviderTab === 'hours' ? `
          <div class="card p-6" style="max-width: 780px; margin-inline: auto;">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("providerWorkingHoursTitle")}</h2>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'حدد أوقات بدء ونهاية العمل اليومية وأيام الراحة الأسبوعية' : 'Configure daily opening hours, shift windows, and weekly off days'}</p>
              </div>

              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                onclick="window.Qareeb.actions.addToast(window.Qareeb.t('scheduleSavedToast'), 'success')"
              >
                ${t("btnSaveSchedule")}
              </button>
            </div>

            <!-- Vacation Mode Switcher -->
            <div class="p-4 rounded-lg mb-6 flex items-center justify-between gap-4" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
              <div>
                <h4 class="font-bold text-sm text-primary mb-1">${t("vacationModeToggle")}</h4>
                <p class="text-xs text-secondary">${t("vacationModeSub")}</p>
              </div>
              <button 
                type="button" 
                class="btn ${vacationMode ? 'btn-danger' : 'btn-secondary'} btn-sm"
                onclick="window.Qareeb.actions.toggleVacationMode()"
              >
                ${vacationMode ? 'ON (Paused)' : 'OFF (Active)'}
              </button>
            </div>

            <!-- Days list -->
            <div class="flex flex-col gap-3">
              ${providerHours.map((item, idx) => `
                <div class="p-3 rounded-lg flex items-center justify-between gap-4" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle);">
                  <div style="width: 7rem;">
                    <span class="font-bold text-sm text-primary">${t(item.dayKey)}</span>
                  </div>

                  <div class="flex items-center gap-3 flex-1">
                    <input 
                      type="text" 
                      class="form-input text-xs py-1 px-2" 
                      style="width: 6.5rem;" 
                      value="${item.open}" 
                      ${!item.active ? 'disabled' : ''} 
                    />
                    <span class="text-muted text-xs">to</span>
                    <input 
                      type="text" 
                      class="form-input text-xs py-1 px-2" 
                      style="width: 6.5rem;" 
                      value="${item.close}" 
                      ${!item.active ? 'disabled' : ''} 
                    />
                  </div>

                  <div>
                    <button 
                      type="button" 
                      class="btn ${item.active ? 'btn-emerald' : 'btn-secondary'} btn-sm py-1 px-3 text-xs"
                      onclick="window.Qareeb.state.providerHours[${idx}].active = !window.Qareeb.state.providerHours[${idx}].active; window.Qareeb.actions.setProviderTab('hours');"
                    >
                      ${item.active ? t("hoursOpen") : t("hoursClosed")}
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 4: Reviews & Reputation Management
             ================================================================== -->
        ${activeProviderTab === 'reviews' ? `
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("providerReviewsTitle")}</h2>
                <p class="text-xs text-secondary">${currentLang === 'ar' ? 'الرد على تقييمات وملاحظات العملاء للحفاظ على سمعة المركز' : 'Respond to client ratings and build trust with prospective customers'}</p>
              </div>
              <span class="badge badge-amber font-bold text-sm">★ ${currentProvider.rating} / 5.0</span>
            </div>

            <div class="flex flex-col gap-4">
              ${currentProvider.reviews.map(rev => {
                const author = currentLang === "ar" ? rev.authorAr : rev.authorEn;
                const date = currentLang === "ar" ? rev.dateAr : rev.dateEn;
                const text = currentLang === "ar" ? rev.textAr : rev.textEn;
                const reply = currentLang === "ar" ? rev.replyAr : rev.replyEn;

                return `
                  <div class="p-4 rounded-lg" style="border: 1px solid var(--border-default); background: var(--bg-surface-subtle);">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-sm text-primary">${author}</span>
                        <span class="text-xs text-muted">• ${date}</span>
                      </div>
                      <span class="text-brand text-xs font-bold">${"★".repeat(rev.rating)}</span>
                    </div>

                    <p class="text-xs text-secondary mb-3">${text}</p>

                    ${reply ? `
                      <div class="p-3 rounded-md mb-2" style="background: var(--bg-surface); border-inline-start: 3px solid var(--primary); font-size: 0.75rem;">
                        <span class="font-bold text-primary block mb-1">Your response:</span>
                        <p class="text-secondary">${reply}</p>
                      </div>
                    ` : `
                      <div class="pt-2" style="border-top: 1px solid var(--border-subtle);">
                        <button 
                          type="button" 
                          class="btn btn-secondary btn-sm"
                          onclick="document.getElementById('reply-box-${rev.id}').classList.toggle('hidden')"
                        >
                          💬 ${t("btnReplyReview")}
                        </button>

                        <div id="reply-box-${rev.id}" class="mt-3 hidden">
                          <textarea id="reply-input-${rev.id}" class="form-textarea text-xs mb-2" rows="2" placeholder="${t("replyPlaceholder")}"></textarea>
                          <div class="flex justify-end gap-2">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('reply-box-${rev.id}').classList.add('hidden')">Cancel</button>
                            <button 
                              type="button" 
                              class="btn btn-primary btn-sm"
                              onclick="
                                const val = document.getElementById('reply-input-${rev.id}').value;
                                if(val) {
                                  window.Qareeb.actions.replyToReview('${rev.id}', val);
                                }
                              "
                            >
                              ${t("btnSendReply")}
                            </button>
                          </div>
                        </div>
                      </div>
                    `}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
};
