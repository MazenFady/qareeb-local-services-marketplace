/**
 * Qareeb (قريب) — Floating Toast Notification Renderer
 */
window.Qareeb = window.Qareeb || {};
window.Qareeb.components = window.Qareeb.components || {};

window.Qareeb.components.ToastContainer = function() {
  const { toasts } = window.Qareeb.state;
  if (!toasts || toasts.length === 0) return "";

  return `
    <div class="toast-container" aria-live="polite">
      ${toasts.map(toast => {
        let icon = "ℹ️";
        if (toast.type === "success") icon = "✅";
        if (toast.type === "warning") icon = "⚠️";
        if (toast.type === "danger") icon = "🚫";

        return `
          <div class="toast toast-${toast.type}">
            <span style="font-size: 1.1rem;">${icon}</span>
            <div style="flex: 1; font-weight: 500;">${toast.message}</div>
            <button onclick="window.Qareeb.actions.removeToast(${toast.id})" style="color: var(--text-muted); padding: 0.2rem;" aria-label="Dismiss">
              ✕
            </button>
          </div>
        `;
      }).join("")}
    </div>
  `;
};
