// ══════════════════════════════════════
//  CONFIG LOADER — con cache instantaneo
// ══════════════════════════════════════
(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyBEoaT_ldwRxBlRe6dpAc2WKBWcbjlmHp0",
    authDomain: "app-cafeteria-c4518.firebaseapp.com",
    databaseURL: "https://app-cafeteria-c4518-default-rtdb.firebaseio.com",
    projectId: "app-cafeteria-c4518",
    storageBucket: "app-cafeteria-c4518.firebasestorage.app",
    messagingSenderId: "1046878638257",
    appId: "1:1046878638257:web:2a93aa93b8e43570c75290"
  };

  // ── Aplicar cache instantaneamente antes de que cargue nada ──
  try {
    const cached = localStorage.getItem("cafeteria_config");
    if (cached) applyConfig(JSON.parse(cached));
  } catch(e) {}

  // ── Luego sincronizar con Firebase en segundo plano ──
  Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js")
  ]).then(([{ initializeApp }, { getDatabase, ref, get }]) => {
    let app;
    try { app = initializeApp(firebaseConfig, "config-loader"); }
    catch(e) { try { app = initializeApp(firebaseConfig); } catch(e2) {} }
    if (!app) return;
    const db = getDatabase(app);

    get(ref(db, "config")).then(snap => {
      if (!snap.exists()) return;
      const c = snap.val();
      applyConfig(c);
      try { localStorage.setItem("cafeteria_config", JSON.stringify(c)); } catch(e) {}
    }).catch(() => {});
  });

  function applyConfig(c) {
    if (!c) return;
    const root = document.documentElement;

    // ── Colores ──
    if (c.colorPrimario) {
      root.style.setProperty("--terracota",     c.colorPrimario);
      root.style.setProperty("--terracota-dim", hexToRgba(c.colorPrimario, 0.12));
      root.style.setProperty("--terracota-mid", hexToRgba(c.colorPrimario, 0.3));
    }
    if (c.colorSidebar) root.style.setProperty("--espresso", c.colorSidebar);
    if (c.colorFondo)   { root.style.setProperty("--bg", c.colorFondo); root.style.setProperty("--bg-warm", c.colorFondo); }

    // ── Fondo de pantalla ──
    if (c.fondoUrl) {
      // En index.html: aplicar al panel derecho
      const panelDerecho = document.getElementById("contenidoDerecho");
      if (panelDerecho) {
        panelDerecho.style.backgroundImage    = `url('${c.fondoUrl}')`;
        panelDerecho.style.backgroundSize     = "cover";
        panelDerecho.style.backgroundPosition = "center";
        panelDerecho.style.backgroundRepeat   = "no-repeat";
        // Ocultar logo central
        const logoCentral = document.getElementById("logoCentral");
        if (logoCentral) logoCentral.style.display = "none";
      } else {
        // En otras páginas: aplicar al body
        document.body.style.backgroundImage    = `url('${c.fondoUrl}')`;
        document.body.style.backgroundSize     = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
      }
    } else {
      document.body.style.backgroundImage = "";
      const panelDerecho = document.getElementById("contenidoDerecho");
      if (panelDerecho) panelDerecho.style.backgroundImage = "";
      const logoCentral = document.getElementById("logoCentral");
      if (logoCentral) logoCentral.style.display = "";
    }

    // ── Logo ──
    if (c.logoUrl) {
      // Aplica a todas las imagenes de logo incluyendo splash
      document.querySelectorAll('img[alt="Logo"], img[alt="Logo central"], .logo-ring img').forEach(img => {
        img.src = c.logoUrl;
      });
      const favicon = document.querySelector('link[rel="icon"]');
      const apple   = document.querySelector('link[rel="apple-touch-icon"]');
      if (favicon) favicon.href = c.logoUrl;
      if (apple)   apple.href   = c.logoUrl;
    }

    // ── Nombre ──
    if (c.nombreApp) {
      const sidebarH1 = document.querySelector(".logo-superior h1");
      if (sidebarH1) {
        const partes = c.nombreApp.split(" ");
        sidebarH1.innerHTML = partes.length > 1
          ? partes[0] + "<br>" + partes.slice(1).join(" ")
          : c.nombreApp;
      }
      document.querySelectorAll(".nombre-app").forEach(el => el.textContent = c.nombreApp);
      document.title = c.nombreApp;
    }

    // ── Subtitulo ──
    if (c.subtitulo) {
      document.querySelectorAll(".app-subtitulo").forEach(el => el.textContent = c.subtitulo);
    }

    // ── Tipografia ──
    if (c.tipografia) {
      const linkId = "cfg-font-link";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id   = linkId;
        link.rel  = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${c.tipografia.replace(/ /g,"+")}:wght@400;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
      root.style.setProperty("--font-display", `'${c.tipografia}', serif`);
      document.querySelectorAll("h1,h2,h3,.titulo-cuadro,.splash-title,.turno-info,.modal-title").forEach(el => {
        el.style.fontFamily = `'${c.tipografia}', serif`;
      });
    }
  }

  function hexToRgba(hex, alpha) {
    try {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return `rgba(${r},${g},${b},${alpha})`;
    } catch(e) { return "transparent"; }
  }

  window._applyConfig = applyConfig;
})();
