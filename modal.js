// ══════════════════════════════════════
//  MODAL — reemplaza alert() y confirm()
// ══════════════════════════════════════
(function() {
  const css = `
    #modal-bg {
      display: none;
      position: fixed; inset: 0;
      background: rgba(10,7,4,0.75);
      backdrop-filter: blur(6px);
      z-index: 8000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    #modal-bg.open { display: flex; }
    #modal-box {
      background: #1C1410;
      border: 1px solid rgba(200,169,110,0.18);
      border-radius: 20px;
      padding: 28px 26px 22px;
      max-width: 340px;
      width: 100%;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      animation: modalIn 0.3s cubic-bezier(0.34,1.4,0.64,1) both;
      text-align: center;
    }
    .modal-icon   { font-size: 36px; margin-bottom: 12px; }
    .modal-title  { font-family:'Cormorant Garamond',serif; font-size:22px; color:#F2E8D9; margin-bottom:8px; font-weight:700; }
    .modal-msg    { font-family:'Outfit',sans-serif; font-size:14px; color:#8A7560; line-height:1.6; margin-bottom:22px; }
    .modal-btns   { display:flex; gap:10px; justify-content:center; }
    .modal-btn    { flex:1; padding:12px; border-radius:12px; border:1px solid rgba(200,169,110,0.18); font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.18s; }
    .modal-btn-ok      { background:rgba(200,169,110,0.18); color:#C8A96E; }
    .modal-btn-ok:hover{ background:rgba(200,169,110,0.3); }
    .modal-btn-cancel  { background:rgba(35,26,18,0.5); color:#8A7560; }
    .modal-btn-cancel:hover{ background:rgba(35,26,18,0.8); color:#F2E8D9; }
    .modal-btn-danger  { background:rgba(184,80,64,0.2); color:#E08878; border-color:rgba(184,80,64,0.3); }
    .modal-btn-danger:hover{ background:rgba(184,80,64,0.35); }
    @keyframes modalIn { from{opacity:0;transform:scale(0.85) translateY(20px);} to{opacity:1;transform:scale(1) translateY(0);} }

    /* Select de método de pago */
    .modal-select {
      width: 100%;
      background: rgba(15,11,8,0.7);
      border: 1px solid rgba(200,169,110,0.18);
      border-radius: 10px;
      color: #F2E8D9;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      padding: 11px 14px;
      margin-bottom: 20px;
      outline: none;
      appearance: none;
    }
    .modal-select option { background: #1C1410; }
    .modal-select:focus { border-color: #C8A96E; }

    /* Input de texto en modal */
    .modal-input {
      width: 100%;
      background: rgba(15,11,8,0.7);
      border: 1px solid rgba(200,169,110,0.18);
      border-radius: 10px;
      color: #F2E8D9;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      padding: 11px 14px;
      margin-bottom: 20px;
      outline: none;
    }
    .modal-input:focus { border-color: #C8A96E; }
    .modal-input::placeholder { color: #8A7560; opacity: 0.6; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const bg = document.createElement("div");
  bg.id = "modal-bg";
  bg.innerHTML = '<div id="modal-box"></div>';
  document.body.appendChild(bg);

  const box = document.getElementById("modal-box");

  function close() { bg.classList.remove("open"); box.innerHTML = ""; }

  // Alerta simple
  window.modalAlert = function(msg, icon = "ℹ️", title = "") {
    return new Promise(resolve => {
      box.innerHTML =
        (icon ? '<div class="modal-icon">' + icon + '</div>' : '') +
        (title ? '<div class="modal-title">' + title + '</div>' : '') +
        '<div class="modal-msg">' + msg + '</div>' +
        '<div class="modal-btns"><button class="modal-btn modal-btn-ok" id="m-ok">Aceptar</button></div>';
      bg.classList.add("open");
      document.getElementById("m-ok").onclick = () => { close(); resolve(); };
    });
  };

  // Confirmación
  window.modalConfirm = function(msg, icon = "⚠️", title = "", danger = false) {
    return new Promise(resolve => {
      box.innerHTML =
        (icon ? '<div class="modal-icon">' + icon + '</div>' : '') +
        (title ? '<div class="modal-title">' + title + '</div>' : '') +
        '<div class="modal-msg">' + msg + '</div>' +
        '<div class="modal-btns">' +
          '<button class="modal-btn modal-btn-cancel" id="m-no">Cancelar</button>' +
          '<button class="modal-btn ' + (danger ? 'modal-btn-danger' : 'modal-btn-ok') + '" id="m-yes">Confirmar</button>' +
        '</div>';
      bg.classList.add("open");
      document.getElementById("m-yes").onclick = () => { close(); resolve(true); };
      document.getElementById("m-no").onclick  = () => { close(); resolve(false); };
    });
  };

  // Selector de método de pago
  window.modalMetodoPago = function() {
    return new Promise(resolve => {
      box.innerHTML =
        '<div class="modal-icon">💳</div>' +
        '<div class="modal-title">Método de pago</div>' +
        '<div class="modal-msg">Seleccioná cómo abona el cliente</div>' +
        '<select class="modal-select" id="m-metodo">' +
          '<option value="Efectivo">💵 Efectivo</option>' +
          '<option value="Débito">💳 Débito</option>' +
          '<option value="Crédito">🏦 Crédito</option>' +
          '<option value="Transferencia">📲 Transferencia</option>' +
        '</select>' +
        '<div class="modal-btns">' +
          '<button class="modal-btn modal-btn-cancel" id="m-no">Cancelar</button>' +
          '<button class="modal-btn modal-btn-ok" id="m-yes">Cobrar</button>' +
        '</div>';
      bg.classList.add("open");
      document.getElementById("m-yes").onclick = () => {
        const val = document.getElementById("m-metodo").value;
        close(); resolve(val);
      };
      document.getElementById("m-no").onclick = () => { close(); resolve(null); };
    });
  };

  // Input de texto
  window.modalInput = function(msg, placeholder = "", icon = "✏️") {
    return new Promise(resolve => {
      box.innerHTML =
        '<div class="modal-icon">' + icon + '</div>' +
        '<div class="modal-msg">' + msg + '</div>' +
        '<input class="modal-input" id="m-input" placeholder="' + placeholder + '">' +
        '<div class="modal-btns">' +
          '<button class="modal-btn modal-btn-cancel" id="m-no">Cancelar</button>' +
          '<button class="modal-btn modal-btn-ok" id="m-yes">Guardar</button>' +
        '</div>';
      bg.classList.add("open");
      const inp = document.getElementById("m-input");
      inp.focus();
      inp.addEventListener("keydown", e => { if(e.key==="Enter") document.getElementById("m-yes").click(); });
      document.getElementById("m-yes").onclick = () => { close(); resolve(inp.value || null); };
      document.getElementById("m-no").onclick  = () => { close(); resolve(null); };
    });
  };

  // Cerrar al click fuera
  bg.addEventListener("click", e => { if(e.target === bg) close(); });
})();