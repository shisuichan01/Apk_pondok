document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('pesantren_darkmode', isDark);
            const icon = darkModeToggle.querySelector('i');
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        if (localStorage.getItem('pesantren_darkmode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }

    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            if (confirm('Keluar dari aplikasi?')) App.handleLogout();
        });
    }
});

window.App = App;
window.SantriModule = SantriModule;
window.KeuanganModule = KeuanganModule;
window.SPPModule = SPPModule;
window.LaporanModule = LaporanModule;
window.PengaturanModule = PengaturanModule;
window.Dashboard = Dashboard;
window.Backup = Backup;
