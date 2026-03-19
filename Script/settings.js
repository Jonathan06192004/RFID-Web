/* ── AUTH GUARD ── */
const profileId = sessionStorage.getItem('profile_id');
const sessionUsername = sessionStorage.getItem('username');

if (!profileId) window.location.href = '../index.html';

/* ── POPULATE UI ── */
document.getElementById('currentUsername').value = sessionUsername || '';

/* ── LAST LOGIN ── */
const lastLoginEl = document.getElementById('lastLoginDisplay');
const stored = sessionStorage.getItem('last_login');
if (stored) {
    lastLoginEl.textContent = new Date(stored).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
    });
} else {
    const now = new Date().toISOString();
    sessionStorage.setItem('last_login', now);
    lastLoginEl.textContent = 'Just now';
}

/* ── DATABASE STATUS ── */
(async function checkDbStatus() {
    const dbEl = document.getElementById('dbStatusDisplay');
    const { error } = await supabaseClient.from('profiles').select('id').limit(1);
    if (error) {
        dbEl.textContent = '● Offline';
        dbEl.style.color = '#ef4444';
    } else {
        dbEl.textContent = '● Active';
        dbEl.className = 'info-value status-active';
    }
})();

/* ── TOAST ── */
function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ── CHANGE USERNAME ── */
document.getElementById('usernameForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value.trim();
    if (!newUsername) return;

    const { error } = await supabaseClient
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', profileId);

    if (error) { showToast('Failed to update username', 'error'); return; }

    sessionStorage.setItem('username', newUsername);
    document.getElementById('currentUsername').value = newUsername;
    document.getElementById('sessionUser').textContent = newUsername;
    document.getElementById('newUsername').value = '';
    showToast('Username updated successfully!', 'success');
});

/* ── CHANGE PASSWORD ── */
document.getElementById('passwordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword     = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) { showToast('New passwords do not match', 'error'); return; }
    if (newPassword.length < 6)          { showToast('Password must be at least 6 characters', 'error'); return; }

    // Verify current password first
    const { data, error: fetchError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .eq('password', currentPassword)
        .single();

    if (fetchError || !data) { showToast('Current password is incorrect', 'error'); return; }

    const { error } = await supabaseClient
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', profileId);

    if (error) { showToast('Failed to update password', 'error'); return; }

    showToast('Password updated successfully!', 'success');
    document.getElementById('passwordForm').reset();
});

/* ── PASSWORD TOGGLE ── */
document.querySelectorAll('.eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? '🙈' : '👁';
    });
});

/* ── LOGOUT MODAL ── */
const logoutModal  = document.getElementById('logoutModal');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel  = document.getElementById('modalCancel');

document.getElementById('logoutBtn').addEventListener('click', () =>
    logoutModal.classList.add('active')
);
modalCancel.addEventListener('click', () =>
    logoutModal.classList.remove('active')
);
logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) logoutModal.classList.remove('active');
});
modalConfirm.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '../index.html';
});

/* ── THEME ── */
function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeUI(next);
}

function updateThemeUI(theme) {
    const optIcon  = document.getElementById('themeOptionIcon');
    const optTitle = document.getElementById('themeOptionTitle');
    if (theme === 'dark') {
        optIcon.textContent  = '🌙';
        optTitle.textContent = 'Dark Mode';
    } else {
        optIcon.textContent  = '☀️';
        optTitle.textContent = 'Light Mode';
    }
}

updateThemeUI(localStorage.getItem('theme') || 'light');
