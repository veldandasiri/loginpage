document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const toast = (message) => { let el = $('#dashboardToast'); if (!el) { el = document.createElement('div'); el.id = 'dashboardToast'; el.style.cssText = 'position:fixed;right:28px;bottom:28px;background:#243c25;color:#fff;padding:14px 18px;border-radius:10px;box-shadow:0 12px 28px #0003;z-index:999999;font:600 14px Outfit,sans-serif;transition:.25s;transform:translateY(80px);opacity:0'; document.body.appendChild(el); } el.textContent = message; el.style.transform = 'translateY(0)'; el.style.opacity = '1'; clearTimeout(el.hideTimer); el.hideTimer = setTimeout(() => { el.style.transform = 'translateY(80px)'; el.style.opacity = '0'; }, 2800); };
  const showPopup = id => { const popup = $(id); if (popup) popup.classList.add('show'); };
  const hidePopup = id => { const popup = $(id); if (popup) popup.classList.remove('show'); };

  // Sidebar and theme
  const sidebar = $('.sidebar'); $('.menu-btn')?.addEventListener('click', () => sidebar?.classList.toggle('active'));
  const iconButtons = $$('.icon-btn'); const themeButton = iconButtons[2];
  const applyTheme = dark => { document.body.classList.toggle('dark-mode', dark); const icon = themeButton?.querySelector('i'); if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'; };
  applyTheme(localStorage.getItem('stackly-theme') === 'dark');
  themeButton?.addEventListener('click', () => { const dark = !document.body.classList.contains('dark-mode'); localStorage.setItem('stackly-theme', dark ? 'dark' : 'light'); applyTheme(dark); toast(dark ? 'Dark mode enabled' : 'Light mode enabled'); });

  // Notification and message buttons
  const createPanel = (title, items) => { const panel = document.createElement('div'); panel.style.cssText = 'position:fixed;top:82px;right:118px;width:310px;background:#fff;border-radius:14px;box-shadow:0 16px 35px #0003;padding:14px;z-index:9999;display:none;color:#202020'; panel.innerHTML = `<strong style="display:block;padding:4px 5px 10px;font-size:16px">${title}</strong>${items.map(item => `<button style="display:block;width:100%;text-align:left;background:#f7f9f6;border:0;border-radius:8px;padding:11px;margin:6px 0;cursor:pointer;font:14px Outfit,sans-serif">${item}</button>`).join('')}`; document.body.appendChild(panel); return panel; };
  const notificationPanel = createPanel('Notifications', ['Low stock: Oak Desk Tray has 3 units left.', 'New order #1042 was received.', 'Daily sales report is ready.']);
  const messagePanel = createPanel('Messages', ['Priya: Please call me about order #1038.', 'Supplier: Your delivery is scheduled for tomorrow.']); messagePanel.style.right = '64px';
  [[iconButtons[0], notificationPanel], [iconButtons[1], messagePanel]].forEach(([button, panel]) => button?.addEventListener('click', e => { e.stopPropagation(); const open = panel.style.display === 'block'; notificationPanel.style.display = 'none'; messagePanel.style.display = 'none'; panel.style.display = open ? 'none' : 'block'; }));
  document.addEventListener('click', e => { if (!e.target.closest('#dashboardToast')) { notificationPanel.style.display = 'none'; messagePanel.style.display = 'none'; } });

  // Profile menu and popups
  const profile = $('#profileMenu'); const profileDropdown = $('.profile-dropdown');
  profile?.addEventListener('click', e => { e.stopPropagation(); profileDropdown?.classList.toggle('show'); });
  document.addEventListener('click', () => profileDropdown?.classList.remove('show'));
  $$('.profile-dropdown a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const popup = link.getAttribute('data-popup');
      if (popup) showPopup(`#${popup}`);
      else if (link.id === 'logoutFromProfile') showPopup('#logoutPopup');
    });
  });
  $('#myProfileBtn')?.addEventListener('click', () => { hidePopup('#profilePopup'); showPopup('#profileDetailsPopup'); });
  $('#changePasswordBtn')?.addEventListener('click', () => { hidePopup('#profilePopup'); showPopup('#changePasswordPopup'); });
  $('#settingsBtn')?.addEventListener('click', () => { hidePopup('#profilePopup'); showPopup('#accountSettingsPopup'); });
  $('#profileLogoutBtn')?.addEventListener('click', () => { hidePopup('#profilePopup'); showPopup('#logoutPopup'); });
  $('#closeProfile')?.addEventListener('click', () => hidePopup('#profilePopup')); $('#closeProfileDetails')?.addEventListener('click', () => hidePopup('#profileDetailsPopup')); $('#closeSettings')?.addEventListener('click', () => hidePopup('#accountSettingsPopup')); $('#closePassword')?.addEventListener('click', () => hidePopup('#changePasswordPopup')); $('#cancelLogout')?.addEventListener('click', () => hidePopup('#logoutPopup'));
  $$('#changePasswordPopup .logout-btn').forEach(btn => btn.addEventListener('click', () => { hidePopup('#changePasswordPopup'); toast('Password updated successfully.'); }));
  $('#confirmLogout')?.addEventListener('click', () => { window.location.href = 'loginpage.html'; });
  $('.logout')?.addEventListener('click', () => showPopup('#logoutPopup'));
  $$('.popup-overlay').forEach(overlay => overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); }));

  // Working dashboard buttons
  $('.primary-btn')?.addEventListener('click', () => { const report = `Stackly POS Report\nGenerated: ${new Date().toLocaleString()}\nRevenue: ₹8,42,500\nOrders: 1,254`; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([report], {type:'text/plain'})); link.download = 'stackly-sales-report.txt'; link.click(); URL.revokeObjectURL(link.href); toast('Sales report downloaded.'); });
  $('.orders-card .card-header button')?.addEventListener('click', () => { window.location.href = 'sales.html'; });
  $$('.quick-grid button').forEach((button, index) => button.addEventListener('click', () => { if (index === 0) window.location.href = 'products.html'; else if (index === 3) $('.primary-btn')?.click(); else toast(index === 1 ? 'New customer form is ready to be added.' : 'Invoice creation is ready to be added.'); }));
  const searchInput = document.getElementById('dashboardSearch');
  const updateOrderSearch = () => {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.orders-card tbody tr').forEach(row => {
      const visible = !query || row.textContent.toLowerCase().includes(query);
      row.style.display = visible ? '' : 'none';
    });
  };
  if (searchInput) {
    searchInput.addEventListener('input', updateOrderSearch);
    searchInput.addEventListener('keyup', updateOrderSearch);
  }

  // Navigation: sends the user to implemented pages and explains unfinished modules.
  const available = {Dashboard:'dashboard.html', Sales:'sales.html', Invoices:'invoices.html', Products:'products.html', Inventory:'inventory.html', Customers:'customers.html', Suppliers:'suppliers.html', Reports:'reports.html', Settings:'settings.html'};
  $$('.menu li').forEach(item => item.addEventListener('click', () => { const name = item.querySelector('span')?.textContent.trim(); if (name === 'Logout') return showPopup('#logoutPopup'); if (available[name]) window.location.href = available[name]; else toast(`${name} module is coming next.`); }));

  window.goDashboard = () => { window.location.href = 'dashboard.html'; };
  window.goSales = () => { window.location.href = 'sales.html'; };
  window.goProducts = () => { window.location.href = 'products.html'; };
  window.goInvoices = () => { window.location.href = 'invoices.html'; };
  window.goInventory = () => { window.location.href = 'inventory.html'; };
  window.goCustomers = () => { window.location.href = 'customers.html'; };
  window.goSuppliers = () => { window.location.href = 'suppliers.html'; };
  window.goReports = () => { window.location.href = 'reports.html'; };
  window.goSettings = () => { window.location.href = 'settings.html'; };

  // Charts only load if Chart.js is available.
  if (window.Chart) {
    new Chart($('#salesChart'), {type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul'],datasets:[{label:'Sales',data:[120,190,170,250,320,290,420],borderColor:'#a12828',backgroundColor:'rgba(161,40,40,.15)',fill:true,tension:.4,pointRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}}}});
    new Chart($('#revenueChart'), {type:'doughnut',data:{labels:['Online','Retail','Wholesale'],datasets:[{data:[45,35,20],backgroundColor:['#a12828','#3b82f6','#20c997']}]},options:{responsive:true,cutout:'70%',plugins:{legend:{position:'bottom'}}}});
  }
  const hour = new Date().getHours(); const heading = $('.welcome h1'); if (heading) heading.textContent = hour < 12 ? 'Good Morning ☀️' : hour < 18 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';
});
