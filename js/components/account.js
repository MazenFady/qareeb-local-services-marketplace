window.Qareeb = window.Qareeb || {};
(function () {
  const q = window.Qareeb;
  const text = {
    account: ["Account", "الحساب"], login: ["Sign in", "تسجيل الدخول"], register: ["Create customer account", "إنشاء حساب عميل"],
    logout: ["Sign out", "تسجيل الخروج"], close: ["Close", "إغلاق"],
    separation: ["Account access is live. Marketplace bookings and demo roles still use mock data.", "الوصول إلى الحساب متصل بالخادم. الحجوزات وأدوار العرض في السوق ما زالت تجريبية."],
    anonymous: ["Not signed in", "لم تسجل الدخول"], checking: ["Checking session…", "جارٍ التحقق من الجلسة…"],
    unavailable: ["Account service unavailable", "خدمة الحساب غير متاحة"], busy: ["Please wait…", "يرجى الانتظار…"],
    phone: ["Phone with country code", "رقم الهاتف مع رمز الدولة"], password: ["Password", "كلمة المرور"],
    newPassword: ["New password", "كلمة المرور الجديدة"], email: ["Email (optional)", "البريد الإلكتروني (اختياري)"],
    hint: ["Use + and country code. Password: 12–128 characters, uppercase, lowercase, number and symbol.", "استخدم + ورمز الدولة. كلمة المرور: ١٢–١٢٨ حرفاً، مع حرف كبير وصغير ورقم ورمز."],
    totp: ["Authenticator code (administrators only)", "رمز تطبيق المصادقة (للمديرين فقط)"],
    code: ["Phone verification code", "رمز التحقق من الهاتف"], verify: ["Verify phone", "تحقق من الهاتف"],
    resend: ["Resend signup code", "إعادة إرسال رمز التسجيل"], recovery: ["Recover account", "استعادة الحساب"],
    recoverConfirm: ["Reset password", "إعادة تعيين كلمة المرور"], phoneChange: ["Change phone number", "تغيير رقم الهاتف"],
    newPhone: ["New phone with country code", "الهاتف الجديد مع رمز الدولة"], phoneConfirm: ["Confirm new phone", "تأكيد الهاتف الجديد"],
    apply: ["Apply as a provider", "التقدم كمزود خدمة"], nameEn: ["Business name in English", "اسم النشاط بالإنجليزية"],
    nameAr: ["Business name in Arabic", "اسم النشاط بالعربية"], pending: ["Application submitted for admin review. This does not grant provider permissions.", "تم إرسال الطلب لمراجعة الإدارة. لا يمنحك ذلك صلاحيات مزود الخدمة."],
    setup: ["Administrator authenticator setup", "إعداد تطبيق المصادقة للمدير"],
    secretStep: ["Verify phone to enroll authenticator", "تحقق من الهاتف لإعداد تطبيق المصادقة"],
    totpVerify: ["Confirm authenticator", "تأكيد تطبيق المصادقة"],
    secretHint: ["Add this setup key manually in your authenticator app, then enter its six-digit code. Keep the key private.", "أضف مفتاح الإعداد يدوياً في تطبيق المصادقة ثم أدخل الرمز المكون من ستة أرقام. احتفظ بالمفتاح سرياً."],
    challenge: ["Verification request ID", "معرّف طلب التحقق"], otpHint: ["Enter the six-digit code for this request. It expires after five minutes. A new request invalidates the previous code.", "أدخل الرمز المكون من ستة أرقام لهذا الطلب. تنتهي صلاحيته بعد خمس دقائق. يلغي الطلب الجديد الرمز السابق."],
    dev: ["Local development: no SMS is sent. Use this request ID with the --read-dev-otp command described in docs/AUTHENTICATION.md.", "التطوير المحلي: لا تُرسل رسائل SMS. استخدم معرّف الطلب مع الأمر ‎--read-dev-otp الموضح في docs/AUTHENTICATION.md."],
    verified: ["Phone verified. Sign in to continue.", "تم التحقق من الهاتف. سجل الدخول للمتابعة."],
    reset: ["Password reset. Sign in again.", "تمت إعادة تعيين كلمة المرور. سجل الدخول مجدداً."],
    changed: ["Phone changed. Sign in with the new number.", "تم تغيير الهاتف. سجل الدخول بالرقم الجديد."],
    signedOut: ["Signed out.", "تم تسجيل الخروج."], retry: ["Refresh account status", "تحديث حالة الحساب"],
    roles: ["Server permissions", "صلاحيات الخادم"], Customer: ["Customer", "عميل"], Provider: ["Provider", "مزود خدمة"],
    PlatformAdmin: ["Platform administrator", "مدير المنصة"], id: ["Account ID", "معرّف الحساب"],
    lost: ["Recovery requires access to the registered phone. Administrators also need their authenticator.", "تتطلب الاستعادة الوصول إلى الهاتف المسجل. يحتاج المدير أيضاً إلى تطبيق المصادقة."],
    requestAgain: ["Request a new code", "طلب رمز جديد"], continue: ["Continue", "متابعة"],
    error0: ["Cannot reach the account API. Open Qareeb from the HTTPS backend origin and check the connection.", "تعذر الاتصال بخدمة الحساب. افتح قريب من عنوان خادم HTTPS وتحقق من الاتصال."],
    error400: ["Check the entered details or code. If the code expired, request a new one.", "تحقق من البيانات أو الرمز. إذا انتهت صلاحية الرمز فاطلب رمزاً جديداً."],
    error401: ["Credentials or authenticator code are incorrect, or the session expired. Sign in again if needed.", "بيانات الدخول أو رمز المصادقة غير صحيح، أو انتهت الجلسة. سجل الدخول مجدداً عند الحاجة."],
    error403: ["Access denied. Administrators must enroll an authenticator before signing in.", "الوصول غير مسموح. يجب على المدير إعداد تطبيق المصادقة قبل تسجيل الدخول."],
    error429: ["Too many attempts. Wait before retrying; code requests require at least 60 seconds.", "محاولات كثيرة. انتظر قبل المحاولة مجدداً؛ تتطلب طلبات الرموز الانتظار ٦٠ ثانية على الأقل."],
    error503: ["Delivery or account service is unavailable. Try again later.", "خدمة الإرسال أو الحساب غير متاحة. حاول لاحقاً."],
    error: ["The request could not be completed. Try again later.", "تعذر إكمال الطلب. حاول لاحقاً."],
    details: ["Server details", "تفاصيل الخادم"], expired: ["Session ended. Sign in again.", "انتهت الجلسة. سجل الدخول مجدداً."],
    exists: ["This phone number already has an account. Sign in, or recover if you forgot your password.", "هذا الرقم لديك حساب مسجل. سجل الدخول، أو استعادة الحساب إذا نسيت كلمة المرور."],
    enrollRequired: ["Administrator authenticator enrollment required before sign in.", "يتطلب تسجيل الدخول للمدير إعداد تطبيق المصادقة."],
    adminStatus: ["Administrator access", "وصول المسؤول"], adminStatusCheck: ["Check administrator access", "التحقق من وصول المسؤول"],
    enrolled: ["Authenticator enrolled. Sign in with password and authenticator code.", "تم إعداد تطبيق المصادقة. سجل الدخول بكلمة المرور ورمز المصادقة."],
    notEnrolled: ["Administrator authenticator not enrolled. Set it up before signing in.", "لم يتم إعداد تطبيق المصادقة للمدير. يجب إعداده قبل تسجيل الدخول."],
    notAdmin: ["This account does not have administrator access.", "لا يملك هذا الحساب صلاحيات مسؤول."],
    signInWithAuthenticator: ["Sign in with authenticator", "تسجيل الدخول بتطبيق المصادقة"],
    adminApplications: ["Provider applications", "طلبات المزودين"], noPending: ["No pending applications.", "لا توجد طلبات معلقة."],
    reviewApplication: ["Review application", "مراجعة الطلب"], applicant: ["Applicant", "المتقدم"], submitted: ["Submitted", "تاريخ التقديم"],
    approve: ["Approve", "موافقة"], reject: ["Reject", "رفض"], review: ["Review", "مراجعة"],
    reviewNote: ["Review note", "ملاحظة المراجعة"], reviewNoteHint: ["Optional note for the rejection.", "ملاحظة اختيارية لرفض الطلب."],
    reviewApproved: ["Application approved. The applicant must sign in again to use provider tools.", "تمت الموافقة. يجب على المتقدم تسجيل الدخول مجدداً لاستخدام أدوات المزود."],
    reviewRejected: ["Application rejected. The applicant can submit a new one.", "تم رفض الطلب. يمكن للمتقدم إرسال طلب جديد."],
    providerApplication: ["Provider application", "طلب مزود الخدمة"],
    statusPending: ["Pending review", "قيد المراجعة"], statusApproved: ["Approved", "تمت الموافقة"], statusRejected: ["Rejected", "مررفض"],
    pendingHint: ["Waiting for an administrator. No provider permissions are granted yet.", "في انتظار مراجعة المسؤول. لا تمنح هذه الصفحة صلاحيات المزود بعد."],
    approvedHint: ["Approved. The applicant must sign in again to use provider tools.", "تمت الموافقة. يجب على المتقدم تسجيل الدخول مجدداً لاستخدام أدوات المزود."],
    rejectedHint: ["The administrator rejected this application. You can submit a new one.", "رفض المسؤول هذا الطلب. يمكنك إرسال طلب جديد."],
    reapply: ["Apply again", "إعادة التقديم"],
    loading: ["Loading…", "جارٍ التحميل…"]
  };
  const tr = key => (text[key] || [key, key])[q.state.currentLang === "ar" ? 1 : 0];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const state = { user: null, status: "checking", view: "login", busy: false, error: null, notice: "", challenge: "", phone: "", pendingPhone: "", secret: "", requestView: "", applications: null, applicationsError: null, applicationId: "", application: null, reviewAction: "", adminStatus: null };
  let dialog, returnFocus;
  const views = {
    login: ["login", "login", ["phone", "password", "totp"]],
    register: ["register", "register", ["phone", "password", "email"]],
    verify: ["verify", "verify-phone", ["code", "password"]],
    resend: ["resend", "resend", ["phone"]],
    recovery: ["recovery", "recovery/request", ["phone"]],
    recoverConfirm: ["recoverConfirm", "recovery/confirm", ["code", "newPassword", "totp"]],
    phoneChange: ["phoneChange", "phone-change/request", ["newPhone", "password", "totp"]],
    phoneConfirm: ["phoneConfirm", "phone-change/confirm", ["code", "password"]],
    apply: ["apply", "provider/apply", ["nameEn", "nameAr"]],
    adminStatus: ["adminStatus", "admin/totp/status", ["phone", "password"]],
    adminReview: ["adminReview", null, ["password", "totp", "note"]],
    adminApplications: ["adminApplications", null, []],
    setup: ["setup", "admin/totp/setup", ["phone", "password"]],
    secretStep: ["secretStep", "admin/totp/secret", ["code", "password"]],
    totpVerify: ["totpVerify", "admin/totp/verify", ["phone", "password", "totp"]]
  };
  const CONFIRM = ["verify", "recoverConfirm", "phoneConfirm", "secretStep"];
  function button(view, label = view) {
    return `<button type="button" class="btn btn-secondary btn-sm" data-view="${view}" ${state.busy ? "disabled" : ""}>${tr(label)}</button>`;
  }
  function statusText() {
    return state.status === "checking" ? tr("checking")
      : state.user ? state.user.phoneNumber
      : tr(state.status === "unavailable" ? "unavailable" : "anonymous");
  }
  function updateBar() {
    document.querySelectorAll("[data-account-status]").forEach(el => {
      el.textContent = statusText();
      el.setAttribute("dir", state.user ? "ltr" : "auto");
    });
  }
  function field(name) {
    if (name === "note") return `<label class="account-field" for="account-note">${tr("reviewNote")}
      <textarea id="account-note" class="form-input" name="note" maxlength="256" rows="2" placeholder="${esc(tr("reviewNoteHint"))}"></textarea></label>`;
    const password = name === "password" || name === "newPassword";
    const code = name === "code" || name === "totp";
    const phone = name === "phone" || name === "newPhone";
    const optional = name === "email" || (name === "totp" && state.view !== "totpVerify");
    const value = name === "phone" ? state.phone
      : state.view === "apply" && name === "nameEn" ? state.user?.providerApplication?.nameEn
      : state.view === "apply" && name === "nameAr" ? state.user?.providerApplication?.nameAr
      : "";
    return `<label class="account-field" for="account-${name}">${tr(name)}
      <input id="account-${name}" class="form-input" name="${name}" type="${password ? "password" : phone ? "tel" : name === "email" ? "email" : "text"}"
        ${optional ? "" : "required"} ${code ? 'inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6"' : `maxlength="${password ? 128 : phone ? 64 : 254}"`}
        ${password && (state.view === "register" || name === "newPassword") ? 'minlength="12"' : ""}
        autocomplete="${password ? (state.view === "register" || name === "newPassword" ? "new-password" : "current-password") : code ? "one-time-code" : phone ? "tel" : name === "email" ? "email" : "organization"}"
        ${phone || code || password || name === "email" ? 'dir="ltr"' : ""}
        value="${esc(name === "phone" ? state.phone : value)}" ${phone ? 'placeholder="+20 …"' : ""}>
    </label>`;
  }
  function errorPanel() {
    if (!state.error) return "";
    const detail = ["configuration", "network", "timeout"].includes(state.error.message) ? "" : (state.error.message || "");
    const key = ["error0", "error400", "error401", "error403", "error429", "error503", "error"][state.error.status];
    return `<div role="alert" class="account-error">${tr(key)}
      ${detail && detail !== key ? `<details><summary>${tr("details")}</summary><p dir="auto">${esc(detail)}</p></details>` : ""}</div>`;
  }
  function noticePanel() { return state.notice ? `<p role="status" class="account-notice">${tr(state.notice)}</p>` : ""; }
  function renderProviderStatus() {
    const application = state.user?.providerApplication;
    if (!application) return `<div class="account-actions">${button("apply")}</div>`;
    const status = ["Pending", "Approved", "Rejected"].includes(application.status) ? application.status : "Pending";
    const note = status === "Rejected" ? `<p class="text-xs" dir="auto">${esc(application.note || "")}</p>` : "";
    const hintKey = status === "Pending" ? "pendingHint" : status === "Approved" ? "approvedHint" : "rejectedHint";
    return `
      <div class="account-application">
        <p><strong>${tr("providerApplication")}</strong>: ${tr("status" + status)}</p>
        ${note}
        <p class="text-xs text-secondary">${tr(hintKey)}</p>
        <div class="account-actions">${status === "Rejected" ? button("apply", "reapply") : ""}</div>
      </div>`;
  }
  function renderAdminApplications() {
    const list = Array.isArray(state.applications) ? state.applications : [];
    const rows = list.length === 0
      ? `<p class="text-sm text-secondary">${tr("noPending")}</p>`
      : list.map(app => `
        <div class="account-list-item">
          <p><strong dir="ltr">${esc(app.phone || "")}</strong> — ${esc(app.nameEn)} / ${esc(app.nameAr)}</p>
          <p class="text-xs text-secondary">${tr("submitted")}: ${esc(new Date(app.submittedAt).toLocaleDateString(q.state.currentLang === "ar" ? "ar" : "en"))}</p>
          <div class="account-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-review="approve" data-app="${app.id}" ${state.busy ? "disabled" : ""}>${tr("approve")}</button>
            <button type="button" class="btn btn-secondary btn-sm" data-review="reject" data-app="${app.id}" ${state.busy ? "disabled" : ""}>${tr("reject")}</button>
          </div>
        </div>`).join("");
    if (state.applicationsError) return `<div role="alert" class="account-error">${tr(state.applicationsError.status === 401 ? "error0" : "error")}</div>${rows}`;
    return `<div class="account-list">${rows}</div>`;
  }
  function render(focus = true) {
    updateBar();
    if (!dialog?.open) return;
    const view = views[state.view];
    const confirm = CONFIRM.includes(state.view);
    let body;
    if (state.view === "account") {
      body = `
        <div class="account-heading"><h2 id="account-title" tabindex="-1">${tr("account")}</h2>
          <button type="button" class="btn btn-secondary btn-sm" data-close ${state.busy ? "disabled" : ""}>${tr("close")}</button></div>
        <p class="text-sm text-secondary">${tr("separation")}</p>
        ${errorPanel()}
        ${noticePanel()}
        ${state.user ? `
          <p><bdi dir="ltr">${esc(state.user.phoneNumber)}</bdi></p>
          <p>${tr("roles")}: ${state.user.roles.map(r => esc(tr(r))).join("، ") || ""}</p>
          <p class="text-xs">${tr("id")}: <bdi>${esc(state.user.id)}</bdi></p>
          <div class="account-actions">${button("phoneChange")}${state.user?.roles?.includes("PlatformAdmin") ? button("adminApplications") : ""}<button class="btn btn-secondary" data-logout ${state.busy ? "disabled" : ""}>${tr("logout")}</button></div>
          ${renderProviderStatus()}
        ` : `<div class="account-actions">${button("apply")}</div>`}`;
    } else if (state.view === "adminApplications") {
      body = `
        <div class="account-heading"><h2 id="account-title" tabindex="-1">${tr("adminApplications")}</h2>
          <button type="button" class="btn btn-secondary btn-sm" data-close ${state.busy ? "disabled" : ""}>${tr("close")}</button></div>
        <p class="text-sm text-secondary">${tr("separation")}</p>
        ${errorPanel()}
        ${state.applications === null && !state.applicationsError && !state.busy ? `<p class="text-sm text-secondary">${tr("loading")}</p>` : ""}
        ${renderAdminApplications()}`;
    } else if (state.view === "adminReview") {
      body = `
        <div class="account-heading"><h2 id="account-title" tabindex="-1">${tr("reviewApplication")}</h2>
          <button type="button" class="btn btn-secondary btn-sm" data-close ${state.busy ? "disabled" : ""}>${tr("close")}</button></div>
        <p class="text-sm text-secondary">${tr("separation")}</p>
        ${errorPanel()}
        ${noticePanel()}
        ${state.application ? `<div class="account-application"><p>${tr("applicant")}: ${esc(state.application.nameEn)} / ${esc(state.application.nameAr)} (${esc(state.application.phone || "")})</p>
          <p class="text-xs text-secondary">${tr("submitted")}: ${esc(new Date(state.application.submittedAt).toLocaleDateString(q.state.currentLang === "ar" ? "ar" : "en"))}</p></div>` : ""}
        <form id="account-form" aria-busy="${state.busy}">
          <fieldset ${state.busy ? "disabled" : ""}>${view[2].filter(n => n !== "note" || state.reviewAction === "reject").map(field).join("")}
          <button class="btn btn-primary" type="submit">${tr(state.busy ? "busy" : view[0])}</button></fieldset>
        </form>
        ${state.reviewAction === "reject" ? `<p class="text-xs text-secondary">${tr("reviewNoteHint")}</p>` : ""}
        <div class="account-actions">${confirm ? button(state.requestView, "requestAgain") : ""}
          ${["login", "register", "resend", "recovery", "adminStatus"].filter(v => v !== state.view).map(v => button(v)).join("")}
          ${state.user ? button("account") : ""}</div>
        <p class="text-xs text-secondary">${tr("lost")}</p>
        <button class="btn btn-secondary btn-sm" data-refresh ${state.busy ? "disabled" : ""}>${tr("retry")}</button>`;
    } else {
      body = `
        <div class="account-heading"><h2 id="account-title" tabindex="-1">${tr(state.view === "account" ? "account" : view[0])}</h2>
          <button type="button" class="btn btn-secondary btn-sm" data-close ${state.busy ? "disabled" : ""}>${tr("close")}</button></div>
        <p class="text-sm text-secondary">${tr("separation")}</p>
        ${errorPanel()}
        ${noticePanel()}
        ${confirm ? `<div class="account-otp"><p>${tr("otpHint")}</p><label>${tr("challenge")}<input class="form-input" readonly dir="ltr" value="${esc(state.challenge)}"></label>
          <p class="text-xs">${tr("dev")}</p></div>` : ""}
        ${state.secret ? `<p>${tr("secretHint")}</p><code class="account-secret" dir="ltr">${esc(state.secret)}</code>` : ""}
        <form id="account-form" aria-busy="${state.busy}">
          <fieldset ${state.busy ? "disabled" : ""}>${view[2].map(field).join("")}
          ${["register", "login"].includes(state.view) ? `<p class="text-xs text-secondary">${tr("hint")}</p>` : ""}
          <button class="btn btn-primary" type="submit">${tr(state.busy ? "busy" : view[0])}</button></fieldset>
        </form>
        <div class="account-actions">${confirm ? button(state.requestView, "requestAgain") : ""}
          ${["login", "register", "resend", "recovery", "adminStatus"].filter(v => v !== state.view).map(v => button(v)).join("")}
          ${state.user ? button("account") : ""}</div>
        <p class="text-xs text-secondary">${tr("lost")}</p>
        <button class="btn btn-secondary btn-sm" data-refresh ${state.busy ? "disabled" : ""}>${tr("retry")}</button>`;
      if (state.view === "adminStatus") {
        body += `
        <div class="account-actions">${state.adminStatus ? (state.adminStatus.admin
          ? `<button type="button" class="btn btn-primary" data-view="setup" ${state.busy ? "disabled" : ""}>${tr("setup")}</button>${state.adminStatus.enrolled ? `<button type="button" class="btn btn-secondary" data-view="login" ${state.busy ? "disabled" : ""}>${tr("signInWithAuthenticator")}</button>` : ""}`
          : `<button type="button" class="btn btn-secondary" data-view="login" ${state.busy ? "disabled" : ""}>${tr("notAdmin")}</button>`) : `<button type="button" class="btn btn-primary" data-view="adminStatus" ${state.busy ? "disabled" : ""}>${tr("adminStatusCheck")}</button>`}</div>`;
      }
    }
    dialog.innerHTML = `<div class="account-shell">
      ${body}
    </div>`;
    if (focus) dialog.querySelector("#account-title").focus();
  }
  function navigate(view) {
    if (state.busy) return;
    state.view = view; state.error = null; state.notice = ""; state.secret = "";
    if (["verify", "recoverConfirm", "phoneConfirm", "secretStep"].includes(view)) state.challenge = "";
    if (view === "adminApplications") {
      state.busy = true; state.applicationsError = null; state.applications = null;
      render();
      loadApplications().finally(() => { state.busy = false; render(); });
      return;
    }
    render();
  }
  async function loadApplications() {
    state.busy = true;
    state.applicationsError = null; state.applications = null;
    try { state.applications = await q.authApi.request("/admin/provider-applications"); }
    catch (error) { state.applicationsError = error; }
    finally { state.busy = false; }
  }
  async function restore() {
    try {
      state.user = await q.authApi.request("me");
      state.status = "ready";
      if (state.error?.status === 0) state.error = null;
    } catch (error) {
      state.user = null; state.status = [401, 403].includes(error.status) ? "ready" : "unavailable";
      if (state.status === "unavailable") state.error = error;
    }
    if (!state.user && ["account", "apply", "phoneChange", "phoneConfirm"].includes(state.view)) state.view = "login";
    updateBar();
  }
  async function submit(form) {
    if (state.busy) return;
    const input = Object.fromEntries(new FormData(form));
    for (const key of Object.keys(input)) if (!input[key]) delete input[key];
    if (state.challenge) input.challengeId = state.challenge;
    if (input.phone) state.phone = input.phone;
    const current = state.view;
    state.busy = true; state.error = null; state.notice = "";
    // Disable in place during submission to prevent duplicate requests.
    form.setAttribute("aria-busy", "true");
    dialog.querySelectorAll("button, fieldset").forEach(el => el.disabled = true);
    form.querySelector('button[type="submit"]').textContent = tr("busy");
    try {
      if (current === "adminStatus") {
        state.adminStatus = await q.authApi.request("admin/totp/status", { phone: input.phone, password: input.password });
        state.notice = state.adminStatus.admin ? (state.adminStatus.enrolled ? "enrolled" : "notEnrolled") : "notAdmin";
        state.error = null;
        return;
      }
      if (current === "adminReview") {
        await q.authApi.request(`/admin/provider-applications/${state.applicationId}/${state.reviewAction}`, {
          password: input.password, totp: input.totp, note: input.note
        });
        state.applications = (Array.isArray(state.applications) ? state.applications : []).filter(a => a.id !== state.applicationId);
        state.view = "adminApplications"; state.notice = state.reviewAction === "approve" ? "reviewApproved" : "reviewRejected";
        state.error = null; state.secret = "";
        return;
      }
      const data = await q.authApi.request(views[current][1], input);
      const next = { register: "verify", resend: "verify", recovery: "recoverConfirm", phoneChange: "phoneConfirm", setup: "secretStep" };
      if (current === "phoneChange") state.pendingPhone = input.newPhone;
      if (next[current]) {
        state.challenge = data.challengeId;
        state.requestView = current === "register" ? "resend" : current;
        state.view = next[current];
      } else if (current === "secretStep") {
        state.secret = data.secret; state.view = "totpVerify"; state.challenge = "";
      } else if (current === "login" || current === "totpVerify") {
        state.secret = ""; state.challenge = ""; await restore(); state.view = state.user ? "account" : "login";
      } else if (current === "apply") { await restore(); state.view = "account"; state.notice = "pending"; }
      else {
        state.challenge = ""; state.secret = ""; state.view = "login";
        state.notice = current === "verify" ? (data?.accountExists ? "exists" : "verified")
          : current === "recoverConfirm" ? "reset" : current === "phoneConfirm" ? "changed" : "signedOut";
      }
      if (current === "verify" && data?.accountExists) { state.view = "login"; state.notice = "exists"; state.challenge = ""; }
    } catch (error) {
      state.error = error;
      if ([401, 403].includes(error.status) && state.user) {
        await restore();
        if (!state.user) state.view = "login";
      }
      if (current === "login" && error.status === 403) { state.notice = "enrollRequired"; state.error = null; }
    } finally {
      state.busy = false;
      // Passwords/codes intentionally clear after submission; never persist them.
      render();
    }
  }
  q.account = {
    bar: () => `<aside class="account-bar container"><div><strong>${tr("account")}</strong> · <span data-account-status dir="${state.user ? "ltr" : "auto"}">${esc(statusText())}</span>
      <p class="text-xs text-secondary">${tr("separation")}</p></div><button class="btn btn-secondary btn-sm" onclick="window.Qareeb.account.open()">${tr("account")}</button></aside>`,
    open() {
      returnFocus = document.activeElement;
      state.view = state.user ? "account" : "login"; state.error = null; state.notice = "";
      dialog.showModal(); render();
    }
  };
  document.addEventListener("DOMContentLoaded", async () => {
    dialog = document.createElement("dialog");
    dialog.className = "account-dialog";
    dialog.setAttribute("aria-labelledby", "account-title");
    document.body.append(dialog);
    dialog.addEventListener("cancel", event => { if (state.busy) event.preventDefault(); });
    dialog.addEventListener("close", () => {
      state.secret = ""; state.challenge = ""; dialog.innerHTML = ""; returnFocus?.focus();
    });
    window.addEventListener("focus", async () => {
      if (state.busy) return;
      const previous = state.user?.id;
      await restore();
      if (previous !== state.user?.id) render();
    });
    dialog.addEventListener("submit", event => { event.preventDefault(); submit(event.target); });
    dialog.addEventListener("click", async event => {
      const button = event.target.closest("button");
      if (!button || state.busy) return;
      if (button.hasAttribute("data-close")) dialog.close();
      else if (button.dataset.view) navigate(button.dataset.view);
      else if (button.dataset.review) {
        state.applicationId = button.dataset.app;
        state.application = (Array.isArray(state.applications) ? state.applications : []).find(a => a.id === state.applicationId) || null;
        state.reviewAction = button.dataset.review;
        state.view = "adminReview"; state.error = null; state.notice = ""; render();
      }
      else if (button.hasAttribute("data-refresh")) { state.busy = true; await restore(); state.busy = false; render(); }
      else if (button.hasAttribute("data-logout")) {
        state.busy = true; render();
        try { await q.authApi.request("logout", {}); state.user = null; state.view = "login"; state.notice = "signedOut"; state.error = null; }
        catch (error) { state.error = error; await restore(); }
        finally { state.busy = false; render(); }
      }
    });
    await restore(); updateBar();
  });
  let language = q.state.currentLang;
  q.subscribe(() => {
    // The marketplace rerenders independently; account fields survive toast/demo changes.
    queueMicrotask(updateBar);
    if (language !== q.state.currentLang) { language = q.state.currentLang; render(false); }
  });
})();
