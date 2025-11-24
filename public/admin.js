
// ---------- CONFIGURACIÓN BASE DE API ----------

function getApiBase() {
  const fromAttribute = document.body?.dataset.apiUrl?.trim();
  const fromGlobal = typeof window.API_URL === "string" ? window.API_URL : "";
  const fromOrigin = window.location.origin;
  const base = fromAttribute || fromGlobal || fromOrigin;
  return base.replace(/\/+$/, "");
}

const API_BASE = getApiBase();                
const DASHBOARD_BASE = `${API_BASE}/api/dashboard`;
const REFRESH_INTERVAL_MS = 5000;

// ---------- AUTENTICACIÓN SIMPLE ----------

function getToken() {
  return localStorage.getItem("token");
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    alert("⚠ Debes iniciar sesión para acceder al panel de administración.");
    window.location.href = "ingresar.html";
  }
  return token;
}

// ---------- HELPER PARA LLAMAR A LA API ----------

async function fetchDashboard(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${DASHBOARD_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    
  }

  if (!response.ok) {
    const msg =
      (data && (data.mensaje || data.message)) ||
      `Error al consultar ${endpoint} (${response.status})`;
    console.error("❌ Error API dashboard:", msg);
    throw new Error(msg);
  }

  return data;
}


const loadingUI = window.dashboardLoading || {
  show: () => {},
  hide: () => {},
};

// ---------- CACHE DE ELEMENTOS DEL DOM ----------

const el = {
  // Métricas
  metricProducts: document.getElementById("metricProducts"),
  metricInventory: document.getElementById("metricInventory"),
  metricOrders: document.getElementById("metricOrders"),
  metricCritical: document.getElementById("metricCritical"),

  metricProductsTrend: document.getElementById("metricProductsTrend"),
  metricInventoryTrend: document.getElementById("metricInventoryTrend"),
  metricOrdersTrend: document.getElementById("metricOrdersTrend"),
  metricCriticalTrend: document.getElementById("metricCriticalTrend"),

  // Tablas
  stockTableBody: document.getElementById("stockTableBody"),
  ordersTableBody: document.getElementById("ordersTableBody"),

  // Filtros
  stockSearch: document.getElementById("stock-search"),
  orderStatusFilter: document.getElementById("order-status"),
  ordersCount: document.getElementById("ordersCount"),

  // Form precios
  pricingForm: document.getElementById("pricingForm"),
  productSelect: document.getElementById("product-select"),
  currentPrice: document.getElementById("current-price"),
  newPrice: document.getElementById("new-price"),
  priceEffective: document.getElementById("price-effective"),
  priceNotes: document.getElementById("price-notes"),
  pricingFeedback: document.getElementById("pricingFeedback"),

  // Form inventario
  inventoryForm: document.getElementById("inventoryForm"),
  inventoryProduct: document.getElementById("inventory-product"),
  inventoryCurrent: document.getElementById("inventory-current"),
  inventoryQuantity: document.getElementById("inventory-quantity"),
  inventoryDate: document.getElementById("inventory-date"),
  inventorySupplier: document.getElementById("inventory-supplier"),
  inventoryNotes: document.getElementById("inventory-notes"),
  inventoryFeedback: document.getElementById("inventoryFeedback"),
};

let lastProducts = [];
let lastOrders = [];
let lastOverview = null;

// ---------- HELPERS DE FORMATO ----------

function formatMoneyCLP(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ---------- RENDER: SELECTS Y TABLAS ----------

function renderProductSelects(products) {
  if (!el.productSelect || !el.inventoryProduct) return;

  const opts =
    '<option value="">Selecciona un producto del catálogo</option>' +
    products
      .map(
        (p) =>
          `<option value="${p.id}">${p.nombre} (ID ${p.id})</option>`
      )
      .join("");

  el.productSelect.innerHTML = opts;
  el.inventoryProduct.innerHTML = opts;
}

function stockBadgeHTML(stock, stockMinimo) {
  const s = Number(stock) || 0;
  const min = stockMinimo == null ? 5 : Number(stockMinimo);

  if (s <= 0) {
    return '<span class="status-pill status-pill--critical">Sin stock</span>';
  }
  if (s <= min) {
    return '<span class="status-pill status-pill--alert">Stock bajo</span>';
  }
  return '<span class="status-pill status-pill--ok">Stock saludable</span>';
}

function renderStockTable(products, searchText = "") {
  if (!el.stockTableBody) return;

  const text = searchText.trim().toLowerCase();
  let filtered = products;

  if (text) {
    filtered = products.filter((p) =>
      (p.nombre || "").toLowerCase().includes(text)
    );
  }

  if (!filtered.length) {
    el.stockTableBody.innerHTML =
      '<tr class="stock-empty-row"><td colspan="5">No se encontraron productos.</td></tr>';
    return;
  }

  el.stockTableBody.innerHTML = filtered
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map(
      (p) => `
        <tr>
          <td>${p.nombre || "-"}</td>
          <td>${Number(p.stock || 0)}</td>
          <td>${p.stockMinimo != null ? Number(p.stockMinimo) : "—"}</td>
          <td>${stockBadgeHTML(p.stock, p.stockMinimo)}</td>
          <td>${formatDateTime(p.actualizado)}</td>
        </tr>
      `
    )
    .join("");
}

function orderStatusPillHTML(estadoCrudo) {
  const estado = (estadoCrudo || "pendiente").toLowerCase();

  if (estado.includes("pend")) {
    return '<span class="status-pill status-pill--pending">Pendiente</span>';
  }
  if (estado.includes("prepar")) {
    return '<span class="status-pill status-pill--progress">En preparación</span>';
  }
  if (estado.includes("envi")) {
    return '<span class="status-pill status-pill--shipped">Enviada</span>';
  }
  if (estado.includes("compl") || estado.includes("final")) {
    return '<span class="status-pill status-pill--completed">Completada</span>';
  }

  return `<span class="status-pill status-pill--alert">${estadoCrudo || "Pendiente"}</span>`;
}

function renderOrdersTable(orders, statusFilter = "todas") {
  if (!el.ordersTableBody) return;

  let filtered = orders;

  if (statusFilter && statusFilter !== "todas") {
    const f = statusFilter.toLowerCase();
    filtered = orders.filter((o) =>
      (o.estado || "").toLowerCase().includes(f)
    );
  }

  if (!filtered.length) {
    el.ordersTableBody.innerHTML =
      '<tr class="orders-empty-row"><td colspan="6">No hay órdenes para mostrar.</td></tr>';
  } else {
    el.ordersTableBody.innerHTML = filtered
      .slice()
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .map(
        (o) => `
          <tr>
            <td>#${o.id}</td>
            <td>${o.cliente}</td>
            <td>${formatDateTime(o.fecha)}</td>
            <td>${formatMoneyCLP(o.total)}</td>
            <td>${orderStatusPillHTML(o.estado)}</td>
            <td>—</td>
          </tr>
        `
      )
      .join("");
  }

  if (el.ordersCount) {
    el.ordersCount.textContent = `${filtered.length} órdenes`;
  }
}

// ---------- MÉTRICAS (usa /overview) ----------

function renderOverview(overview) {
  if (!overview) return;
  lastOverview = overview;

  if (el.metricProducts)
    el.metricProducts.textContent = overview.products?.total ?? 0;
  if (el.metricInventory)
    el.metricInventory.textContent = overview.inventory?.units ?? 0;
  if (el.metricOrders)
    el.metricOrders.textContent = overview.orders?.total ?? 0;
  if (el.metricCritical)
    el.metricCritical.textContent = overview.critical?.total ?? 0;

  if (el.metricProductsTrend)
    el.metricProductsTrend.textContent = overview.products?.trend || "";
  if (el.metricInventoryTrend)
    el.metricInventoryTrend.textContent = overview.inventory?.trend || "";
  if (el.metricOrdersTrend)
    el.metricOrdersTrend.textContent = overview.orders?.trend || "";
  if (el.metricCriticalTrend)
    el.metricCriticalTrend.textContent = overview.critical?.trend || "";
}

// ---------- CARGA DE DATOS DESDE LA API ----------

async function loadOverview() {
  return fetchDashboard("/overview");
}

async function loadProducts() {
  return fetchDashboard("/products");
}

async function loadOrders() {
  return fetchDashboard("/orders");
}

async function refreshDashboard({ showLoader = false } = {}) {
  try {
    if (showLoader) loadingUI.show("Sincronizando datos del panel…");

    const [overview, products, orders] = await Promise.all([
      loadOverview(),
      loadProducts(),
      loadOrders(),
    ]);

    lastProducts = Array.isArray(products) ? products : [];
    lastOrders = Array.isArray(orders) ? orders : [];

    renderOverview(overview);
    renderProductSelects(lastProducts);
    renderStockTable(
      lastProducts,
      el.stockSearch ? el.stockSearch.value : ""
    );
    renderOrdersTable(
      lastOrders,
      el.orderStatusFilter ? el.orderStatusFilter.value : "todas"
    );
  } catch (err) {
    console.error("❌ Error al refrescar dashboard:", err);
    // puedes mostrar mensaje general en alguna parte si quieres
  } finally {
    if (showLoader) loadingUI.hide();
  }
}

// ---------- FORMULARIO: ACTUALIZAR PRECIO ----------

function setupPricingForm() {
  if (!el.pricingForm) return;

  // Mostrar precio actual cuando cambia el producto
  if (el.productSelect && el.currentPrice) {
    el.productSelect.addEventListener("change", () => {
      const id = Number(el.productSelect.value);
      const product = lastProducts.find((p) => p.id === id);
      el.currentPrice.value = product
        ? formatMoneyCLP(product.precio)
        : "—";
    });
  }

  el.pricingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!el.productSelect.value) {
      el.pricingFeedback.textContent = "⚠ Selecciona un producto.";
      return;
    }
    if (!el.newPrice.value) {
      el.pricingFeedback.textContent = "⚠ Ingresa el nuevo precio.";
      return;
    }

    const id = Number(el.productSelect.value);
    const payload = {
      precio: Number(el.newPrice.value),
      fechaVigencia: el.priceEffective?.value || null,
      notas: el.priceNotes?.value || "",
    };

    try {
      el.pricingFeedback.textContent = "Guardando cambios…";
      loadingUI.show("Actualizando precio…");

      await fetchDashboard(`/products/${id}/price`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      el.pricingFeedback.textContent = "✅ Precio actualizado correctamente.";
      el.newPrice.value = "";
      if (el.priceNotes) el.priceNotes.value = "";

      await refreshDashboard();
    } catch (error) {
      console.error("Error al actualizar precio:", error);
      el.pricingFeedback.textContent = `❌ ${
        error.message || "No se pudo actualizar el precio."
      }`;
    } finally {
      loadingUI.hide();
    }
  });
}

// ---------- FORMULARIO: REGISTRAR INVENTARIO ----------

function setupInventoryForm() {
  if (!el.inventoryForm) return;

  if (el.inventoryProduct && el.inventoryCurrent) {
    el.inventoryProduct.addEventListener("change", () => {
      const id = Number(el.inventoryProduct.value);
      const product = lastProducts.find((p) => p.id === id);
      el.inventoryCurrent.value = product
        ? `${product.stock} unidades`
        : "—";
    });
  }

  el.inventoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!el.inventoryProduct.value) {
      el.inventoryFeedback.textContent = "⚠ Selecciona un producto.";
      return;
    }
    if (!el.inventoryQuantity.value) {
      el.inventoryFeedback.textContent =
        "⚠ Ingresa la cantidad a ingresar.";
      return;
    }

    const payload = {
      id_producto: Number(el.inventoryProduct.value),
      cantidad: Number(el.inventoryQuantity.value),
      fecha: el.inventoryDate?.value || null,
      proveedor: el.inventorySupplier?.value || "",
      notas: el.inventoryNotes?.value || "",
    };

    try {
      el.inventoryFeedback.textContent = "Registrando inventario…";
      loadingUI.show("Registrando inventario…");

      await fetchDashboard("/inventory", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      el.inventoryFeedback.textContent =
        "✅ Inventario registrado correctamente.";
      el.inventoryForm.reset();
      if (el.inventoryCurrent) el.inventoryCurrent.value = "—";

      await refreshDashboard();
    } catch (error) {
      console.error("Error al registrar inventario:", error);
      el.inventoryFeedback.textContent = `❌ ${
        error.message || "No se pudo registrar el inventario."
      }`;
    } finally {
      loadingUI.hide();
    }
  });
}

// ---------- FILTROS (BUSCADOR Y ESTADO DE ÓRDENES) ----------

function setupFilters() {
  if (el.stockSearch) {
    el.stockSearch.addEventListener("input", () => {
      renderStockTable(lastProducts, el.stockSearch.value);
    });
  }

  if (el.orderStatusFilter) {
    el.orderStatusFilter.addEventListener("change", () => {
      renderOrdersTable(lastOrders, el.orderStatusFilter.value);
    });
  }
}

// ---------- INICIALIZACIÓN ----------

document.addEventListener("DOMContentLoaded", () => {
  requireAuth(); 

  setupPricingForm();
  setupInventoryForm();
  setupFilters();
  setupAdminChat();

  // Carga inicial (con loader) y luego refresco silencioso
  refreshDashboard({ showLoader: true });
  setInterval(
    () => refreshDashboard({ showLoader: false }),
    REFRESH_INTERVAL_MS
  );
});
// ---------- CHAT ADMIN (panel) ----------

const CHAT_BASE = `${API_BASE}/api/chat`;

const chatEl = {
  clientList: document.getElementById("chatClientList"),
  chatLog: document.getElementById("adminChatLog"),
  activeTitle: document.getElementById("chatActiveClientTitle"),
  activeMeta: document.getElementById("chatActiveClientMeta"),
  form: document.getElementById("adminChatForm"),
  input: document.getElementById("adminMessageInput"),
};

let activeChatClientId = null;
let chatClientsIntervalId = null;
let chatConversationIntervalId = null;

function renderChatClients(clients) {
  if (!chatEl.clientList) return;

  if (!clients || !clients.length) {
    chatEl.clientList.innerHTML =
      '<li class="chat-client-list__empty">No hay conversaciones activas.</li>';
    return;
  }

  chatEl.clientList.innerHTML = clients
    .map(
      (c) => `
      <li 
        class="chat-client-list__item"
        data-client-id="${c.client_id}"
        data-client-name="${c.client_name || "Cliente sin nombre"}"
        data-client-email="${c.client_email || ""}"
      >
        <div class="chat-client-list__name">
          ${c.client_name || "Cliente sin nombre"}
        </div>
        <div class="chat-client-list__email">
          ${c.client_email || ""}
        </div>
        <div class="chat-client-list__last-message">
          ${c.last_message || ""}
        </div>
        <div class="chat-client-list__time">
          ${c.last_message_at ? new Date(c.last_message_at).toLocaleString("es-CO") : ""}
        </div>
      </li>
    `
    )
    .join("");
}

async function loadChatClients() {
  if (!chatEl.clientList) return;

  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${CHAT_BASE}/clients`, { headers });
    if (!res.ok) {
      console.error("❌ Error al cargar lista de clientes de chat");
      return;
    }

    const data = await res.json();
    renderChatClients(data);
  } catch (err) {
    console.error("❌ Error al obtener clientes de chat:", err);
  }
}

function renderAdminMessages(messages) {
  if (!chatEl.chatLog) return;

  chatEl.chatLog.innerHTML = "";

  if (!messages || !messages.length) {
    chatEl.chatLog.innerHTML =
      '<div class="message message--admin"><p>Aún no hay mensajes en esta conversación.</p></div>';
    return;
  }

  messages.forEach((msg) => {
    const isAdmin = msg.sender === "admin";
    const wrapper = document.createElement("div");
    wrapper.className = `message ${
      isAdmin ? "message--admin" : "message--user"
    }`;

    const p = document.createElement("p");
    p.textContent = msg.message;
    wrapper.appendChild(p);

    const span = document.createElement("span");
    span.className = "message__time";
    span.textContent = msg.created_at
      ? new Date(msg.created_at).toLocaleString("es-CO")
      : "";
    wrapper.appendChild(span);

    chatEl.chatLog.appendChild(wrapper);
  });

  chatEl.chatLog.scrollTop = chatEl.chatLog.scrollHeight;
}

async function loadAdminConversation(clientId) {
  if (!clientId || !chatEl.chatLog) return;

  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(
      `${CHAT_BASE}/messages/${encodeURIComponent(clientId)}`,
      { headers }
    );

    if (!res.ok) {
      console.error("❌ Error al cargar conversación con cliente", clientId);
      return;
    }

    const data = await res.json();
    renderAdminMessages(data);
  } catch (err) {
    console.error("❌ Error al obtener conversación:", err);
  }
}

function clearConversationInterval() {
  if (chatConversationIntervalId) {
    clearInterval(chatConversationIntervalId);
    chatConversationIntervalId = null;
  }
}

function setupAdminChat() {
  // Si no existe la sección de chat en esta página, salimos
  if (!chatEl.clientList || !chatEl.chatLog || !chatEl.form || !chatEl.input) {
    return;
  }

  // Cargar clientes inicial
  loadChatClients();

  // Refrescar lista de clientes cada 10s
  chatClientsIntervalId = setInterval(loadChatClients, 10000);

  // Click en un cliente de la lista
  chatEl.clientList.addEventListener("click", (event) => {
    const item = event.target.closest(".chat-client-list__item");
    if (!item) return;

    activeChatClientId = item.dataset.clientId;

    const name = item.dataset.clientName || "Cliente";
    const email = item.dataset.clientEmail || "";

    if (chatEl.activeTitle) {
      chatEl.activeTitle.textContent = name;
    }
    if (chatEl.activeMeta) {
      chatEl.activeMeta.textContent = email
        ? `${email} · ID ${activeChatClientId}`
        : `ID ${activeChatClientId}`;
    }

    // Cargar conversación inicial
    loadAdminConversation(activeChatClientId);

    // Refresco periódico de la conversación
    clearConversationInterval();
    chatConversationIntervalId = setInterval(
      () => loadAdminConversation(activeChatClientId),
      5000
    );
  });

  // Enviar respuesta del admin
  chatEl.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = chatEl.input.value.trim();
    if (!text) return;

    if (!activeChatClientId) {
      alert("Selecciona primero un cliente para responder.");
      return;
    }

    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${CHAT_BASE}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          clientId: activeChatClientId,
          sender: "admin",
          message: text,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("❌ Error al enviar respuesta:", body);
        alert(body.mensaje || "No se pudo enviar la respuesta.");
        return;
      }

      chatEl.input.value = "";
      // Actualizar conversación inmediatamente
      loadAdminConversation(activeChatClientId);
    } catch (err) {
      console.error("❌ Error al enviar mensaje de admin:", err);
      alert("Error de conexión al enviar la respuesta.");
    }
  });
}
