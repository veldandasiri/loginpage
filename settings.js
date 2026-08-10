const switches = document.querySelectorAll('.switch');
const saveButton = document.getElementById('saveSettings');

switches.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('on');
  });
});

saveButton?.addEventListener('click', () => {
  const storeName = document.getElementById('storeName').value.trim();
  const businessEmail = document.getElementById('businessEmail').value.trim();
  const currency = document.getElementById('currency').value;
  toast(`Settings saved for ${storeName || 'Stackly Store'} • ${currency}`);
});

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

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
