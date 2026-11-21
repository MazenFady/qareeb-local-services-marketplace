/**
 * Qareeb (قريب) — Platform Administrator Console
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.AdminPortal = function() {
  const { 
    activeAdminTab, 
    pendingApprovals, 
    flaggedReviews, 
    blockedKeywords, 
    moderationToggles, 
    customerBookings, 
    currentLang 
  } = window.Qareeb.state;
  const { adminStats } = window.Qareeb.mockData;
  const t = window.Qareeb.t;

  return `
    <div class="admin-portal py-8 animate-fade-in">
      <div class="container">
        
        <!-- Header -->
        <div class="card p-6 mb-6" style="background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%);">
          <div class="flex items-center gap-3 mb-1">
            <span style="font-size: 1.5rem;">🛡️</span>
            <h1 class="text-2xl font-extrabold text-primary">${t("adminTitle")}</h1>
            <span class="badge badge-danger">Demo SuperAdmin</span>
          </div>
          <p class="text-xs text-secondary">${t("adminSubtitle")}</p>
        </div>

        <!-- Navigation Sub-Tabs -->
        <div class="tab-list">
          <button 
            type="button" 
            class="tab-btn ${activeAdminTab === 'dashboard' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setAdminTab('dashboard')"
          >
            <span>📊 ${t("navAdminDashboard")}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeAdminTab === 'approvals' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setAdminTab('approvals')"
          >
            <span>🏢 ${t("navAdminApprovals")}</span>
            ${pendingApprovals.length > 0 ? `<span class="badge badge-danger" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${pendingApprovals.length}</span>` : ''}
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeAdminTab === 'bookings' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setAdminTab('bookings')"
          >
            <span>📑 ${t("navAdminBookings")}</span>
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeAdminTab === 'moderation' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setAdminTab('moderation')"
          >
            <span>⚠️ ${t("navAdminModeration")}</span>
            ${flaggedReviews.length > 0 ? `<span class="badge badge-amber" style="padding: 0.1rem 0.4rem; font-size: 0.7rem;">${flaggedReviews.length}</span>` : ''}
          </button>

          <button 
            type="button" 
            class="tab-btn ${activeAdminTab === 'keywords' ? 'active' : ''}" 
            onclick="window.Qareeb.actions.setAdminTab('keywords')"
          >
            <span>⚙️ ${t("navAdminKeywords")}</span>
          </button>
        </div>

        <!-- ==================================================================
             TAB 1: Platform Overview & Metrics
             ================================================================== -->
        ${activeAdminTab === 'dashboard' ? `
          <div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--primary-subtle); color: var(--primary);">🏢</div>
                <div>
                  <div class="stat-kpi-value">${adminStats.activeProviders}</div>
                  <div class="stat-kpi-label">${t("adminKpiProviders")}</div>
                  <span class="stat-kpi-trend text-success">↑ +12 this mo</span>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--secondary-subtle); color: var(--secondary);">👥</div>
                <div>
                  <div class="stat-kpi-value">${adminStats.registeredCustomers}</div>
                  <div class="stat-kpi-label">${t("adminKpiCustomers")}</div>
                  <span class="stat-kpi-trend text-success">↑ +18%</span>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--info-subtle); color: var(--info-text);">📅</div>
                <div>
                  <div class="stat-kpi-value">${adminStats.monthlyBookings}</div>
                  <div class="stat-kpi-label">${t("adminKpiBookings")}</div>
                  <span class="stat-kpi-trend text-success">↑ +9.4%</span>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--success-subtle); color: var(--success-text);">💳</div>
                <div>
                  <div class="stat-kpi-value text-success">${adminStats.grossVolume}</div>
                  <div class="stat-kpi-label">${t("adminKpiGMV")}</div>
                  <span class="stat-kpi-trend text-success">↑ High</span>
                </div>
              </div>

              <div class="stat-kpi-card">
                <div class="stat-kpi-icon" style="background: var(--warning-subtle); color: var(--warning-text);">⭐</div>
                <div>
                  <div class="stat-kpi-value text-brand">${adminStats.satisfactionScore}</div>
                  <div class="stat-kpi-label">${t("adminKpiSatisfaction")}</div>
                  <span class="stat-kpi-trend text-muted">98% positive</span>
                </div>
              </div>
            </div>

            <!-- Health & Quick Alerts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card p-6">
                <h3 class="text-base font-bold mb-3 flex items-center justify-between">
                  <span>${currentLang === 'ar' ? 'المهام العاجلة بانتظار الإجراء' : 'Action Required Queue'}</span>
                  <span class="badge badge-danger">${pendingApprovals.length + flaggedReviews.length} items</span>
                </h3>
                <div class="flex flex-col gap-3">
                  <div class="p-3 rounded-md flex items-center justify-between" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                    <div class="flex items-center gap-3">
                      <span>🏢</span>
                      <div>
                        <div class="font-bold text-xs">${pendingApprovals.length} ${t("adminSecApprovals")}</div>
                        <div class="text-xs text-muted">Merchant licenses require manual verification</div>
                      </div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.Qareeb.actions.setAdminTab('approvals')">Review</button>
                  </div>

                  <div class="p-3 rounded-md flex items-center justify-between" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                    <div class="flex items-center gap-3">
                      <span>⚠️</span>
                      <div>
                        <div class="font-bold text-xs">${flaggedReviews.length} ${t("adminSecModeration")}</div>
                        <div class="text-xs text-muted">Customer dispute and spam reports</div>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="window.Qareeb.actions.setAdminTab('moderation')">Inspect</button>
                  </div>
                </div>
              </div>

              <div class="card p-6">
                <h3 class="text-base font-bold mb-3">${currentLang === 'ar' ? 'أداء المنصة الإقليمي' : 'Regional Platform Health'}</h3>
                <div class="flex flex-col gap-3 text-xs">
                  <div class="flex items-center justify-between py-1" style="border-bottom: 1px solid var(--border-subtle);">
                    <span class="text-secondary">Average Provider Verification Speed</span>
                    <strong class="text-primary">1.4 hours</strong>
                  </div>
                  <div class="flex items-center justify-between py-1" style="border-bottom: 1px solid var(--border-subtle);">
                    <span class="text-secondary">Booking Completion Success Rate</span>
                    <strong class="text-success">96.8%</strong>
                  </div>
                  <div class="flex items-center justify-between py-1" style="border-bottom: 1px solid var(--border-subtle);">
                    <span class="text-secondary">Dispute Resolution Rate</span>
                    <strong class="text-primary">99.1%</strong>
                  </div>
                  <div class="flex items-center justify-between py-1">
                    <span class="text-secondary">Active Region Coverage</span>
                    <strong class="text-brand">Riyadh & Central Province</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 2: Provider Approval Queue
             ================================================================== -->
        ${activeAdminTab === 'approvals' ? `
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("adminSecApprovals")}</h2>
                <p class="text-xs text-secondary">${t("adminSecApprovalsSub")}</p>
              </div>
              <span class="badge badge-amber font-bold">${pendingApprovals.length} pending</span>
            </div>

            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>${t("colBusinessName")}</th>
                    <th>${t("colCategory")}</th>
                    <th>${t("colOwner")}</th>
                    <th>${t("colDocuments")}</th>
                    <th>${t("colSubmittedDate")}</th>
                    <th style="text-align: end;">${t("colAction")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingApprovals.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        🎉 ${currentLang === 'ar' ? 'تمت مراجعة واعتماد كافة طلبات المزودين!' : 'All provider applications have been processed!'}
                      </td>
                    </tr>
                  ` : `
                    ${pendingApprovals.map(app => {
                      const name = currentLang === "ar" ? app.businessNameAr : app.businessNameEn;

                      return `
                        <tr>
                          <td>
                            <strong class="text-primary">${name}</strong>
                            <div class="text-xs text-muted">${app.commercialRegNumber}</div>
                          </td>
                          <td><span class="badge badge-gray">${app.category}</span></td>
                          <td>
                            <div class="text-xs font-semibold">${app.ownerName}</div>
                            <div class="text-xs text-muted">${app.phone}</div>
                          </td>
                          <td>
                            <span class="badge badge-emerald">📄 ${t("docCommercialLicense")}</span>
                            <span class="badge badge-info mt-1">🩺 ${t("docHealthPermit")}</span>
                          </td>
                          <td><span class="text-xs text-muted">${app.submittedDate}</span></td>
                          <td style="text-align: end;">
                            <div class="flex items-center justify-end gap-2">
                              <button 
                                type="button" 
                                class="btn btn-danger btn-sm py-1 px-2 text-xs"
                                onclick="window.Qareeb.actions.rejectPendingProvider('${app.id}')"
                              >
                                ✕ Reject
                              </button>
                              <button 
                                type="button" 
                                class="btn btn-emerald btn-sm py-1 px-2 text-xs"
                                onclick="window.Qareeb.actions.approvePendingProvider('${app.id}')"
                              >
                                ✓ Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join("")}
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 3: Global Bookings Ledger
             ================================================================== -->
        ${activeAdminTab === 'bookings' ? `
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("adminSecBookings")}</h2>
                <p class="text-xs text-secondary">${t("adminSecBookingsSub")}</p>
              </div>
              <span class="badge badge-gray">${customerBookings.length} total entries</span>
            </div>

            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Provider</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${customerBookings.map(b => {
                    const prov = currentLang === "ar" ? b.providerNameAr : b.providerNameEn;
                    const srv = currentLang === "ar" ? b.serviceNameAr : b.serviceNameEn;

                    return `
                      <tr>
                        <td><strong>#${b.id}</strong></td>
                        <td>${prov}</td>
                        <td>${srv}</td>
                        <td>${b.dateStr} @ ${b.timeStr}</td>
                        <td><strong>$${b.price}</strong></td>
                        <td>
                          ${b.status === 'confirmed' ? `<span class="badge badge-emerald">✓ Confirmed</span>` : ''}
                          ${b.status === 'pending' ? `<span class="badge badge-amber">⏳ Pending</span>` : ''}
                          ${b.status === 'completed' ? `<span class="badge badge-info">✓ Completed</span>` : ''}
                          ${b.status === 'cancelled' ? `<span class="badge badge-danger">✕ Cancelled</span>` : ''}
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
             TAB 4: Reviews & Dispute Moderation
             ================================================================== -->
        ${activeAdminTab === 'moderation' ? `
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("adminSecModeration")}</h2>
                <p class="text-xs text-secondary">${t("adminSecModerationSub")}</p>
              </div>
              <span class="badge badge-amber font-bold">${flaggedReviews.length} tickets</span>
            </div>

            <div class="flex flex-col gap-4">
              ${flaggedReviews.length === 0 ? `
                <div class="p-8 text-center text-muted text-sm">
                  🎉 All customer reports and flagged reviews have been reviewed.
                </div>
              ` : `
                ${flaggedReviews.map(item => {
                  const prov = currentLang === "ar" ? item.providerNameAr : item.providerNameEn;
                  const text = currentLang === "ar" ? item.reportedTextAr : item.reportedTextEn;

                  return `
                    <div class="p-4 rounded-lg flex flex-col gap-3" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span class="font-bold text-sm text-primary">${prov}</span>
                          <span class="text-xs text-muted">• Reporter: ${item.reviewerName} (${item.date})</span>
                        </div>
                        <span class="badge badge-danger">⚠️ ${t(item.flagReasonKey)}</span>
                      </div>

                      <div class="p-3 rounded-md" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 0.8125rem;">
                        <span class="text-muted block text-xs mb-1">Reported Review Body:</span>
                        <p class="text-primary italic">"${text}"</p>
                      </div>

                      <div class="flex items-center justify-end gap-2 pt-2" style="border-top: 1px solid var(--border-subtle);">
                        <button 
                          type="button" 
                          class="btn btn-secondary btn-sm"
                          onclick="window.Qareeb.actions.dismissModerationFlag('${item.id}')"
                        >
                          ${t("btnDismissFlag")}
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-danger btn-sm"
                          onclick="window.Qareeb.actions.hideModerationReview('${item.id}')"
                        >
                          ${t("btnHideReview")}
                        </button>
                      </div>
                    </div>
                  `;
                }).join("")}
              `}
            </div>
          </div>
        ` : ''}

        <!-- ==================================================================
             TAB 5: Keyword Moderation Settings
             ================================================================== -->
        ${activeAdminTab === 'keywords' ? `
          <div class="card p-6" style="max-width: 820px; margin-inline: auto;">
            <div class="flex items-center justify-between mb-6 pb-3" style="border-bottom: 1px solid var(--border-default);">
              <div>
                <h2 class="text-xl font-bold">${t("adminSecKeywords")}</h2>
                <p class="text-xs text-secondary">${t("adminSecKeywordsSub")}</p>
              </div>

              <button 
                type="button" 
                class="btn btn-primary btn-sm"
                onclick="window.Qareeb.actions.addToast(window.Qareeb.t('settingsSavedToast'), 'success')"
              >
                ${t("btnSaveModerationSettings")}
              </button>
            </div>

            <!-- Automated Filter Toggles -->
            <div class="flex flex-col gap-3 mb-6">
              <label class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                <div>
                  <span class="font-bold text-sm text-primary block">${t("toggleAutoFilterContact")}</span>
                  <span class="text-xs text-muted">Prevents off-platform transactions and direct phone leaking in comments.</span>
                </div>
                <input 
                  type="checkbox" 
                  ${moderationToggles.autoFilterContact ? 'checked' : ''} 
                  style="width: 1.25rem; height: 1.25rem; accent-color: var(--primary);" 
                  onchange="window.Qareeb.actions.toggleModerationRule('autoFilterContact')"
                />
              </label>

              <label class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                <div>
                  <span class="font-bold text-sm text-primary block">${t("toggleAutoFlagProfanity")}</span>
                  <span class="text-xs text-muted">Sends suspicious sentiment reviews directly to the moderator review queue.</span>
                </div>
                <input 
                  type="checkbox" 
                  ${moderationToggles.autoFlagProfanity ? 'checked' : ''} 
                  style="width: 1.25rem; height: 1.25rem; accent-color: var(--primary);" 
                  onchange="window.Qareeb.actions.toggleModerationRule('autoFlagProfanity')"
                />
              </label>

              <label class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                <div>
                  <span class="font-bold text-sm text-primary block">${t("toggleAutoNotifyOwner")}</span>
                  <span class="text-xs text-muted">Instant push alert to the merchant dashboard when 1-star reviews are received.</span>
                </div>
                <input 
                  type="checkbox" 
                  ${moderationToggles.autoNotifyOwner ? 'checked' : ''} 
                  style="width: 1.25rem; height: 1.25rem; accent-color: var(--primary);" 
                  onchange="window.Qareeb.actions.toggleModerationRule('autoNotifyOwner')"
                />
              </label>
            </div>

            <!-- Blacklisted Words List -->
            <div class="mb-4">
              <label class="form-label mb-2">${t("blockedWordsLabel")}</label>
              <div class="flex gap-2 mb-3">
                <input 
                  type="text" 
                  id="new-keyword-input" 
                  class="form-input text-sm" 
                  placeholder="${t("addKeywordPlaceholder")}"
                  onkeydown="if(event.key === 'Enter') { const v = this.value; if(v) { window.Qareeb.actions.addBlockedKeyword(v); this.value = ''; } }"
                />
                <button 
                  type="button" 
                  class="btn btn-primary btn-sm flex-shrink-0"
                  onclick="const v = document.getElementById('new-keyword-input').value; if(v) { window.Qareeb.actions.addBlockedKeyword(v); document.getElementById('new-keyword-input').value = ''; }"
                >
                  ${t("btnAddKeyword")}
                </button>
              </div>

              <!-- Keyword Chips -->
              <div class="flex flex-wrap gap-2 p-3 rounded-lg" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default); min-height: 80px;">
                ${blockedKeywords.map(word => `
                  <span class="badge badge-gray" style="padding: 0.35rem 0.65rem; font-size: 0.8125rem; display: inline-flex; align-items: center; gap: 0.35rem;">
                    <span>${word}</span>
                    <button 
                      type="button" 
                      style="color: var(--danger); font-weight: bold; margin-inline-start: 0.25rem;"
                      onclick="window.Qareeb.actions.removeBlockedKeyword('${word}')"
                      title="Remove keyword"
                    >
                      ✕
                    </button>
                  </span>
                `).join("")}
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
};
