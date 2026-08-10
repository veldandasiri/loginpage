// ===============================
// Default Customer Data
// ===============================
const defaultCustomers = [
  {
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 98765 43210",
    orders: 18,
    total: 24300,
    status: "Active"
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "+91 98765 43211",
    orders: 12,
    total: 18750,
    status: "Active"
  },
  {
    name: "Rahul Verma",
    email: "rahul@example.com",
    phone: "+91 98765 43212",
    orders: 5,
    total: 6420,
    status: "New"
  },
  {
    name: "Nexus Office",
    email: "orders@nexus.com",
    phone: "+91 98765 43213",
    orders: 9,
    total: 31850,
    status: "Loyal"
  }
];

// ===============================
// Local Storage
// ===============================
let customers;

try {
    const stored = localStorage.getItem("customers");
    customers = stored ? JSON.parse(stored) : null;
} catch {
    customers = null;
}

// Use default customers if none in storage
if (!customers || !Array.isArray(customers) || customers.length === 0) {
    customers = [...defaultCustomers];
    localStorage.setItem("customers", JSON.stringify(customers));
}

// ===============================
// Save Customers to Local Storage
// ===============================
function saveCustomers() {
    try {
        localStorage.setItem("customers", JSON.stringify(customers));
    } catch (e) {
        console.error("Failed to save customers to local storage:", e);
    }
}

// ===============================
// Variables
// ===============================
let filter = "All";

const rows = document.getElementById("customerRows");

let editingEmail = null;

let deletingEmail = null;

let currentPage = 1;

const pageSize = 5;



function openConfirmModal(customer) {
  const modal = document.getElementById('confirmModal');
  const title = document.getElementById('confirmTitle');
  const message = document.getElementById('confirmMessage');
  if (!customer) return;
  deletingEmail = customer.email;
  title.textContent = `Delete ${customer.name}`;
  message.textContent = `Are you sure you want to permanently delete ${customer.name}? This action cannot be undone.`;
  modal.classList.add('open');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  deletingEmail = null;
  modal.classList.remove('open');
}

document.getElementById('confirmDelete')?.addEventListener('click', () => {
  if (!deletingEmail) return closeConfirmModal();
  const idx = customers.findIndex(c => c.email === deletingEmail);
  if (idx !== -1) {
    const name = customers[idx].name;
    const deleted = customers[idx];
    customers.splice(idx,1);

saveCustomers();
    render();
    // Offer undo for deletions
    showToast(`${name} removed.`, 'Undo', () => {
      // restore at previous index
      customers.splice(idx,0,deleted);


      function resetCustomers() {

    if (!confirm("Reset all customer data?")) return;

    localStorage.removeItem("customers");

    customers = [...defaultCustomers];

    saveCustomers();

    currentPage = 1;

    render();

    toast("Customer data reset successfully.");
}

saveCustomers();
      // show restored toast and re-render
      currentPage = 1;
      render();
      showToast(`${name} restored.`);
    });
  } else {
    toast('Customer not found');
  }
  closeConfirmModal();
});

document.getElementById('cancelDelete')?.addEventListener('click', () => closeConfirmModal());

document.getElementById('confirmModal')?.addEventListener('click', event => {
  if (event.target === event.currentTarget) closeConfirmModal();
});

function getBadgeClass(status) {
  if (status === 'Loyal') return 'customer-pill';
  if (status === 'New') return 'customer-pill warn';
  return 'customer-pill';
}

function render() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const shown = customers.filter(customer => {
    const matchesFilter = filter === 'All' || customer.status === filter;
    const haystack = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase();
    return matchesFilter && haystack.includes(search);
  });

  // Pagination: determine slice of shown customers to render
  const total = shown.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const startIndex = (currentPage - 1) * pageSize;
  const paged = shown.slice(startIndex, startIndex + pageSize);

  rows.innerHTML = paged.map((customer, idx) => {
    const serial = startIndex + idx + 1;
    return `
    <tr>
      <td class="serial">${serial}</td>
      <td>
        <div class="customer-cell">
          <div class="customer-avatar">${customer.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div class="customer-meta">
            <strong>${customer.name}</strong>
            <small>${customer.orders} orders</small>
          </div>
        </div>
      </td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>${customer.orders}</td>
      <td>₹${customer.total.toLocaleString('en-IN')}</td>
      <td><span class="${getBadgeClass(customer.status)}">${customer.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="row-menu" data-menu="${customer.email}" aria-label="Actions for ${customer.name}" aria-expanded="false">⋮</button>
          <div class="action-menu" id="menu-${customer.email}">
            <button data-action="edit" data-email="${customer.email}">✎ Edit customer</button>
            <button data-action="status" data-email="${customer.email}">↻ Update status</button>
            <button class="delete-action" data-action="delete" data-email="${customer.email}">⌫ Delete customer</button>
          </div>
        </div>
      </td>
    </tr>
  `}).join('');

  document.getElementById('tableCount').textContent = shown.length;
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + paged.length;
  document.getElementById('rangeText').textContent = `Showing ${showingFrom}–${showingTo} of ${total} customers`;
  // update pagination controls
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageBtn = document.getElementById('pageBtn');
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  if (pageBtn) {
    pageBtn.textContent = String(currentPage);
    pageBtn.classList.toggle('active', true);
  }
  document.getElementById('totalCustomers').textContent = customers.length;
  document.getElementById('loyalCustomers').textContent = customers.filter(c => c.status === 'Loyal').length;
  document.getElementById('newCustomers').textContent = customers.filter(c => c.status === 'New').length;
}

function toast(message) {
  showToast(message);
}

/**
 * Show a toast message with optional action button.
 * @param {string} message
 * @param {string} [actionLabel]
 * @param {Function} [actionCb]
 */
function showToast(message, actionLabel, actionCb) {
  const el = document.getElementById('toast');
  // Clear previous
  el.innerHTML = '';
  const text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);

  let actionBtn;
  if (actionLabel && typeof actionCb === 'function') {
    actionBtn = document.createElement('button');
    actionBtn.className = 'toast-action';
    actionBtn.type = 'button';
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener('click', () => {
      try { actionCb(); } catch (e) { console.error(e); }
      el.classList.remove('show');
    }, { once: true });
    el.appendChild(actionBtn);
  }

  el.classList.add('show');
  // Auto-dismiss after 4s
  clearTimeout(el._toastTimer);
  el._toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

function closeMenus() {
  document.querySelectorAll('.action-menu.open').forEach(menu => menu.classList.remove('open'));
  document.querySelectorAll('.row-menu[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    filter = button.dataset.category;
    document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
    currentPage = 1;
    render();
  });
});

document.getElementById('searchInput').addEventListener('input', render);
document.getElementById('filterBtn').addEventListener('click', () => toast('Use the filters to narrow your customer list.'));
document.getElementById('exportBtn').addEventListener('click', () => toast('Customer export is ready to download.'));
document.getElementById('addCustomer').addEventListener('click', () => {
  // Open modal in "add" mode
  editingEmail = null;
  const modal = document.getElementById('customerModal');
  const overline = modal.querySelector('.overline');
  const title = modal.querySelector('h2');
  const submit = modal.querySelector('button[type="submit"]');
  overline.textContent = 'NEW CUSTOMER';
  title.textContent = 'Add customer';
  submit.textContent = 'Save customer';
  document.getElementById('customerForm').reset();
  modal.classList.add('open');
});

// Reset to first page when searching
document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; render(); });
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
    const customer = customers.find(item => item.email === action.dataset.email);
    if (action.dataset.action === 'edit') {
      // Open the customer modal pre-filled for editing
      if (!customer) {
        toast('Customer not found');
      } else {
        editingEmail = customer.email;
        const modal = document.getElementById('customerModal');
        const form = document.getElementById('customerForm');
        const overline = modal.querySelector('.overline');
        const title = modal.querySelector('h2');
        const submit = modal.querySelector('button[type="submit"]');
        overline.textContent = 'EDIT CUSTOMER';
        title.textContent = 'Edit customer';
        submit.textContent = 'Update customer';
        form.customerName.value = customer.name;
        form.customerEmail.value = customer.email;
        form.customerPhone.value = customer.phone;
        form.customerStatus.value = customer.status || 'Active';
        modal.classList.add('open');
      }
    }
    if (action.dataset.action === 'status') {
      if (!customer) {
        toast('Customer not found');
      } else {
        // Cycle through statuses in a predictable order
        const statuses = ['New', 'Active', 'Loyal'];
        const current = statuses.indexOf(customer.status);
        const next = statuses[(current + 1) % statuses.length] || 'New';
        customer.status = next;
        saveCustomers();
        render();
        toast(`${customer.name} status updated to ${next}.`);
      }
    }
    if (action.dataset.action === 'delete') {
      if (!customer) {
        toast('Customer not found');
      } else {
        openConfirmModal(customer);
      }
    }
    closeMenus();
    return;
  }

  if (!event.target.closest('.row-actions')) {
    closeMenus();
  }
});

document.getElementById('customerForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const name = form.customerName.value.trim();
  const email = form.customerEmail.value.trim();
  const phone = form.customerPhone.value.trim();
  const status = form.customerStatus.value || 'New';


  // Check duplicate email
const emailExists = customers.some(customer =>
    customer.email.toLowerCase() === email.toLowerCase() &&
    customer.email !== editingEmail
);

if (emailExists) {
    toast("Customer with this email already exists.");
    return;
}

  if (editingEmail) {
    // Update existing customer
    const idx = customers.findIndex(c => c.email === editingEmail);
    if (idx !== -1) {
      customers[idx].name = name;
      customers[idx].email = email;
      customers[idx].phone = phone;
      customers[idx].status = status;
      saveCustomers();
      toast(`${customers[idx].name} updated successfully.`);
    } else {
      toast('Unable to update: customer not found.');
    }
  } else {
    const newCustomer = { name, email, phone, orders: 0, total: 0, status };
    customers.unshift(newCustomer);
    saveCustomers();
    toast(`${newCustomer.name} added successfully.`);
  }

  // Reset modal and state
  editingEmail = null;
  form.reset();
  document.getElementById('customerModal').classList.remove('open');
  // After add/update, go back to first page to show the new/updated item
  currentPage = 1;
  render();
});

document.getElementById('closeCustomerModal').addEventListener('click', () => document.getElementById('customerModal').classList.remove('open'));
document.getElementById('customerModal').addEventListener('click', event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove('open');
  }
});

render();

// Pagination controls
document.getElementById('prevPageBtn')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    render();
  }
});

document.getElementById('nextPageBtn')?.addEventListener('click', () => {
  // compute total pages from current filtered set by calling render helpers
  currentPage += 1;
  render();
});
