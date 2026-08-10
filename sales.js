const STORAGE_KEY = 'stackly_sales';

const defaultSales = [
  { id: '#ORD-1042', customer: 'Aarav Sharma', products: 'Ceramic Mug × 2, Candle', payment: 'UPI', amount: 2450, status: 'Paid' },
  { id: '#ORD-1041', customer: 'Priya Patel', products: 'Tea Set', payment: 'Card', amount: 1850, status: 'Pending' },
  { id: '#ORD-1040', customer: 'Nexus Office', products: 'Desk Tray × 3, Journal', payment: 'Bank transfer', amount: 12500, status: 'Paid' },
  { id: '#ORD-1039', customer: 'Rahul Verma', products: 'Water Bottle', payment: 'Cash', amount: 780, status: 'Refunded' }
];

function loadSales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sales from storage', err);
  }
  return defaultSales.slice();
}

function saveSales() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch (err) {
    console.error('Failed to save sales to storage', err);
  }
}

let sales = loadSales();
let activeStatus = 'All';
let editingId = null;       // order id currently being edited, null = adding new
let selectedIds = new Set();
let pendingDeleteIds = [];  // ids queued for confirm-delete modal

const rows = document.getElementById('salesRows');

function getStatusClass(status) {
  if (status === 'Pending') return 'sales-pill warn';
  if (status === 'Refunded') return 'sales-pill danger';
  return 'sales-pill';
}

function formatCurrency(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function getVisibleSales() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  return sales.filter(item => {
    const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
    const haystack = `${item.id} ${item.customer} ${item.products} ${item.payment}`.toLowerCase();
    return matchesStatus && haystack.includes(search);
  });
}

function updateMetrics() {
  document.getElementById('totalOrders').textContent = sales.length;
  document.getElementById('totalRevenue').textContent = formatCurrency(sales.reduce((sum, item) => sum + item.amount, 0));
  document.getElementById('paidOrders').textContent = sales.filter(item => item.status === 'Paid').length;
  document.getElementById('pendingOrders').textContent = sales.filter(item => item.status === 'Pending').length;
}

function updateBulkBar(shown) {
  const bar = document.getElementById('bulkBar');
  const count = selectedIds.size;
  document.getElementById('bulkCount').textContent = `${count} selected`;
  bar.classList.toggle('show', count > 0);

  const selectAll = document.getElementById('selectAll');
  const visibleIds = shown.map(item => item.id);
  const visibleSelectedCount = visibleIds.filter(id => selectedIds.has(id)).length;
  selectAll.checked = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;
  selectAll.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleIds.length;
}

function render() {
  const shown = getVisibleSales();

  // drop selections for rows that no longer exist (e.g. deleted)
  const allIds = new Set(sales.map(item => item.id));
  selectedIds.forEach(id => { if (!allIds.has(id)) selectedIds.delete(id); });

  rows.innerHTML = shown.map(item => `
    <tr>
      <td><input type="checkbox" class="row-select" data-id="${item.id}" aria-label="Select ${item.id}" ${selectedIds.has(item.id) ? 'checked' : ''}></td>
      <td>
        <div class="sales-order">
          <div class="customer-avatar">${item.id.slice(-4)}</div>
          <div>
            <strong>${item.id}</strong>
            <small>${item.customer}</small>
          </div>
        </div>
      </td>
      <td>${item.customer}</td>
      <td>${item.products}</td>
      <td><span class="sales-payment">${item.payment}</span></td>
      <td><span class="sales-amount">${formatCurrency(item.amount)}</span></td>
      <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="row-menu" data-menu="${item.id}" aria-label="Actions for ${item.id}" aria-expanded="false">⋮</button>
          <div class="action-menu" id="menu-${item.id}">
            <button data-action="view" data-id="${item.id}">👁 View order</button>
            <button data-action="edit" data-id="${item.id}">✎ Edit order</button>
            <button data-action="status" data-id="${item.id}">↻ Update status</button>
            <button class="delete-action" data-action="delete" data-id="${item.id}">⌫ Delete order</button>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  document.getElementById('tableCount').textContent = shown.length;
  document.getElementById('rangeText').textContent = `Showing ${shown.length ? 1 : 0}–${shown.length} of ${shown.length} orders`;
  updateMetrics();
  updateBulkBar(shown);
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function closeMenus() {
  document.querySelectorAll('.action-menu.open').forEach(menu => menu.classList.remove('open'));
  document.querySelectorAll('.row-menu[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

/* ---------- Filters / search ---------- */

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    activeStatus = button.dataset.status;
    document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
    render();
  });
});

document.getElementById('searchInput').addEventListener('input', render);
document.getElementById('filterBtn').addEventListener('click', () => toast('Use the status filters to refine your orders.'));
document.getElementById('exportBtn').addEventListener('click', () => toast('Sales export is ready for download.'));

/* ---------- Add / Edit sale modal ---------- */

function openAddModal() {
  editingId = null;
  document.getElementById('saleForm').reset();
  document.getElementById('saleModalOverline').textContent = 'NEW ORDER';
  document.getElementById('saleModalTitle').textContent = 'Add sale';
  document.getElementById('saleFormSubmit').textContent = 'Save order';
  document.getElementById('saleModal').classList.add('open');
}

function openEditModal(id) {
  const item = sales.find(order => order.id === id);
  if (!item) return;
  editingId = id;
  const form = document.getElementById('saleForm');
  form.saleId.value = item.id;
  form.customer.value = item.customer;
  form.products.value = item.products;
  form.payment.value = item.payment;
  form.amount.value = item.amount;
  form.status.value = item.status;
  document.getElementById('saleModalOverline').textContent = 'EDIT ORDER';
  document.getElementById('saleModalTitle').textContent = 'Edit sale';
  document.getElementById('saleFormSubmit').textContent = 'Update order';
  document.getElementById('saleModal').classList.add('open');
}

document.getElementById('addSale').addEventListener('click', openAddModal);
document.getElementById('closeSaleModal').addEventListener('click', () => document.getElementById('saleModal').classList.remove('open'));
document.getElementById('saleModal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});

document.getElementById('saleForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const orderData = {
    id: form.saleId.value.trim(),
    customer: form.customer.value.trim(),
    products: form.products.value.trim(),
    payment: form.payment.value,
    amount: Number(form.amount.value) || 0,
    status: form.status.value
  };

  if (editingId) {
    const index = sales.findIndex(order => order.id === editingId);
    if (index !== -1) {
      sales[index] = orderData;
      toast(`${orderData.id} updated.`);
    }
  } else {
    sales.unshift(orderData);
    toast(`${orderData.id} added to sales.`);
  }

  saveSales();
  form.reset();
  editingId = null;
  document.getElementById('saleModal').classList.remove('open');
  render();
});

/* ---------- View order detail modal ---------- */

function openViewModal(id) {
  const item = sales.find(order => order.id === id);
  if (!item) return;
  document.getElementById('viewOrderId').textContent = item.id;
  document.getElementById('viewCustomer').textContent = item.customer;
  document.getElementById('viewProducts').textContent = item.products;
  document.getElementById('viewPayment').textContent = item.payment;
  document.getElementById('viewAmount').textContent = formatCurrency(item.amount);
  document.getElementById('viewStatus').textContent = item.status;
  document.getElementById('viewEditBtn').dataset.id = item.id;
  document.getElementById('viewModal').classList.add('open');
}

document.getElementById('closeViewModal').addEventListener('click', () => document.getElementById('viewModal').classList.remove('open'));
document.getElementById('viewModal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});
document.getElementById('viewEditBtn').addEventListener('click', event => {
  const id = event.currentTarget.dataset.id;
  document.getElementById('viewModal').classList.remove('open');
  openEditModal(id);
});

/* ---------- Confirm delete modal (single + bulk) ---------- */

function requestDelete(ids) {
  pendingDeleteIds = ids;
  const count = ids.length;
  document.getElementById('confirmTitle').textContent = count > 1 ? 'Delete orders' : 'Delete order';
  document.getElementById('confirmMessage').textContent = count > 1
    ? `Are you sure you want to delete ${count} selected orders? This can't be undone.`
    : `Are you sure you want to delete ${ids[0]}? This can't be undone.`;
  document.getElementById('confirmModal').classList.add('open');
}

document.getElementById('closeConfirmModal').addEventListener('click', () => document.getElementById('confirmModal').classList.remove('open'));
document.getElementById('cancelDelete').addEventListener('click', () => document.getElementById('confirmModal').classList.remove('open'));
document.getElementById('confirmModal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});
document.getElementById('confirmDelete').addEventListener('click', () => {
  if (pendingDeleteIds.length) {
    sales = sales.filter(order => !pendingDeleteIds.includes(order.id));
    pendingDeleteIds.forEach(id => selectedIds.delete(id));
    saveSales();
    render();
    toast(pendingDeleteIds.length > 1 ? `${pendingDeleteIds.length} orders removed.` : `${pendingDeleteIds[0]} removed.`);
  }
  pendingDeleteIds = [];
  document.getElementById('confirmModal').classList.remove('open');
});

/* ---------- Profile / help ---------- */

document.querySelector('.top-avatar')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.add('open'));
document.getElementById('sidebarProfileButton')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.add('open'));
document.getElementById('helpCard')?.addEventListener('click', () => toast('Support is available at support@stackly.com'));
document.getElementById('closeProfileModal')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.remove('open'));
document.getElementById('profileModal')?.addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});
document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

/* ---------- Row menu + row actions (view / edit / status / delete) ---------- */

document.addEventListener('click', event => {
  const menuButton = event.target.closest('[data-menu]');
  const action = event.target.closest('[data-action]');

  if (menuButton) {
    const menu = document.getElementById(`menu-${menuButton.dataset.menu}`);
    const wasOpen = menu.classList.contains('open');
    closeMenus();
    if (!wasOpen) {
      menu.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
    }
    return;
  }

  if (action) {
    const item = sales.find(order => order.id === action.dataset.id);
    if (!item) { closeMenus(); return; }

    if (action.dataset.action === 'view') {
      openViewModal(item.id);
    }
    if (action.dataset.action === 'edit') {
      openEditModal(item.id);
    }
    if (action.dataset.action === 'status') {
      const nextStatus = item.status === 'Pending' ? 'Paid' : item.status === 'Paid' ? 'Refunded' : 'Paid';
      item.status = nextStatus;
      saveSales();
      render();
      toast(`${item.id} status updated.`);
    }
    if (action.dataset.action === 'delete') {
      requestDelete([item.id]);
    }
    closeMenus();
    return;
  }

  if (!event.target.closest('.row-actions')) {
    closeMenus();
  }
});

/* ---------- Select-all + row checkboxes + bulk actions ---------- */

document.getElementById('selectAll').addEventListener('change', event => {
  const shown = getVisibleSales();
  if (event.target.checked) {
    shown.forEach(item => selectedIds.add(item.id));
  } else {
    shown.forEach(item => selectedIds.delete(item.id));
  }
  render();
});

rows.addEventListener('change', event => {
  const checkbox = event.target.closest('.row-select');
  if (!checkbox) return;
  const id = checkbox.dataset.id;
  if (checkbox.checked) {
    selectedIds.add(id);
  } else {
    selectedIds.delete(id);
  }
  updateBulkBar(getVisibleSales());
});

document.getElementById('bulkDelete').addEventListener('click', () => {
  if (selectedIds.size === 0) return;
  requestDelete(Array.from(selectedIds));
});

document.getElementById('bulkMarkPaid').addEventListener('click', () => {
  if (selectedIds.size === 0) return;
  sales.forEach(item => { if (selectedIds.has(item.id)) item.status = 'Paid'; });
  saveSales();
  render();
  toast(`${selectedIds.size} orders marked Paid.`);
});

document.getElementById('bulkMarkPending').addEventListener('click', () => {
  if (selectedIds.size === 0) return;
  sales.forEach(item => { if (selectedIds.has(item.id)) item.status = 'Pending'; });
  saveSales();
  render();
  toast(`${selectedIds.size} orders marked Pending.`);
});

render();