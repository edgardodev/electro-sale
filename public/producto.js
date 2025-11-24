// public/producto.js
const API_BASE = "http://127.0.0.1:3000";

const getToken = () => localStorage.getItem("token");

const placeholders = [
  { keyword: "horno", src: "horno.jpg" },
  { keyword: "batidora", src: "BATIDORA.jpeg" },
];

const resolveImage = (nombre = "") => {
  const lower = nombre.toLowerCase();
  const match = placeholders.find((item) => lower.includes(item.keyword));
  if (match) return match.src;
  return "logonew.png";
};

const formatCurrency = (valor) => {
  if (typeof valor !== "number") {
    const parsed = Number(valor);
    if (Number.isNaN(parsed)) return "$" + valor;
    valor = parsed;
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
};

const setProductCount = (count, element) => {
  if (!element) return;
  const suffix = count === 1 ? "resultado" : "resultados";
  element.textContent = `${count} ${suffix}`;
};

const renderProducts = (products, elements) => {
  const { grid, emptyState, countLabel } = elements;

  grid.innerHTML = "";

  if (!products.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    setProductCount(0, countLabel);
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  setProductCount(products.length, countLabel);

  products.forEach((product) => {
    const nombre = product.nombre || "Producto sin nombre";
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${resolveImage(nombre)}" alt="${nombre}" />
      <h3>${nombre}</h3>
      <div class="price-row">
        <span class="price">${formatCurrency(product.precio)}</span>
        <span class="discount">-${Math.min(25, Number(product.stock) || 0)}% OFF</span>
      </div>
      <p class="free-shipping">🚛 Envío gratis desde $199.900</p>
      <p>Stock disponible: <strong>${product.stock ?? 0}</strong></p>
      <button data-product-id="${product.id_producto || product.id}">Comprar ahora</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      alert(`🛒 ${nombre} agregado a tu carrito. Completa la compra en el checkout.`);
    });

    grid.appendChild(card);
  });
};

const attachSearch = (elements, allProducts) => {
  const { searchInput } = elements;

  if (!searchInput) return;

  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    if (!query) {
      renderProducts(allProducts, elements);
      return;
    }

    const filtered = allProducts.filter((product) => {
      const nombre = (product.nombre || "").toLowerCase();
      const categoria = (product.categoria || "").toLowerCase();
      return nombre.includes(query) || categoria.includes(query);
    });

    renderProducts(filtered, elements);
  });
};

const attachQuickFilters = (elements, allProducts) => {
  const { quickFilters } = elements;
  if (!quickFilters) return;

  quickFilters.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-filter]");
    if (!target) return;

    const filter = target.dataset.filter;
    const filtered = allProducts.filter((product) => {
      const categoria = (product.categoria || "").toLowerCase();
      return categoria.includes(filter);
    });

    const hasResults = filtered.length > 0;

    quickFilters.querySelectorAll("button[data-filter]").forEach((button) => {
      button.classList.toggle("is-active", hasResults && button === target);
    });

    renderProducts(hasResults ? filtered : allProducts, elements);
  });
};

const showLoading = (overlay) => {
  if (!overlay) return;
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => overlay.classList.add("active"));
};

const hideLoading = (overlay) => {
  if (!overlay) return;
  overlay.classList.remove("active");
  setTimeout(() => overlay.classList.add("hidden"), 250);
};

const bootstrapPage = async () => {
  const token = getToken();
  if (!token) {
    alert("⚠️ Debes iniciar sesión primero");
    window.location.href = "ingresar.html";
    return;
  }

  const elements = {
    grid: document.getElementById("productGrid"),
    emptyState: document.getElementById("emptyState"),
    searchInput: document.getElementById("searchInput"),
    userName: document.getElementById("usuario"),
    userRole: document.getElementById("rolUsuario"),
    adminPanel: document.getElementById("adminPanel"),
    logout: document.getElementById("logout"),
    quickFilters: document.getElementById("quickFilters"),
    countLabel: document.getElementById("productCount"),
    loadingOverlay: document.getElementById("catalogLoading"),
  };

  // precargar saludo desde localStorage
  const storedName = localStorage.getItem("userName");
  const storedRole = localStorage.getItem("role");

  if (storedName && elements.userName) {
    elements.userName.textContent = storedName;
  }

  if (storedRole && elements.userRole) {
    elements.userRole.textContent =
      storedRole === "admin" ? "administrador" : "cliente";
  }

  let allProducts = [];

  const commonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // -------- Validar perfil y rol ----------
  try {
    showLoading(elements.loadingOverlay);

    const perfilResponse = await fetch(`${API_BASE}/auth/perfil`, {
      method: "GET",
      headers: commonHeaders,
    });

    if (!perfilResponse.ok) {
      throw new Error("NoAutenticado");
    }

    const perfilData = await perfilResponse.json();
    const profile = perfilData.user || {};

    if (profile.nombre) {
      elements.userName.textContent = profile.nombre;
    }

    if (profile.role) {
      const roleLabel = profile.role === "admin" ? "administrador" : "cliente";
      elements.userRole.textContent = roleLabel;
    }

    if (profile.role === "admin") {
      elements.adminPanel.style.display = "inline-flex";
    }

    localStorage.setItem("role", profile.role || "cliente");
    localStorage.setItem("userName", profile.nombre || "");
  } catch (error) {
    console.error("❌ Error al validar token:", error);
    hideLoading(elements.loadingOverlay);
    alert("⚠️ Tu sesión expiró, vuelve a iniciar sesión");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "ingresar.html";
    return;
  }

  // -------- Cargar productos ----------
  try {
    showLoading(elements.loadingOverlay);

    const productosResponse = await fetch(`${API_BASE}/api/productos`, {
      method: "GET",
      headers: commonHeaders,
    });

    // 🔹 Solo tratamos 401 como sesión inválida
    if (productosResponse.status === 401) {
      throw new Error("NoAutenticado");
    }

    if (!productosResponse.ok) {
      throw new Error("No fue posible obtener los productos");
    }

    allProducts = await productosResponse.json();
    renderProducts(allProducts, elements);

    attachSearch(elements, allProducts);
    attachQuickFilters(elements, allProducts);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);

    if (error.message === "NoAutenticado") {
      alert("⚠️ Tu sesión expiró, vuelve a iniciar sesión");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      window.location.href = "ingresar.html";
      return;
    }

    // Para cualquier otro error mostramos mensaje en la página,
    // pero ya NO decimos que "no tiene permisos"
    if (elements.emptyState) {
      elements.emptyState.hidden = false;
      elements.emptyState.textContent =
        "No pudimos cargar los productos. Intenta nuevamente más tarde.";
    }
    setProductCount(0, elements.countLabel);
  } finally {
    hideLoading(elements.loadingOverlay);
  }

  // -------- Botones de header ----------
  elements.adminPanel.addEventListener("click", () => {
    window.location.href = "admin.html";
  });

  elements.logout.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "ingresar.html";
  });
};

document.addEventListener("DOMContentLoaded", bootstrapPage);
