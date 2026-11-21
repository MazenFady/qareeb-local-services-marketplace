/**
 * Qareeb (قريب) — 5-Step Simulated Booking Flow Wizard Modal
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.BookingModal = function() {
  const { bookingModal, currentLang } = window.Qareeb.state;
  if (!bookingModal || !bookingModal.isOpen) return "";

  const { providers } = window.Qareeb.mockData;
  const t = window.Qareeb.t;

  const provider = providers.find(p => p.id === bookingModal.providerId) || providers[0];
  const providerName = currentLang === "ar" ? provider.nameAr : provider.nameEn;

  const step = bookingModal.step; // 1 to 5
  const selectedServices = bookingModal.selectedServices || [];
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Available Time Slots Mock
  const morningSlots = ["09:30 AM", "10:15 AM", "11:00 AM", "11:45 AM"];
  const afternoonSlots = ["01:30 PM", "02:15 PM", "03:30 PM", "04:15 PM"];
  const eveningSlots = ["05:30 PM", "06:15 PM", "07:00 PM", "08:15 PM"];

  return `
    <div class="modal-backdrop" onclick="if(event.target === this && ${step} !== 5) window.Qareeb.actions.closeBookingModal()">
      <div class="modal-dialog">
        <!-- Header -->
        <div class="modal-header">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-brand uppercase tracking-wider">
              ${t("demoBadge")}
            </span>
            <h2 class="text-lg font-bold text-primary">
              ${step === 5 ? t("bookingSuccessTitle") : t("bookingModalTitle", { provider: providerName })}
            </h2>
          </div>

          <button 
            type="button" 
            class="control-btn icon-only" 
            onclick="window.Qareeb.actions.closeBookingModal()"
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <!-- Stepper Progress Indicator -->
        ${step < 5 ? `
          <div class="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold" style="background: var(--bg-surface-subtle); border-bottom: 1px solid var(--border-default);">
            <div class="flex items-center gap-1 ${step >= 1 ? 'text-brand' : 'text-muted'}">
              <span>1.</span> <span>${currentLang === 'ar' ? 'الخدمة' : 'Service'}</span>
            </div>
            <span class="text-muted">→</span>
            <div class="flex items-center gap-1 ${step >= 2 ? 'text-brand' : 'text-muted'}">
              <span>2.</span> <span>${currentLang === 'ar' ? 'الأخصائي' : 'Staff'}</span>
            </div>
            <span class="text-muted">→</span>
            <div class="flex items-center gap-1 ${step >= 3 ? 'text-brand' : 'text-muted'}">
              <span>3.</span> <span>${currentLang === 'ar' ? 'الموعد' : 'Time'}</span>
            </div>
            <span class="text-muted">→</span>
            <div class="flex items-center gap-1 ${step >= 4 ? 'text-brand' : 'text-muted'}">
              <span>4.</span> <span>${currentLang === 'ar' ? 'البيانات' : 'Details'}</span>
            </div>
          </div>
        ` : ''}

        <!-- Body Step Content -->
        <div class="modal-body">
          
          <!-- STEP 1: Service Selection -->
          ${step === 1 ? `
            <div class="flex flex-col gap-3">
              <div class="text-xs text-secondary mb-2">
                ${currentLang === 'ar' ? 'يمكنك اختيار أكثر من خدمة لإضافتها إلى حجزك في زيارة واحدة:' : 'Select one or more services to bundle in a single appointment:'}
              </div>

              ${provider.services.map(srv => {
                const srvTitle = currentLang === "ar" ? srv.titleAr : srv.titleEn;
                const isSelected = selectedServices.some(s => s.id === srv.id);

                return `
                  <div 
                    class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all"
                    style="background: ${isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)'}; border: 1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'};"
                    onclick="window.Qareeb.actions.toggleBookingService({ id: '${srv.id}', titleEn: '${srv.titleEn.replace(/'/g, "\\'")}', titleAr: '${srv.titleAr.replace(/'/g, "\\'")}', price: ${srv.price}, duration: ${srv.duration} })"
                  >
                    <div class="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        ${isSelected ? 'checked' : ''} 
                        style="width: 1.1rem; height: 1.1rem; accent-color: var(--primary);" 
                        onclick="event.stopPropagation(); window.Qareeb.actions.toggleBookingService({ id: '${srv.id}', titleEn: '${srv.titleEn.replace(/'/g, "\\'")}', titleAr: '${srv.titleAr.replace(/'/g, "\\'")}', price: ${srv.price}, duration: ${srv.duration} })"
                      />
                      <div>
                        <div class="font-bold text-sm text-primary">${srvTitle}</div>
                        <div class="text-xs text-muted">⏱️ ${srv.duration} ${currentLang === 'ar' ? 'دقيقة' : 'min'}</div>
                      </div>
                    </div>

                    <div class="text-base font-extrabold text-primary">
                      $${srv.price}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : ''}

          <!-- STEP 2: Specialist Selection -->
          ${step === 2 ? `
            <div class="flex flex-col gap-3">
              <div class="text-xs text-secondary mb-2">
                ${currentLang === 'ar' ? 'اختر الأخصائي المفضل لديك، أو دع النظام يختار الأسرع تفرغاً:' : 'Select your preferred specialist or let the system assign the first available:'}
              </div>

              <!-- Any Specialist Option -->
              <div 
                class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer"
                style="background: ${bookingModal.selectedSpecialistId === 'any' ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)'}; border: 1.5px solid ${bookingModal.selectedSpecialistId === 'any' ? 'var(--primary)' : 'var(--border-default)'};"
                onclick="window.Qareeb.actions.updateBookingField('selectedSpecialistId', 'any')"
              >
                <div class="flex items-center gap-3">
                  <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: var(--secondary-subtle); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                    ⚡
                  </div>
                  <div>
                    <div class="font-bold text-sm text-primary">${t("selectSpecialistAny")}</div>
                    <div class="text-xs text-secondary">${t("selectSpecialistAnySub")}</div>
                  </div>
                </div>
                <input type="radio" name="specialist" ${bookingModal.selectedSpecialistId === 'any' ? 'checked' : ''} style="accent-color: var(--primary);" />
              </div>

              <!-- Named Specialists -->
              ${provider.staff.map(member => {
                const staffName = currentLang === "ar" ? member.nameAr : member.nameEn;
                const staffTitle = currentLang === "ar" ? member.titleAr : member.titleEn;
                const isSelected = bookingModal.selectedSpecialistId === member.id;

                return `
                  <div 
                    class="p-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer"
                    style="background: ${isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)'}; border: 1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-default)'};"
                    onclick="window.Qareeb.actions.updateBookingField('selectedSpecialistId', '${member.id}')"
                  >
                    <div class="flex items-center gap-3">
                      <img src="${member.image}" alt="${staffName}" style="width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover;" />
                      <div>
                        <div class="font-bold text-sm text-primary">${staffName}</div>
                        <div class="text-xs text-muted">${staffTitle} • <span class="text-brand font-semibold">★ ${member.rating}</span></div>
                      </div>
                    </div>
                    <input type="radio" name="specialist" ${isSelected ? 'checked' : ''} style="accent-color: var(--primary);" />
                  </div>
                `;
              }).join("")}
            </div>
          ` : ''}

          <!-- STEP 3: Date & Time Picker -->
          ${step === 3 ? `
            <div class="flex flex-col gap-4">
              <!-- Date Pills -->
              <div>
                <label class="form-label mb-2">${currentLang === 'ar' ? 'اختر تاريخ الموعد:' : 'Choose Appointment Date:'}</label>
                <div class="grid grid-cols-3 gap-2">
                  ${["Today", "Tomorrow", "Saturday"].map(d => {
                    const label = d === "Today" ? t("dateToday") : (d === "Tomorrow" ? t("dateTomorrow") : (currentLang === 'ar' ? 'السبت القادم' : 'Next Sat'));
                    const isSelected = bookingModal.selectedDate === d;
                    return `
                      <button 
                        type="button" 
                        class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}"
                        onclick="window.Qareeb.actions.updateBookingField('selectedDate', '${d}')"
                      >
                        📅 ${label}
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>

              <!-- Available Time Slots -->
              <div>
                <label class="form-label mb-2">${t("availableSlotsAfternoon")}</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  ${afternoonSlots.map(slot => {
                    const isSelected = bookingModal.selectedTime === slot;
                    return `
                      <button 
                        type="button" 
                        class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}"
                        onclick="window.Qareeb.actions.updateBookingField('selectedTime', '${slot}')"
                      >
                        🕒 ${slot}
                      </button>
                    `;
                  }).join("")}
                </div>

                <label class="form-label mb-2">${t("availableSlotsEvening")}</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  ${eveningSlots.map(slot => {
                    const isSelected = bookingModal.selectedTime === slot;
                    return `
                      <button 
                        type="button" 
                        class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}"
                        onclick="window.Qareeb.actions.updateBookingField('selectedTime', '${slot}')"
                      >
                        🌙 ${slot}
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- STEP 4: Client Info & Summary -->
          ${step === 4 ? `
            <div class="flex flex-col gap-4">
              <div class="p-3 rounded-lg" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-default);">
                <div class="text-xs font-bold uppercase text-muted mb-2">${t("bookingSummaryTitle")}</div>
                <div class="flex justify-between text-sm py-1">
                  <span class="text-secondary">${currentLang === 'ar' ? 'المركز:' : 'Venue:'}</span>
                  <span class="font-bold text-primary">${providerName}</span>
                </div>
                <div class="flex justify-between text-sm py-1">
                  <span class="text-secondary">${currentLang === 'ar' ? 'الموعد:' : 'Date & Time:'}</span>
                  <span class="font-bold text-brand">${bookingModal.selectedDate} at ${bookingModal.selectedTime}</span>
                </div>
                <div class="flex justify-between text-sm py-1">
                  <span class="text-secondary">${t("bookingTotalDuration")}:</span>
                  <span class="font-medium text-primary">${totalDuration} ${currentLang === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
                <div class="flex justify-between text-base py-2 mt-1" style="border-top: 1px solid var(--border-subtle);">
                  <span class="font-bold text-primary">${t("bookingTotalPrice")}:</span>
                  <span class="font-extrabold text-brand">$${totalPrice}</span>
                </div>
              </div>

              <!-- Input Forms -->
              <div class="form-group mb-2">
                <label class="form-label">${t("inputClientName")}</label>
                <input 
                  type="text" 
                  class="form-input" 
                  value="${bookingModal.clientName || ''}"
                  oninput="window.Qareeb.actions.updateBookingField('clientName', this.value)"
                  placeholder="e.g. Sultan Al-Otaibi"
                />
              </div>

              <div class="form-group mb-2">
                <label class="form-label">${t("inputClientPhone")}</label>
                <input 
                  type="tel" 
                  class="form-input" 
                  value="${bookingModal.clientPhone || ''}"
                  oninput="window.Qareeb.actions.updateBookingField('clientPhone', this.value)"
                  placeholder="+966 50 123 4567"
                />
              </div>

              <div class="form-group mb-0">
                <label class="form-label">${t("inputClientNotes")}</label>
                <textarea 
                  class="form-textarea" 
                  rows="2"
                  oninput="window.Qareeb.actions.updateBookingField('clientNotes', this.value)"
                  placeholder="${currentLang === 'ar' ? 'مثال: تفضيل قصة معينة أو أي حساسية جلدية' : 'Any preferences or special requests'}"
                >${bookingModal.clientNotes || ''}</textarea>
              </div>
            </div>
          ` : ''}

          <!-- STEP 5: Confirmation Success -->
          ${step === 5 ? `
            <div class="text-center py-4">
              <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🎉</div>
              <h3 class="text-2xl font-extrabold text-primary mb-2">${t("bookingSuccessTitle")}</h3>
              <p class="text-sm text-secondary mb-4" style="max-width: 480px; margin-inline: auto;">
                ${t("bookingSuccessSub", { provider: providerName })}
              </p>

              <div class="p-4 rounded-xl mx-auto mb-6 text-start" style="background: var(--bg-surface-subtle); border: 1px dashed var(--primary); max-width: 440px;">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-muted uppercase font-bold">${t("bookingRefNumber")}</span>
                  <span class="badge badge-emerald">✓ ${t("statusConfirmed")}</span>
                </div>
                <div class="text-xl font-extrabold text-brand tracking-widest mb-3">
                  #${bookingModal.confirmedBookingId || 'BK-8902'}
                </div>
                <div class="text-xs text-secondary leading-relaxed">
                  <strong>${providerName}</strong> • ${bookingModal.selectedDate} @ ${bookingModal.selectedTime}
                  <div class="mt-1">${selectedServices.map(s => currentLang === 'ar' ? s.titleAr : s.titleEn).join(" + ")}</div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  type="button" 
                  class="btn btn-secondary btn-sm"
                  onclick="window.Qareeb.actions.addToast('${t("btnAddToCalendar")}: ' + (window.Qareeb.state.currentLang === 'ar' ? 'تمت إضافة تذكير الموعد إلى التقويم' : 'Event added to device calendar!'), 'success')"
                >
                  📅 ${t("btnAddToCalendar")}
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary btn-sm"
                  onclick="window.Qareeb.actions.closeBookingModal(); window.Qareeb.actions.setCustomerView('my-bookings');"
                >
                  📋 ${t("btnGoToMyBookings")}
                </button>
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Footer Actions (Steps 1 to 4) -->
        ${step < 5 ? `
          <div class="modal-footer">
            <div>
              ${step > 1 ? `
                <button 
                  type="button" 
                  class="btn btn-secondary btn-sm"
                  onclick="window.Qareeb.actions.setBookingStep(${step - 1})"
                >
                  <span class="icon-flip-rtl">←</span>
                  <span>${t("btnPrevStep")}</span>
                </button>
              ` : `
                <span class="text-xs text-muted">
                  ${selectedServices.length} ${currentLang === 'ar' ? 'خدمة مختارة' : 'services selected'}
                </span>
              `}
            </div>

            <div class="flex items-center gap-3">
              <div class="text-end">
                <span class="text-xs text-muted block">${currentLang === 'ar' ? 'المجموع:' : 'Total:'}</span>
                <span class="font-extrabold text-brand text-base">$${totalPrice}</span>
              </div>

              ${step < 4 ? `
                <button 
                  type="button" 
                  class="btn btn-primary"
                  onclick="window.Qareeb.actions.setBookingStep(${step + 1})"
                >
                  <span>${t("btnNextStep")}</span>
                  <span class="icon-flip-rtl">→</span>
                </button>
              ` : `
                <button 
                  type="button" 
                  class="btn btn-emerald"
                  onclick="window.Qareeb.actions.confirmBooking()"
                >
                  <span>✓</span>
                  <span>${t("btnConfirmBooking")}</span>
                </button>
              `}
            </div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
};
