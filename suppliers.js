const suppliers = [
  { name: 'Craft & Form', contact: 'Maya Rao', phone: '+91 98765 44001', products: 'Ceramics, Home decor', lastDelivery: '18 Jul 2026', status: 'Active' },
  { name: 'Northline Goods', contact: 'Daniel Kim', phone: '+91 98765 44002', products: 'Lifestyle essentials', lastDelivery: '15 Jul 2026', status: 'Active' },
  { name: 'Wellness Wholesale', contact: 'Leena Thomas', phone: '+91 98765 44003', products: 'Wellness, candles', lastDelivery: '12 Jul 2026', status: 'Pending' },
  { name: 'Oak & Co.', contact: 'Karan Mehta', phone: '+91 98765 44004', products: 'Wooden accessories', lastDelivery: '08 Jul 2026', status: 'Paused' }
];

let supplierStatus = 'All';
const supplierRows = document.getElementById('supplierRows');

function getStatusClass(status) {
  if (status === 'Pending') return 'supplier-pill warn';
  if (status === 'Paused') return 'supplier-pill danger';
  return 'supplier-pill';
}

function updateMetrics() {
  document.getElementById('totalSuppliers').textContent = suppliers.length;
  document.getElementById('dueDeliveries').textContent = suppliers.filter(item => item.status !== 'Paused').length;
  document.getElementById('openPayables').textContent = `₹${(suppliers.length * 18500).toLocaleString('en-IN')}`;
  document.getElementById('onTimeRate').textContent = `${Math.round((suppliers.filter(item => item.status === 'Active').length / suppliers.length) * 100)}%`;
}

function renderSuppliers() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const shown = suppliers.filter(item => {
    const matchesStatus = supplierStatus === 'All' || item.status === supplierStatus;
    const haystack = `${item.name} ${item.contact} ${item.phone} ${item.products}`.toLowerCase();
    return matchesStatus && haystack.includes(search);
  });

  supplierRows.innerHTML = shown.map(item => `
    <tr>
      <td><input type="checkbox" aria-label="Select ${item.name}"></td>
      <td>
        <div class="supplier-cell">
          <div class="supplier-avatar">${item.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div class="supplier-meta">
            <strong>${item.name}</strong>
            <small>${item.contact}</small>
          </div>
        </div>
      </td>
      <td>${item.contact}</td>
      <td>${item.phone}</td>
      <td>${item.products}</td>
      <td>${item.lastDelivery}</td>
      <td><span class="${getStatusClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="row-menu" data-menu="${item.name}" aria-label="Actions for ${item.name}" aria-expanded="false">⋮</button>
          <div class="action-menu" id="menu-${item.name}">
            <button data-action="view" data-name="${item.name}">👁 View supplier</button>
            <button data-action="status" data-name="${item.name}">↻ Update status</button>
            <button class="delete-action" data-action="delete" data-name="${item.name}">⌫ Remove supplier</button>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  document.getElementById('tableCount').textContent = shown.length;
  document.getElementById('rangeText').textContent = `Showing ${shown.length ? 1 : 0}–${shown.length} of ${shown.length} suppliers`;
  updateMetrics();
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

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    supplierStatus = button.dataset.status;
    document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
    renderSuppliers();
  });
});

document.getElementById('searchInput').addEventListener('input', renderSuppliers);
document.getElementById('filterBtn').addEventListener('click', () => toast('Use the supplier filters to narrow your vendor list.'));
document.getElementById('exportBtn').addEventListener('click', () => toast('Supplier export is ready to download.'));
document.getElementById('addSupplier').addEventListener('click', () => document.getElementById('supplierModal').classList.add('open'));
document.getElementById('closeSupplierModal').addEventListener('click', () => document.getElementById('supplierModal').classList.remove('open'));
document.getElementById('supplierModal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});

document.querySelector('.top-avatar')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.add('open'));
document.getElementById('sidebarProfileButton')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.add('open'));
document.getElementById('helpCard')?.addEventListener('click', () => toast('Need help? Reach out to support at support@stackly.com'));
document.getElementById('closeProfileModal')?.addEventListener('click', () => document.getElementById('profileModal')?.classList.remove('open'));
document.getElementById('profileModal')?.addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});
document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

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
    const item = suppliers.find(supplier => supplier.name === action.dataset.name);
    if (action.dataset.action === 'view') {
      toast(`Viewing ${item.name}`);
    }
    if (action.dataset.action === 'status') {
      const nextStatus = item.status === 'Pending' ? 'Active' : item.status === 'Active' ? 'Paused' : 'Active';
      item.status = nextStatus;
      renderSuppliers();
      toast(`${item.name} status updated.`);
    }
    if (action.dataset.action === 'delete' && confirm(`Remove ${item.name}?`)) {
      const index = suppliers.findIndex(supplier => supplier.name === item.name);
      if (index !== -1) {
        suppliers.splice(index, 1);
        renderSuppliers();
        toast(`${item.name} removed.`);
      }
    }
    closeMenus();
    return;
  }

  if (!event.target.closest('.row-actions')) {
    closeMenus();
  }
});

document.getElementById('supplierForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const newSupplier = {
    name: form.supplierName.value.trim(),
    contact: form.contactPerson.value.trim(),
    phone: form.supplierPhone.value.trim(),
    products: form.supplierProducts.value.trim(),
    lastDelivery: form.lastDelivery.value.trim(),
    status: form.supplierStatus.value
  };
  suppliers.unshift(newSupplier);
  form.reset();
  document.getElementById('supplierModal').classList.remove('open');
  renderSuppliers();
  toast(`${newSupplier.name} added to suppliers.`);
});

renderSuppliers();
