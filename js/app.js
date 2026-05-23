const App = {
    user: null,
    currentPage: 'dashboard',
    data: {},

    init() {
        this.loadData();
        this.checkAuth();
        this.bindEvents();
    },

    loadData() {
        ['settings', 'santri', 'keuangan', 'spp'].forEach(k => {
            this.data[k] = Store.get(k) || JSON.parse(JSON.stringify(DEFAULTS[k]));
        });
    },

    saveData(key) {
        Store.set(key, this.data[key]);
    },

    checkAuth() {
        const user = Store.get('user');
        if (user) {
            this.user = user;
            this.showApp();
        } else {
            document.getElementById('login-page').style.display = 'flex';
            document.getElementById('app-shell').style.display = 'none';
        }
    },

    showApp() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';
        document.getElementById('user-display-name').textContent = this.user.name;
        document.getElementById('user-avatar-text').textContent = this.user.name.substring(0, 2).toUpperCase();
        document.getElementById('sidebar-user-name').textContent = this.user.name;
        document.getElementById('sidebar-user-role').textContent = this.user.role;
        document.getElementById('sidebar-avatar').textContent = this.user.name.substring(0, 2).toUpperCase();
        this.navigateTo('dashboard');
    },

    bindEvents() {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());
        document.querySelectorAll('.nav-item[data-page]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(el.dataset.page);
                if (window.innerWidth <= 900) this.closeSidebar();
            });
        });
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-close').addEventListener('click', () => this.closeSidebar());
        document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(el => {
            el.addEventListener('click', () => this.closeAllModals());
        });
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) this.closeAllModals();
            });
        });
    },

    handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');
        const credentials = [
            { username: 'admin', password: 'admin123', name: 'Administrator', role: 'Admin Utama' },
            { username: 'bendahara', password: 'bend123', name: 'Bendahara', role: 'Bendahara Pondok' },
        ];
        const found = credentials.find(c => c.username === username && c.password === password);
        if (found) {
            btn.textContent = 'Masuk...';
            btn.disabled = true;
            setTimeout(() => {
                this.user = found;
                Store.set('user', found);
                this.showApp();
                btn.textContent = 'Masuk';
                btn.disabled = false;
            }, 500);
        } else {
            this.showLoginError('Username atau password salah');
        }
    },

    handleLogout() {
        if (!confirm('Yakin ingin keluar?')) return;
        Store.remove('user');
        this.user = null;
        document.getElementById('app-shell').style.display = 'none';
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('login-form').reset();
    },

    showLoginError(msg) {
        let el = document.getElementById('login-error');
        if (!el) {
            el = document.createElement('div');
            el.id = 'login-error';
            el.className = 'alert alert-danger';
            document.getElementById('login-form').prepend(el);
        }
        el.textContent = msg;
        el.style.display = 'flex';
        setTimeout(() => el.style.display = 'none', 3000);
    },

    navigateTo(page) {
        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const pageEl = document.getElementById('page-' + page);
        if (pageEl) pageEl.classList.add('active');
        const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (navEl) navEl.classList.add('active');
        const titles = { dashboard: 'Dashboard', santri: 'Data Santri', keuangan: 'Kas Pondok', spp: 'SPP Santri', laporan: 'Laporan', pengaturan: 'Pengaturan' };
        document.getElementById('page-title').textContent = titles[page] || page;
        const renders = {
            dashboard: () => Dashboard.render(),
            santri: () => SantriModule.render(),
            keuangan: () => KeuanganModule.render(),
            spp: () => SPPModule.render(),
            laporan: () => LaporanModule.render(),
            pengaturan: () => PengaturanModule.render(),
        };
        if (renders[page]) renders[page]();
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('open');
    },

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    },

    closeAllModals() {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    },

    openModal(id) {
        document.getElementById(id).classList.add('open');
    },

    toast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const icons = { success: '<i class="fas fa-check-circle"></i>', error: '<i class="fas fa-times-circle"></i>', info: '<i class="fas fa-info-circle"></i>', warning: '<i class="fas fa-exclamation-triangle"></i>' };
        const titles = { success: 'Berhasil!', error: 'Gagal!', info: 'Informasi', warning: 'Peringatan' };
        const toast = document.createElement('div');
        toast.className = `toast-modern ${type}`;
        toast.innerHTML = `<div class="toast-icon ${type}">${icons[type] || icons.success}</div><div class="toast-content"><div class="toast-title">${titles[type] || titles.success}</div><div class="toast-message">${msg}</div></div><button class="toast-close"><i class="fas fa-times"></i></button>`;
        container.appendChild(toast);
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => toast.remove(), 300); });
        setTimeout(() => { if (toast.parentNode) { toast.style.animation = 'slideOutRight 0.3s ease'; setTimeout(() => toast.remove(), 300); } }, 4000);
    },

    formatRupiah(n) {
        return 'Rp ' + Number(n).toLocaleString('id-ID');
    },

    formatTanggal(str) {
        if (!str) return '-';
        const d = new Date(str);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    },

    formatBulan(str) {
        if (!str) return '-';
        const [y, m] = str.split('-');
        const names = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return names[+m] + ' ' + y;
    },

    generateId(arr) {
        return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
    }
};
