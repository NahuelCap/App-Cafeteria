// ══════════════════════════════════════
//  TOAST — sistema de notificaciones
// ══════════════════════════════════════
(function() {
  const css = `
    #toast-container {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 20px;
      border-radius: 50px;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      white-space: nowrap;
      animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
      pointer-events: auto;
    }
    .toast-item.out { animation: toastOut 0.3s ease forwards; }
    .toast-success { background: rgba(61,107,58,0.92); border: 1px solid rgba(125,196,122,0.4); color: #C8EEC5; }
    .toast-error   { background: rgba(184,80,64,0.92);  border: 1px solid rgba(224,136,120,0.4); color: #FFD4CC; }
    .toast-info    { background: rgba(35,26,18,0.95);   border: 1px solid rgba(200,169,110,0.35); color: #F2E8D9; }
    .toast-icon    { font-size: 16px; }
    @keyframes toastIn  { from { opacity:0; transform:translateY(20px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes toastOut { to   { opacity:0; transform:translateY(10px) scale(0.95); } }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "toast-container";
  document.body.appendChild(container);

  window.toast = function(msg, type = "info", duration = 2800) {
    const icons = { success:"✓", error:"✕", info:"·" };
    const el = document.createElement("div");
    el.className = "toast-item toast-" + type;
    el.innerHTML = '<span class="toast-icon">' + icons[type] + '</span>' + msg;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 300);
    }, duration);
  };
})();