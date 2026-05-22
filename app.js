import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEoaT_ldwRxBlRe6dpAc2WKBWcbjlmHp0",
  authDomain: "app-cafeteria-c4518.firebaseapp.com",
  databaseURL: "https://app-cafeteria-c4518-default-rtdb.firebaseio.com",
  projectId: "app-cafeteria-c4518",
  storageBucket: "app-cafeteria-c4518.firebasestorage.app",
  messagingSenderId: "1046878638257",
  appId: "1:1046878638257:web:2a93aa93b8e43570c75290"
};

let app;
try { app = initializeApp(firebaseConfig); }
catch(e) { app = initializeApp(firebaseConfig, "app_js_" + Date.now()); }
const db = getDatabase(app);

// ══════════════════════════════════════
//  MENÚ — se carga desde Firebase
// ══════════════════════════════════════
window._menuData = {};

// Cargar menu desde Firebase al iniciar
onValue(ref(db, "menu"), (snapshot) => {
  if (!snapshot.exists()) {
    window._menuData = {};
    return;
  }
  const data = snapshot.val();
  // Convertir de objeto Firebase a arrays
  const menu = {};
  for (const categoria in data) {
    menu[categoria] = Object.values(data[categoria]);
  }
  window._menuData = menu;
});

let pedido    = [];
let total     = 0;
let notaMesa  = "";

window.onload = async function(){
  let mesa     = sessionStorage.getItem("mesa");
  let empleado = sessionStorage.getItem("mozo");
  let titulo   = document.getElementById("mesa");
  if (titulo) titulo.innerText = "Mesa " + mesa;

  if (empleado && mesa) {
    const snapshot = await get(child(ref(db), "mesas/" + empleado + "/" + mesa));
    if (snapshot.exists()) {
      const data = snapshot.val();
      pedido   = data.pedido  || [];
      total    = Number(data.total) || 0;
      notaMesa = data.nota    || "";
      mostrar();
      actualizarNotaUI();
    }
  }
};

window.agregar = function(nombre, precio) {
  precio = Number(precio);
  let producto = pedido.find(p => p.nombre === nombre);
  if (producto) { producto.cantidad++; producto.subtotal += precio; }
  else { pedido.push({ nombre, precio, cantidad:1, subtotal:precio }); }
  total += precio;
  mostrar();
  if (typeof toast !== "undefined") toast(nombre + " agregado", "success", 1600);
};

function mostrar() {
  let lista = document.getElementById("lista");
  if (!lista) return;
  lista.innerHTML = "";
  pedido.forEach((p, index) => {
    let li = document.createElement("li");
    li.innerHTML =
      '<span class="nombre-item">' + p.nombre +
      (p.detalle ? ' <em style="color:var(--muted);font-size:12px;">(' + p.detalle + ')</em>' : '') +
      '</span>' +
      '<span style="color:var(--terracota);font-family:\'Playfair Display\',serif;font-size:16px;margin:0 4px;">×' + p.cantidad + '</span>' +
      '<button onclick="sumar('  + index + ')">➕</button>' +
      '<button onclick="restar(' + index + ')">➖</button>' +
      '<button onclick="agregarDetalle(' + index + ')">✏️</button>' +
      '<button onclick="eliminarProducto(' + index + ')">❌</button>';
    lista.appendChild(li);
  });
  let totalEl = document.getElementById("total");
  if (totalEl) totalEl.innerText = "$" + Number(total).toLocaleString('es-AR');
}

function actualizarNotaUI() {
  const notaEl   = document.getElementById("nota-mesa-texto");
  if (notaEl)   notaEl.textContent = notaMesa || "Sin nota";
  const notaWrap = document.getElementById("nota-wrap");
  if (notaWrap) notaWrap.style.display = notaMesa ? "flex" : "none";
}

window.sumar = function(index) {
  let precio = Number(pedido[index].precio);
  pedido[index].cantidad++;
  pedido[index].subtotal += precio;
  total += precio;
  mostrar();
};

window.restar = function(index) {
  let precio = Number(pedido[index].precio);
  pedido[index].cantidad--;
  pedido[index].subtotal -= precio;
  total -= precio;
  if (pedido[index].cantidad <= 0) pedido.splice(index, 1);
  mostrar();
};

window.eliminarProducto = function(index) {
  total -= pedido[index].subtotal;
  pedido.splice(index, 1);
  mostrar();
};

window.enviarPedido = async function() {
  let mesa     = sessionStorage.getItem("mesa");
  let empleado = sessionStorage.getItem("mozo");
  if (!empleado) { if (typeof toast !== "undefined") toast("No hay empleado logueado", "error"); return; }
  if (pedido.length === 0) { if (typeof toast !== "undefined") toast("No hay productos en el pedido", "error"); return; }

  const datos = { mesa, mozo:empleado, pedido, total:Number(total), nota:notaMesa };
  await set(ref(db, "mesas/" + empleado + "/" + mesa), datos);
  if (typeof toast !== "undefined") toast("Pedido enviado ✓", "success");
  pedido=[]; total=0; notaMesa="";
  setTimeout(() => { window.location.href = "mesas.html"; }, 1200);
};

window.cerrarMesa = function() {
  pedido=[]; total=0;
  window.location.href = "mesas.html";
};

window.agregarDetalle = async function(index) {
  const texto = await modalInput(
    "Detalle para: <b>" + pedido[index].nombre + "</b>",
    "Ej: sin azúcar, sin leche...", "✏️"
  );
  if (texto === null) return;
  pedido[index].detalle = texto;
  mostrar();
};

window.editarNotaMesa = async function() {
  const texto = await modalInput(
    "Nota general para la mesa",
    "Ej: alérgico al gluten, sin lactosa...", "📋"
  );
  if (texto === null) return;
  notaMesa = texto;
  actualizarNotaUI();
  if (typeof toast !== "undefined") toast("Nota guardada", "success", 1800);
};