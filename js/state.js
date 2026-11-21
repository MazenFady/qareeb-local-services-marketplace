/**
 * Qareeb (قريب) — Reactive Central State Store
 * Manages demo roles, language, theme, routing, live mock mutations, and event subscriptions.
 */
window.Qareeb = window.Qareeb || {};

(function() {
  const STORAGE_LANG = "qareeb_lang";
  const STORAGE_THEME = "qareeb_theme";
  const STORAGE_ROLE = "qareeb_role";

  // Initial State Setup
  const state = {
    // Demo Role Switcher: 'customer' | 'provider' | 'admin'
    currentRole: localStorage.getItem(STORAGE_ROLE) || "customer",

    // Appearance & Localization
    currentLang: localStorage.getItem(STORAGE_LANG) || "en", // 'en' | 'ar'
    currentTheme: localStorage.getItem(STORAGE_THEME) || "light", // 'light' | 'dark'

    // Navigation & Views
    activeCustomerView: "home", // 'home' | 'search' | 'provider-detail' | 'my-bookings'
    activeProviderTab: "dashboard", // 'dashboard' | 'services' | 'hours' | 'reviews' | 'preview'
    activeAdminTab: "dashboard", // 'dashboard' | 'approvals' | 'bookings' | 'moderation' | 'keywords'

    // Selected Provider for Public Detail View
    selectedProviderId: "prov-1",

    // Search & Filter State
    searchFilters: {
      query: "",
      location: "",
      category: "all",
      priceTier: "all",
      minRating: 0,
      availability: "any",
      sortBy: "recommended"
    },

    // Booking Wizard Flow
    bookingModal: {
      isOpen: false,
      step: 1, // 1 to 5
      providerId: "prov-1",
      selectedServices: [],
      selectedSpecialistId: "any",
      selectedDate: "Today",
      selectedTime: "3:30 PM",
      clientName: "Sultan Al-Otaibi",
      clientPhone: "+966 50 123 4567",
      clientNotes: "",
      confirmedBookingId: null
    },

    // Customer Bookings (Live mutable)
    customerBookings: JSON.parse(JSON.stringify(window.Qareeb.mockData.customerBookings)),

    // Active Provider Data (Live mutable, currently represents 'prov-1' The Royal Fade)
    providerSchedule: JSON.parse(JSON.stringify(window.Qareeb.mockData.providerSchedule)),
    incomingRequests: JSON.parse(JSON.stringify(window.Qareeb.mockData.incomingRequests)),
    providerServices: JSON.parse(JSON.stringify(window.Qareeb.mockData.providers[0].services)),
    providerHours: JSON.parse(JSON.stringify(window.Qareeb.mockData.providerHours)),
    vacationMode: false,

    // Platform Admin Data (Live mutable)
    pendingApprovals: JSON.parse(JSON.stringify(window.Qareeb.mockData.pendingApprovals)),
    flaggedReviews: JSON.parse(JSON.stringify(window.Qareeb.mockData.flaggedReviews)),
    blockedKeywords: [...window.Qareeb.mockData.blockedKeywords],
    moderationToggles: {
      autoFilterContact: true,
      autoFlagProfanity: true,
      autoNotifyOwner: true
    },

    // Active Toasts
    toasts: []
  };

  // Event Listeners for reactivity
  const listeners = [];

  function notify() {
    listeners.forEach(fn => fn(state));
  }

  // Translation helper
  function t(key, replacements = {}) {
    const lang = state.currentLang;
    const dict = window.Qareeb.translations[lang] || window.Qareeb.translations.en;
    let str = dict[key] || window.Qareeb.translations.en[key] || key;
    for (const [k, v] of Object.entries(replacements)) {
      str = str.replace(`{${k}}`, v);
    }
    return str;
  }

  // State actions
  const actions = {
    // Change Demo Role
    setRole(role) {
      if (["customer", "provider", "admin"].includes(role)) {
        state.currentRole = role;
        localStorage.setItem(STORAGE_ROLE, role);
        notify();
      }
    },

    // Toggle Language
    setLanguage(lang) {
      if (lang === "en" || lang === "ar") {
        state.currentLang = lang;
        localStorage.setItem(STORAGE_LANG, lang);
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        notify();
      }
    },

    toggleLanguage() {
      actions.setLanguage(state.currentLang === "en" ? "ar" : "en");
    },

    // Toggle Theme
    setTheme(theme) {
      if (theme === "light" || theme === "dark") {
        state.currentTheme = theme;
        localStorage.setItem(STORAGE_THEME, theme);
        document.documentElement.setAttribute("data-theme", theme);
        notify();
      }
    },

    toggleTheme() {
      actions.setTheme(state.currentTheme === "light" ? "dark" : "light");
    },

    // Navigation Routers
    setCustomerView(view, providerId = null) {
      state.activeCustomerView = view;
      if (providerId) {
        state.selectedProviderId = providerId;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      notify();
    },

    setProviderTab(tab) {
      state.activeProviderTab = tab;
      window.scrollTo({ top: 0, behavior: "smooth" });
      notify();
    },

    setAdminTab(tab) {
      state.activeAdminTab = tab;
      window.scrollTo({ top: 0, behavior: "smooth" });
      notify();
    },

    // Search filters
    updateSearchFilters(newFilters) {
      state.searchFilters = { ...state.searchFilters, ...newFilters };
      notify();
    },

    resetSearchFilters() {
      state.searchFilters = {
        query: "",
        location: "",
        category: "all",
        priceTier: "all",
        minRating: 0,
        availability: "any",
        sortBy: "recommended"
      };
      notify();
    },

    // Booking Wizard Actions
    openBookingModal(providerId, preselectedService = null) {
      const provider = window.Qareeb.mockData.providers.find(p => p.id === providerId) || window.Qareeb.mockData.providers[0];
      const initialServices = preselectedService ? [preselectedService] : [provider.services[0]];

      state.bookingModal = {
        isOpen: true,
        step: 1,
        providerId: provider.id,
        selectedServices: initialServices,
        selectedSpecialistId: "any",
        selectedDate: "Today",
        selectedTime: "3:30 PM",
        clientName: state.currentLang === "ar" ? "سلطان العتيبي" : "Sultan Al-Otaibi",
        clientPhone: "+966 50 123 4567",
        clientNotes: "",
        confirmedBookingId: null
      };
      notify();
    },

    closeBookingModal() {
      state.bookingModal.isOpen = false;
      notify();
    },

    setBookingStep(step) {
      state.bookingModal.step = Math.max(1, Math.min(5, step));
      notify();
    },

    toggleBookingService(service) {
      const exists = state.bookingModal.selectedServices.some(s => s.id === service.id);
      if (exists) {
        if (state.bookingModal.selectedServices.length > 1) {
          state.bookingModal.selectedServices = state.bookingModal.selectedServices.filter(s => s.id !== service.id);
        } else {
          actions.addToast(t("selectSpecialistAny"), "warning");
        }
      } else {
        state.bookingModal.selectedServices.push(service);
      }
      notify();
    },

    updateBookingField(field, value) {
      state.bookingModal[field] = value;
      notify();
    },

    confirmBooking() {
      const provider = window.Qareeb.mockData.providers.find(p => p.id === state.bookingModal.providerId) || window.Qareeb.mockData.providers[0];
      const specialist = provider.staff.find(s => s.id === state.bookingModal.selectedSpecialistId);
      const specNameEn = specialist ? specialist.nameEn : "Omar Al-Mansoor (Any Specialist)";
      const specNameAr = specialist ? specialist.nameAr : "عمر المنصور (أي أخصائي متاح)";

      const totalPrice = state.bookingModal.selectedServices.reduce((acc, s) => acc + s.price, 0);
      const totalDuration = state.bookingModal.selectedServices.reduce((acc, s) => acc + s.duration, 0);
      const newId = "BK-" + Math.floor(1000 + Math.random() * 9000);

      const newBooking = {
        id: newId,
        providerId: provider.id,
        providerNameEn: provider.nameEn,
        providerNameAr: provider.nameAr,
        serviceId: state.bookingModal.selectedServices[0].id,
        serviceNameEn: state.bookingModal.selectedServices.map(s => s.titleEn).join(" + "),
        serviceNameAr: state.bookingModal.selectedServices.map(s => s.titleAr).join(" + "),
        specialistNameEn: specNameEn,
        specialistNameAr: specNameAr,
        dateStr: state.bookingModal.selectedDate,
        timeStr: state.bookingModal.selectedTime,
        price: totalPrice,
        duration: totalDuration,
        status: "confirmed",
        notesEn: state.bookingModal.clientNotes || "Standard booking",
        notesAr: state.bookingModal.clientNotes || "حجز اعتيادي",
        createdAt: new Date().toISOString().split("T")[0]
      };

      // Add to beginning of customer bookings
      state.customerBookings.unshift(newBooking);

      // Also add to provider today's schedule if provider matches
      if (provider.id === "prov-1") {
        state.providerSchedule.push({
          id: "slot-" + Date.now(),
          time: state.bookingModal.selectedTime,
          clientName: state.bookingModal.clientName,
          serviceEn: newBooking.serviceNameEn,
          serviceAr: newBooking.serviceNameAr,
          specialistEn: specNameEn,
          specialistAr: specNameAr,
          price: totalPrice,
          status: "confirmed"
        });
      }

      state.bookingModal.confirmedBookingId = newId;
      state.bookingModal.step = 5;
      actions.addToast(t("bookingSuccessTitle"), "success");
      notify();
    },

    // Customer Bookings Management
    cancelCustomerBooking(bookingId) {
      const b = state.customerBookings.find(item => item.id === bookingId);
      if (b) {
        b.status = "cancelled";
        actions.addToast(t("bookingCancelledToast"), "info");
        notify();
      }
    },

    rescheduleCustomerBooking(bookingId) {
      actions.addToast(t("bookingRescheduledToast"), "success");
    },

    // Provider Operations Actions
    acceptIncomingRequest(requestId) {
      const reqIndex = state.incomingRequests.findIndex(r => r.id === requestId);
      if (reqIndex !== -1) {
        const req = state.incomingRequests.splice(reqIndex, 1)[0];
        state.providerSchedule.push({
          id: "slot-" + Date.now(),
          time: req.timeEn.split("at ")[1] || "6:45 PM",
          clientName: req.clientName,
          serviceEn: req.serviceEn,
          serviceAr: req.serviceAr,
          specialistEn: req.specialistEn,
          specialistAr: req.specialistAr,
          price: req.price,
          status: "confirmed"
        });
        actions.addToast(state.currentLang === "ar" ? "تم قبول وتأكيد الحجز بنجاح!" : "Booking request accepted!", "success");
        notify();
      }
    },

    rejectIncomingRequest(requestId) {
      const reqIndex = state.incomingRequests.findIndex(r => r.id === requestId);
      if (reqIndex !== -1) {
        state.incomingRequests.splice(reqIndex, 1);
        actions.addToast(state.currentLang === "ar" ? "تم رفض الطلب والاعتذار للعميل." : "Request declined.", "info");
        notify();
      }
    },

    completeScheduleBooking(slotId) {
      const slot = state.providerSchedule.find(s => s.id === slotId);
      if (slot) {
        slot.status = "completed";
        actions.addToast(state.currentLang === "ar" ? "تم تأكيد إتمام الخدمة بنجاح!" : "Service marked as completed!", "success");
        notify();
      }
    },

    addProviderService(serviceData) {
      const newService = {
        id: "srv-" + Date.now(),
        titleEn: serviceData.titleEn || "Custom Premium Treatment",
        titleAr: serviceData.titleAr || "خدمة مميزة مخصصة",
        descEn: serviceData.descEn || "Personalized treatment tailored to client requirements.",
        descAr: serviceData.descAr || "جلسة علاجية مخصصة حسب رغبة واحتياج العميل.",
        price: Number(serviceData.price) || 50,
        duration: Number(serviceData.duration) || 45,
        categoryEn: serviceData.categoryEn || "Haircuts",
        categoryAr: serviceData.categoryAr || "قصات الشعر"
      };
      state.providerServices.unshift(newService);
      actions.addToast(state.currentLang === "ar" ? "تمت إضافة الخدمة الجديدة بنجاح!" : "New service added to menu!", "success");
      notify();
    },

    toggleVacationMode() {
      state.vacationMode = !state.vacationMode;
      const msg = state.vacationMode 
        ? (state.currentLang === "ar" ? "تم تفعيل وضع الإجازة (إيقاف الحجوزات مؤقتاً)." : "Vacation mode enabled (Bookings paused).")
        : (state.currentLang === "ar" ? "تم استئناف استقبال الحجوزات بنجاح!" : "Bookings resumed!");
      actions.addToast(msg, state.vacationMode ? "warning" : "success");
      notify();
    },

    replyToReview(reviewId, replyText) {
      const prov = window.Qareeb.mockData.providers[0];
      const rev = prov.reviews.find(r => r.id === reviewId);
      if (rev) {
        rev.replyEn = replyText;
        rev.replyAr = replyText;
        actions.addToast(t("replySavedToast"), "success");
        notify();
      }
    },

    // Admin Operations Actions
    approvePendingProvider(appId) {
      const idx = state.pendingApprovals.findIndex(a => a.id === appId);
      if (idx !== -1) {
        const app = state.pendingApprovals.splice(idx, 1)[0];
        // Add as a mock new provider in providers list
        window.Qareeb.mockData.providers.push({
          id: "prov-" + Date.now(),
          nameEn: app.businessNameEn,
          nameAr: app.businessNameAr,
          category: app.category,
          rating: 5.0,
          reviewsCount: 1,
          priceTier: "$$",
          startingPrice: 35,
          neighborhoodEn: "Riyadh Center",
          neighborhoodAr: "وسط الرياض",
          distanceEn: "3.5 km away",
          distanceAr: "على بعد 3.5 كم",
          heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
          avatarImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80",
          badges: ["instant", "availableToday"],
          nextAvailableSlotEn: "Today at 5:00 PM",
          nextAvailableSlotAr: "اليوم الساعة 5:00 م",
          bioEn: "Newly verified premium local provider offering top quality care.",
          bioAr: "مزود خدمة معتمد جديد يقدم أعلى معايير الجودة والعناية.",
          highlights: ["hlYears", "hlHygiene", "hlParking"],
          addressEn: "King Fahd Road, Riyadh",
          addressAr: "طريق الملك فهد، الرياض",
          phone: app.phone,
          whatsapp: app.phone.replace(/[^0-9]/g, ""),
          instagram: "@newprovider",
          facebook: "facebook.com",
          coordinates: { x: 50, y: 50 },
          staff: window.Qareeb.mockData.providers[0].staff,
          services: window.Qareeb.mockData.providers[0].services,
          gallery: window.Qareeb.mockData.providers[0].gallery,
          reviews: []
        });
        actions.addToast(t("providerApprovedToast"), "success");
        notify();
      }
    },

    rejectPendingProvider(appId) {
      const idx = state.pendingApprovals.findIndex(a => a.id === appId);
      if (idx !== -1) {
        state.pendingApprovals.splice(idx, 1);
        actions.addToast(t("providerRejectedToast"), "info");
        notify();
      }
    },

    dismissModerationFlag(reportId) {
      const idx = state.flaggedReviews.findIndex(f => f.id === reportId);
      if (idx !== -1) {
        state.flaggedReviews.splice(idx, 1);
        actions.addToast(t("flagDismissedToast"), "info");
        notify();
      }
    },

    hideModerationReview(reportId) {
      const idx = state.flaggedReviews.findIndex(f => f.id === reportId);
      if (idx !== -1) {
        state.flaggedReviews.splice(idx, 1);
        actions.addToast(t("flagHiddenToast"), "success");
        notify();
      }
    },

    addBlockedKeyword(word) {
      const clean = word.trim().toLowerCase();
      if (clean && !state.blockedKeywords.includes(clean)) {
        state.blockedKeywords.push(clean);
        actions.addToast(state.currentLang === "ar" ? `تمت إضافة الكلمة "${clean}"` : `Added "${clean}" to blocklist`, "success");
        notify();
      }
    },

    removeBlockedKeyword(word) {
      state.blockedKeywords = state.blockedKeywords.filter(w => w !== word);
      notify();
    },

    toggleModerationRule(ruleKey) {
      if (state.moderationToggles[ruleKey] !== undefined) {
        state.moderationToggles[ruleKey] = !state.moderationToggles[ruleKey];
        notify();
      }
    },

    // Toast Notifications
    addToast(message, type = "info") {
      const id = Date.now() + Math.random();
      state.toasts.push({ id, message, type });
      notify();
      setTimeout(() => {
        actions.removeToast(id);
      }, 4000);
    },

    removeToast(id) {
      state.toasts = state.toasts.filter(t => t.id !== id);
      notify();
    }
  };

  // Expose store
  window.Qareeb.state = state;
  window.Qareeb.actions = actions;
  window.Qareeb.t = t;
  window.Qareeb.subscribe = function(fn) {
    listeners.push(fn);
  };
})();
