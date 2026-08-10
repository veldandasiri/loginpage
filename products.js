const defaultProducts = [
  { name: 'Form No. 01 Vase', sku: 'PRD-1001', category: 'Home', price: 48, stock: 42, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=160&q=80' },
  { name: 'Sunday Morning Mug', sku: 'PRD-1002', category: 'Home', price: 28, stock: 18, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=160&q=80' },
  { name: 'The Quiet Journal', sku: 'PRD-1003', category: 'Lifestyle', price: 22, stock: 7, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=160&q=80' },
  { name: 'Neroli Candle', sku: 'PRD-1004', category: 'Wellness', price: 36, stock: 24, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=160&q=80' },
  { name: 'Breeze Throw', sku: 'PRD-1005', category: 'Home', price: 74, stock: 12, image: 'https://images.unsplash.com/photo-1583845112203-454c1b0ce0e3?auto=format&fit=crop&w=160&q=80' },
  { name: 'Daily Carry Tote', sku: 'PRD-1006', category: 'Lifestyle', price: 42, stock: 5, image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=160&q=80' },
  { name: 'Restorative Oil', sku: 'PRD-1007', category: 'Wellness', price: 32, stock: 0, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=160&q=80' },
  { name: 'Pebble Incense Holder', sku: 'PRD-1008', category: 'Home', price: 24, stock: 38, image: 'https://images.unsplash.com/photo-1602874801006-e26fd6bbf4cb?auto=format&fit=crop&w=160&q=80' },
  { name: 'Soft Linen Napkins', sku: 'PRD-1009', category: 'Home', price: 30, stock: 16, image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=160&q=80' },
  { name: 'Everyday Water Bottle', sku: 'PRD-1010', category: 'Lifestyle', price: 34, stock: 8, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=160&q=80' },
  { name: 'Quiet Moment Tea', sku: 'PRD-1011', category: 'Wellness', price: 18, stock: 29, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=160&q=80' },
  { name: 'Oak Desk Tray', sku: 'PRD-1012', category: 'Home', price: 45, stock: 3, image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=160&q=80' }
];

// ===============================
// Load from Local Storage
// ===============================
let products;

try {
  const stored = localStorage.getItem("products");
  products = stored ? JSON.parse(stored) : null;
} catch {
  products = null;
}

// Use default products if none in storage
if (!products || !Array.isArray(products) || products.length === 0) {
  products = [...defaultProducts];
  localStorage.setItem("products", JSON.stringify(products));
}

// ===============================
// Save Products to Local Storage
// ===============================
function saveProducts() {
  try {
    localStorage.setItem("products", JSON.stringify(products));
  } catch (e) {
    console.error("Failed to save products to local storage:", e);
  }
}

const elements = {
  rows: document.getElementById('productRows'),
  searchInput: document.getElementById('searchInput'),
  stockFilter: document.getElementById('stockFilter'),
  categoryButtons: Array.from(document.querySelectorAll('.filter')),
  modalBackdrop: document.getElementById('modalBackdrop'),
  productForm: document.getElementById('productForm'),
  modalTitle: document.querySelector('#modalBackdrop .modal h2'),
  submitButton: document.querySelector('#productForm button[type="submit"]'),
  toast: document.getElementById('toast'),
  menuToggle: document.getElementById('menuToggle'),
  sidebar: document.getElementById('sidebar'),
  addProductBtn: document.getElementById('addProduct'),
  filterBtn: document.getElementById('filterBtn'),
  exportBtn: document.getElementById('exportBtn'),
  closeModal: document.getElementById('closeModal'),
  profileModal: document.getElementById('profileModal'),
  profileButton: document.getElementById('sidebarProfileButton'),
  topAvatar: document.querySelector('.top-avatar'),
  helpCard: document.getElementById('helpCard'),
  tableCount: document.getElementById('tableCount'),
  rangeText: document.getElementById('rangeText'),
  totalProducts: document.getElementById('totalProducts'),
  lowStock: document.getElementById('lowStock'),
  outStock: document.getElementById('outStock')
};

const state = {
  category: 'All',
  toastTimeoutId: null,
  editingSku: null
};

let deletingSku = null;
let editingStockSku = null;

const stockState = (amount) => {
  if (amount === 0) return 'out';
  if (amount < 10) return 'low';
  return 'in';
};

const formatPrice = (value) => `$${value.toFixed(2)}`;

const resetModalState = () => {
  state.editingSku = null;
  elements.productForm.reset();
  if (elements.modalTitle) {
    elements.modalTitle.textContent = 'Add product';
  }
  if (elements.submitButton) {
    elements.submitButton.textContent = 'Save product';
  }
};

const populateForm = (product) => {
  elements.productForm.productName.value = product.name;
  elements.productForm.productSku.value = product.sku;
  elements.productForm.productPrice.value = product.price;
  elements.productForm.productCategory.value = product.category;
  elements.productForm.productStock.value = product.stock;
  if (elements.modalTitle) {
    elements.modalTitle.textContent = 'Edit product';
  }
  if (elements.submitButton) {
    elements.submitButton.textContent = 'Save changes';
  }
};

const getVisibleProducts = () => {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const stockFilter = elements.stockFilter.value;

  return products.filter((product) => {
    const matchesCategory = state.category === 'All' || product.category === state.category;
    const matchesSearch = `${product.name} ${product.sku}`.toLowerCase().includes(searchTerm);
    const matchesStock = stockFilter === 'all' || stockState(product.stock) === stockFilter;
    return matchesCategory && matchesSearch && matchesStock;
  });
};

const renderProducts = () => {
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    elements.rows.innerHTML = '<tr><td colspan="8" style="padding: 34px 22px; text-align: center; color: var(--muted);">No products match your search or filters.</td></tr>';
  } else {
    elements.rows.innerHTML = visibleProducts.map((product, idx) => {
      const stateName = stockState(product.stock);
      const statusLabel = stateName === 'in' ? 'In stock' : stateName === 'low' ? 'Low stock' : 'Out of stock';
      const serial = idx + 1;

      return `
        <tr>
          <td class="serial">${serial}</td>
          <td>
            <div class="product-cell">
              <img class="product-thumb" src="${product.image}" alt="${product.name}">
              <span>${product.name}</span>
            </div>
          </td>
          <td class="sku">${product.sku}</td>
          <td class="category">${product.category}</td>
          <td class="price">${formatPrice(product.price)}</td>
          <td><span class="stock-num ${stateName}">${product.stock} units</span></td>
          <td><span class="status ${stateName}">${statusLabel}</span></td>
          <td>
            <div class="row-actions">
              <button class="row-menu" data-menu="${product.sku}" aria-label="Actions for ${product.name}" aria-expanded="false">⋮</button>
              <div class="action-menu" id="menu-${product.sku}">
                <button data-action="edit" data-sku="${product.sku}">✎ Edit product</button>
                <button data-action="stock" data-sku="${product.sku}">↻ Adjust stock</button>
                <button class="delete-action" data-action="delete" data-sku="${product.sku}">⌫ Delete product</button>
              </div>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  elements.tableCount.textContent = visibleProducts.length;
  elements.rangeText.textContent = `Showing ${visibleProducts.length ? 1 : 0}–${visibleProducts.length} of ${visibleProducts.length} products`;
  elements.totalProducts.textContent = products.length;
  elements.lowStock.textContent = products.filter((product) => stockState(product.stock) === 'low').length;
  elements.outStock.textContent = products.filter((product) => stockState(product.stock) === 'out').length;
};

const showToast = (message) => {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(state.toastTimeoutId);
  state.toastTimeoutId = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
};

const closeActionMenus = () => {
  document.querySelectorAll('.action-menu.open').forEach((menu) => menu.classList.remove('open'));
  document.querySelectorAll('.row-menu[aria-expanded="true"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
};

const toggleMenu = (button) => {
  const menuId = button.dataset.menu;
  const menu = document.getElementById(`menu-${menuId}`);
  const isOpen = menu?.classList.contains('open');
  closeActionMenus();
  if (menu && !isOpen) {
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  }
};

const openModal = (modal) => modal?.classList.add('open');
const closeModal = (modal) => modal?.classList.remove('open');

const applyCategoryFilter = (button) => {
  state.category = button.dataset.category;
  elements.categoryButtons.forEach((item) => item.classList.toggle('active', item === button));
  renderProducts();
};

const handleActionButton = (button) => {
  const product = products.find((item) => item.sku === button.dataset.sku);
  if (!product) return;

  if (button.dataset.action === 'edit') {
    state.editingSku = product.sku;
    populateForm(product);
    openModal(elements.modalBackdrop);
    showToast(`Editing ${product.name}`);
    return;
  }

  if (button.dataset.action === 'stock') {
    // Open stock adjust modal
    editingStockSku = product.sku;
    const stockModal = document.getElementById('stockModal');
    const title = document.getElementById('stockTitle');
    const input = document.getElementById('stockInput');
    title.textContent = `Adjust stock for ${product.name}`;
    input.value = String(product.stock);
    stockModal.classList.add('open');
    return;
  }

  if (button.dataset.action === 'delete') {
    deletingSku = product.sku;
    const confirmModal = document.getElementById('confirmModal');
    const title = document.getElementById('confirmTitle');
    const message = document.getElementById('confirmMessage');
    title.textContent = `Delete ${product.name}`;
    message.textContent = `Are you sure you want to permanently delete ${product.name}? This cannot be undone.`;
    confirmModal.classList.add('open');
  }
};

const saveProduct = (formData) => {
  const name = String(formData.productName.value || '').trim();
  const sku = String(formData.productSku.value || '').trim().toUpperCase() || `PRD-${String(Date.now()).slice(-4)}`;
  const price = Number(formData.productPrice.value) || 0;
  const category = formData.productCategory.value || 'Home';
  const stock = Number(formData.productStock.value) || 0;

  if (!name) {
    showToast('Please enter a product name.');
    return false;
  }

  if (state.editingSku) {
    const existing = products.find((item) => item.sku === state.editingSku);
    if (!existing) {
      showToast('Selected product not found.');
      resetModalState();
      return false;
    }

    if (sku !== state.editingSku && products.some((item) => item.sku === sku)) {
      showToast('This SKU already exists. Choose a different code.');
      return false;
    }

    existing.name = name;
    existing.sku = sku;
    existing.price = price;
    existing.category = category;
    existing.stock = stock;
    saveProducts();
    renderProducts();
    showToast(`${name} updated successfully.`);
    resetModalState();
    return true;
  }

  if (products.some((item) => item.sku === sku)) {
    showToast('This SKU already exists. Choose a different code.');
    return false;
  }

  products.unshift({ name, sku, category, price, stock, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=160&q=80' });
  saveProducts();
  renderProducts();
  showToast(`${name} added successfully.`);
  resetModalState();
  return true;
};

const bindEvents = () => {
  elements.categoryButtons.forEach((button) => {
    button.addEventListener('click', () => applyCategoryFilter(button));
  });

  elements.searchInput.addEventListener('input', renderProducts);
  elements.stockFilter.addEventListener('change', renderProducts);

  elements.menuToggle?.addEventListener('click', () => elements.sidebar?.classList.toggle('open'));
  elements.addProductBtn?.addEventListener('click', () => {
    resetModalState();
    openModal(elements.modalBackdrop);
  });

  document.addEventListener('click', (event) => {
    const menuButton = event.target.closest('[data-menu]');
    const actionButton = event.target.closest('[data-action]');

    if (menuButton) {
      toggleMenu(menuButton);
      return;
    }

    if (actionButton) {
      handleActionButton(actionButton);
      closeActionMenus();
      return;
    }

    if (!event.target.closest('.row-actions')) {
      closeActionMenus();
    }
  });

  elements.filterBtn?.addEventListener('click', () => showToast('Use the category and stock filters to refine the table.'));
  elements.exportBtn?.addEventListener('click', () => showToast('Product export is ready to download.'));
  elements.topAvatar?.addEventListener('click', () => openModal(elements.profileModal));
  elements.profileButton?.addEventListener('click', () => openModal(elements.profileModal));
  elements.helpCard?.addEventListener('click', () => showToast('Need help? Reach out to support at support@stackly.com'));
  elements.closeModal?.addEventListener('click', () => {
    closeModal(elements.modalBackdrop);
    resetModalState();
  });

  elements.modalBackdrop?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeModal(elements.modalBackdrop);
    }
  });

  elements.profileModal?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      closeModal(elements.profileModal);
    }
  });

  // Confirm delete modal handlers
  document.getElementById('confirmDelete')?.addEventListener('click', () => {
    if (!deletingSku) return closeModal(document.getElementById('confirmModal'));
    const index = products.findIndex((p) => p.sku === deletingSku);
    if (index > -1) {
      products.splice(index, 1);
      saveProducts();
      renderProducts();
      showToast('Product deleted.');
    } else {
      showToast('Product not found.');
    }
    deletingSku = null;
    closeModal(document.getElementById('confirmModal'));
  });

  document.getElementById('cancelDelete')?.addEventListener('click', () => {
    deletingSku = null;
    closeModal(document.getElementById('confirmModal'));
  });

  document.getElementById('confirmModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(e.currentTarget);
  });

  // Stock modal handlers
  document.getElementById('confirmStock')?.addEventListener('click', () => {
    const input = document.getElementById('stockInput');
    const value = Number(input.value);
    if (Number.isNaN(value) || value < 0) {
      showToast('Enter a valid stock quantity.');
      return;
    }
    const prod = products.find((p) => p.sku === editingStockSku);
    if (!prod) {
      showToast('Product not found.');
      closeModal(document.getElementById('stockModal'));
      return;
    }
    prod.stock = value;
    saveProducts();
    renderProducts();
    showToast(`${prod.name} stock updated.`);
    editingStockSku = null;
    closeModal(document.getElementById('stockModal'));
  });

  document.getElementById('cancelStock')?.addEventListener('click', () => {
    editingStockSku = null;
    closeModal(document.getElementById('stockModal'));
  });

  document.getElementById('stockModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(e.currentTarget);
  });

  elements.productForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    if (saveProduct(form)) {
      form.reset();
      closeModal(elements.modalBackdrop);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(elements.modalBackdrop);
      closeModal(elements.profileModal);
      elements.sidebar?.classList.remove('open');
      closeActionMenus();
    }
  });
};

const init = () => {
  if (!elements.rows || !elements.searchInput || !elements.stockFilter || !elements.productForm) {
    console.warn('Missing required product page elements.');
    return;
  }

  bindEvents();
  renderProducts();
};

init();
