// public/producto.js 
const API_BASE = "https://electro-sale.onrender.com";
const PRODUCTS_API = `${API_BASE}/api/productos`;

const getToken = () => localStorage.getItem("token");

// carrito en localStorage
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; }
}
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) { cart[idx].qty += qty; } else { cart.push({ id: product.id, nombre: product.nombre, precio: product.precio, imagen_url: product.imagen_url, qty }); }
  saveCart(cart);
  return cart;
}

const formatCurrency = (valor) => {
  const parsed = Number(valor) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(parsed);
};

// rendering UI
const el = {
  grid: document.getElementById('productGrid'),
  countLabel: document.getElementById('productCount'),
  emptyState: document.getElementById('emptyState'),
  loadingOverlay: document.getElementById('catalogLoading'),
  searchInput: document.getElementById('searchInput'),
  quickFilters: document.getElementById('quickFilters'),
};

// state
let products = [];
let filtered = [];
let currentPage = 1;
const PAGE_SIZE = 12;
let activeFilter = null;

// loading helpers
const showLoading = () => el.loadingOverlay?.classList.remove('hidden');
const hideLoading = () => el.loadingOverlay?.classList.add('hidden');

// modal (detalle)
let modalEl = null;
function createModal() {
  modalEl = document.createElement('div');
  modalEl.className = 'product-modal hidden';
  modalEl.innerHTML = `
    <div class="product-modal__content" role="dialog" aria-modal="true">
      <button class="modal-close" aria-label="Cerrar">✕</button>
      <div class="modal-body">
        <div class="modal-gallery"><img class="modal-img" src="" alt=""></div>
        <div class="modal-info">
          <h2 class="modal-title"></h2>
          <p class="modal-desc"></p>
          <div class="modal-price"></div>
          <div class="modal-actions">
            <input type="number" min="1" value="1" class="modal-qty" />
            <button class="btn primary modal-add">Añadir al carrito</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  modalEl.querySelector('.modal-close').addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });
}
function openModal(product) {
  if (!modalEl) createModal();
  modalEl.classList.remove('hidden');
  modalEl.querySelector('.modal-img').src = product.imagen_url || 'logonew.png';
  modalEl.querySelector('.modal-img').alt = product.nombre;
  modalEl.querySelector('.modal-title').textContent = product.nombre;
  modalEl.querySelector('.modal-desc').textContent = product.descripcion || '';
  modalEl.querySelector('.modal-price').textContent = formatCurrency(product.precio);
  modalEl.querySelector('.modal-add').onclick = () => {
    const qty = Number(modalEl.querySelector('.modal-qty').value) || 1;
    addToCart(product, qty);
    alert(`✅ ${product.nombre} agregado al carrito (${qty})`);
    closeModal();
  };
}
function closeModal() { modalEl?.classList.add('hidden'); }

// render grid
function setCount(n) {
  el.countLabel && (el.countLabel.textContent = `${n} ${n === 1 ? 'resultado' : 'resultados'}`);
}

function renderGridPage(page = 1) {
  currentPage = page;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  el.grid.innerHTML = pageItems.map(p => `
    <article class="product-card">
      <div class="product-card__media">
        <img loading="lazy" src="${p.imagen_url || 'logonew.png'}" alt="${p.nombre}">
      </div>
      <div class="product-card__body">
        <h3>${p.nombre}</h3>
        <p class="muted small">${(p.descripcion || '').slice(0,120)}${(p.descripcion||'').length>120?'…':''}</p>
        <div class="price-row">
          <strong class="price">${formatCurrency(p.precio)}</strong>
          <span class="stock">Stock: ${p.stock ?? 0}</span>
        </div>
        <div class="card-actions">
          <button class="btn view-detail" data-id="${p.id}">Ver</button>
          <button class="btn add-cart" data-id="${p.id}">Añadir al carrito</button>
        </div>
      </div>
    </article>
  `).join('') || '<div class="no-products">No hay productos para mostrar.</div>';

  // pager
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagerEl = document.createElement('div');
  pagerEl.className = 'catalog-pager';
  for (let i=1;i<=pages;i++){
    const b = document.createElement('button');
    b.textContent = i;
    b.className = i===currentPage ? 'pager-btn active' : 'pager-btn';
    b.addEventListener('click', ()=>renderGridPage(i));
    pagerEl.appendChild(b);
  }
  // attach pager after grid
  const oldPager = document.querySelector('.catalog-pager');
  if (oldPager) oldPager.remove();
  el.grid.parentNode.appendChild(pagerEl);

  // attach actions
  el.grid.querySelectorAll('.view-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const product = products.find(p => String(p.id) === String(id));
      if (product) openModal(product);
    });
  });
  el.grid.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const product = products.find(p => String(p.id) === String(id));
      addToCart(product, 1);
      alert(`✅ ${product.nombre} agregado al carrito`);
    });
  });

  setCount(filtered.length);
}

// filter / search
function applyFilters(q = '', category = null) {
  const text = (q || '').trim().toLowerCase();
  filtered = products.filter(p => {
    const matchesText = !text || ((p.nombre||'').toLowerCase().includes(text) || (p.descripcion||'').toLowerCase().includes(text) || (p.categoria||'').toLowerCase().includes(text));
    const matchesCat = !category || (p.categoria || '').toLowerCase().includes(category);
    return matchesText && matchesCat;
  });
  renderGridPage(1);
}

// load products
async function loadProducts() {
  showLoading();
  try {
    const res = await fetch(PRODUCTS_API, { headers: { 'Content-Type':'application/json', Authorization: `Bearer ${getToken()}` }});
    if (res.status === 401) { throw new Error('NoAutenticado'); }
    if (!res.ok) throw new Error('Error al obtener productos');
    products = await res.json();
    filtered = products.slice();
    renderGridPage(1);
  } catch (err) {
    console.error(err);
    if (err.message === 'NoAutenticado') {
      alert('Tu sesión expiró, inicia sesión de nuevo');
      localStorage.removeItem('token');
      window.location.href = 'ingresar.html';
      return;
    }
    el.emptyState && (el.emptyState.hidden = false);
    el.emptyState && (el.emptyState.textContent = 'No pudimos cargar los productos. Intenta más tarde.');
    setCount(0);
  } finally {
    hideLoading();
  }
}

// attach search & filters
document.addEventListener('DOMContentLoaded', () => {
  if (!el.grid) return;
  createModal();
  loadProducts();
  el.searchInput?.addEventListener('input', (e)=> applyFilters(e.target.value, activeFilter));
  el.quickFilters?.addEventListener('click', (ev)=> {
    const btn = ev.target.closest('button[data-filter]');
    if (!btn) return;
    activeFilter = btn.dataset.filter || null;
    // toggle UI
    el.quickFilters.querySelectorAll('button[data-filter]').forEach(b => b.classList.toggle('is-active', b===btn));
    applyFilters(el.searchInput?.value || '', activeFilter);
  });

});

