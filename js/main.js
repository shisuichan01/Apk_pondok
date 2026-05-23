// ========== MAIN INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Dark mode toggle
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

    // User menu logout
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            if (confirm('Keluar dari aplikasi?')) App.handleLogout();
        });
    }

    // Event binding untuk tombol yang menggunakan ID (agar tidak mengandalkan onclick di HTML)
    const btnTambahSantri = document.getElementById('btn-tambah-santri');
    if (btnTambahSantri) btnTambahSantri.addEventListener('click', () => SantriModule.showTambah());

    const btnTambahKeuangan = document.getElementById('btn-tambah-keuangan');
    if (btnTambahKeuangan) btnTambahKeuangan.addEventListener('click', () => KeuanganModule.showTambah());

    const simpanSantri = document.getElementById('simpan-santri');
    if (simpanSantri) simpanSantri.addEventListener('click', () => SantriModule.simpan());

    const simpanKeuangan = document.getElementById('simpan-keuangan');
    if (simpanKeuangan) simpanKeuangan.addEventListener('click', () => KeuanganModule.simpan());

    const resetFilterKeu = document.getElementById('reset-filter-keu');
    if (resetFilterKeu) resetFilterKeu.addEventListener('click', () => KeuanganModule.resetFilter());

    const simpanPengaturan = document.getElementById('simpan-pengaturan');
    if (simpanPengaturan) simpanPengaturan.addEventListener('click', () => PengaturanModule.simpan());

    const resetData = document.getElementById('reset-data');
    if (resetData) resetData.addEventListener('click', () => PengaturanModule.resetData());

    const loadDemo = document.getElementById('load-demo');
    if (loadDemo) loadDemo.addEventListener('click', () => PengaturanModule.loadDemoData());

    const backupDownload = document.getElementById('backup-download');
    if (backupDownload) backupDownload.addEventListener('click', () => Backup.exportToFile());

    const restoreFile = document.getElementById('restore-file');
    if (restoreFile) restoreFile.addEventListener('change', (e) => {
        if (e.target.files.length) Backup.importFromFile(e.target.files[0]);
    });

    // Tutup modal jika klik batal atau close
    document.querySelectorAll('.modal-close, .modal-batal, [data-dismiss="modal"]').forEach(el => {
        el.addEventListener('click', () => App.closeAllModals());
    });
});

// Expose modules globally (tetap diperlukan untuk onclick inline)
window.App = App;
window.SantriModule = SantriModule;
window.KeuanganModule = KeuanganModule;
window.SPPModule = SPPModule;
window.LaporanModule = LaporanModule;
window.PengaturanModule = PengaturanModule;
window.Dashboard = Dashboard;
window.Backup = Backup;