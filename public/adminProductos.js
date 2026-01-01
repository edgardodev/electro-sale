// public/admin-productos.js
(() => {
  const API_BASE = document.body.dataset.apiUrl?.trim() || (window.API_URL || window.location.origin);
  const PRODUCTS_API = `${API_BASE}/api/productos`;
  const token = () => localStorage.getItem('token');

  // DOM
  const form = document.getElementById('adminProductForm');
  const feedback = document.getElementById('adminProductFeedback');
  const preview = document.getElementById('imagenPreview');
  const fileInput = document.getElementById('imagen');
  const productsContainer = document.getElementById('adminProductsContainer');
  const pager = document.getElementById('adminProductsPager');
  const searchInput = document.getElementById('adminSearchProducts');
  const btnReset = document.getElementById('btnResetProduct');
  const btnSave = document.getElementById('btnSaveProduct');

  // form fields
  const inputId = document.getElementById('productId');
  const inputNombre = document.getElementById('nombre');
  const inputDescripcion = document.getElementById('descripcion');
  const inputPrecio = document.getElementById('precio');
  const inputStock = document.getElementById('stock');

  let allProducts = [];
  let currentPage = 1;
  const PAGE_SIZE = 12;

  const headersAuth = () => {
    const t = token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  function showFeedback(msg, isError = false) {
    if (!feedback) return;
    feedback.textContent = msg || '';
    feedback.style.color = isError ? 'var(--danger)' : '';
  }

  // preview
  fileInput?.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) { preview.style.display = 'none'; preview.src = ''; return; }
    preview.src = URL.createObjectURL(f);
    preview.style.display = 'block';
  });

  // reset form
  function resetForm() {
    form.reset();
    inputId.value = '';
    preview.style.display = 'none';
    showFeedback('');
  }
  btnReset?.addEventListener('click', resetForm);

  // fetch products
  async function fetchProducts() {
    try {
      const res = await fetch(PRODUCTS_API, { headers: { ...headersAuth() } });
      if (!res.ok) throw new Error('No se pudieron cargar los productos');
      allProducts = await res.json();
      currentPage = 1;
      renderProductsList();
    } catch (err) {
      console.error(err);
      showFeedback('Error cargando productos', true);
    }
  }

  function renderProductsList() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const filtered = q ? allProducts.filter(p => (p.nombre||'').toLowerCase().includes(q)) : allProducts.slice();
    // pager
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(currentPage, pages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    productsContainer.innerHTML = pageItems.map(p => `
      <div class="admin-product-card" data-id="${p.id}">
        <img src="${p.imagen_url || 'logonew.png'}" alt="${escapeHtml(p.nombre)}" />
        <div class="admin-product-card__body">
          <h4>${escapeHtml(p.nombre)}</h4>
          <p class="muted small">${truncate(p.descripcion || '', 120)}</p>
          <div class="admin-product-meta">
            <span>${formatCurrency(p.precio)}</span>
            <span>Stock: <strong>${p.stock ?? 0}</strong></span>
          </div>
          <div class="admin-product-actions">
            <button class="btn-edit">Editar</button>
            <button class="btn-delete">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('') || '<p>No hay productos.</p>';

    // pager dom
    pager.innerHTML = '';
    if (pages > 1) {
      for (let i=1;i<=pages;i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i===currentPage ? 'pager-btn active' : 'pager-btn';
        btn.addEventListener('click', () => { currentPage = i; renderProductsList(); });
        pager.appendChild(btn);
      }
    }
  }

  // helper
  function truncate(text, n) { return text.length > n ? text.slice(0,n-1)+'…' : text; }
  function escapeHtml(s='') { return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
  function formatCurrency(v) {
    const num = Number(v) || 0;
    return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits: 0 }).format(num);
  }

  // delegate actions: edit/delete
  productsContainer.addEventListener('click', async (e) => {
    const card = e.target.closest('.admin-product-card');
    if (!card) return;
    const id = card.dataset.id;
    if (e.target.matches('.btn-delete')) {
      if (!confirm('¿Eliminar este producto?')) return;
      try {
        const res = await fetch(`${PRODUCTS_API}/${id}`, { method: 'DELETE', headers: { ...headersAuth() } });
        if (!res.ok) throw new Error('No se pudo eliminar');
        allProducts = allProducts.filter(p => String(p.id) !== String(id));
        renderProductsList();
        showFeedback('Producto eliminado');
      } catch (err) {
        console.error(err);
        showFeedback('Error al eliminar', true);
      }
    } else if (e.target.matches('.btn-edit')) {
      // rellenar form para editar
      const prod = allProducts.find(p => String(p.id) === String(id));
      if (!prod) return showFeedback('Producto no encontrado', true);
      inputId.value = prod.id;
      inputNombre.value = prod.nombre;
      inputDescripcion.value = prod.descripcion || '';
      inputPrecio.value = prod.precio || 0;
      inputStock.value = prod.stock || 0;
      if (prod.imagen_url) {
        preview.src = prod.imagen_url;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
      window.scrollTo({ top: form.offsetTop - 20, behavior: 'smooth' });
    }
  });

  // create / update product
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFeedback('Guardando...');
    btnSave.disabled = true;
    try {
      const formData = new FormData();
      const id = inputId.value;
      formData.append('nombre', inputNombre.value.trim());
      formData.append('descripcion', inputDescripcion.value.trim());
      formData.append('precio', inputPrecio.value || 0);
      formData.append('stock', inputStock.value || 0);
      if (fileInput.files[0]) formData.append('imagen', fileInput.files[0]);

      const method = id ? 'PUT' : 'POST';
      const url = id ? `${PRODUCTS_API}/${id}` : `${PRODUCTS_API}`;
      const res = await fetch(url, {
        method,
        headers: { ...headersAuth() }, // no content-type: browser sets for multipart
        body: formData
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.mensaje || data.error || 'Error guardando');

      // refresh local list: re-fetch or update locally
      await fetchProducts();
      resetForm();
      showFeedback(id ? 'Producto actualizado' : 'Producto creado');
    } catch (err) {
      console.error(err);
      showFeedback(err.message || 'Error guardando', true);
    } finally {
      btnSave.disabled = false;
    }
  });

  // search
  searchInput?.addEventListener('input', () => { currentPage = 1; renderProductsList(); });

  // init
  document.addEventListener('DOMContentLoaded', fetchProducts);
})();
