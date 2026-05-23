const PengaturanModule = {
    render() {
        const s = App.data.settings;
        ['namaPesantren', 'alamat', 'kota', 'telepon', 'tahunAjaran', 'nominalSPP'].forEach(f => {
            const el = document.getElementById('set-' + f);
            if (el) el.value = s[f] || '';
        });
    },

    simpan() {
        ['namaPesantren', 'alamat', 'kota', 'telepon', 'tahunAjaran', 'nominalSPP'].forEach(f => {
            const el = document.getElementById('set-' + f);
            if (el) App.data.settings[f] = f === 'nominalSPP' ? parseFloat(el.value) : el.value.trim();
        });
        App.saveData('settings');
        App.toast('Pengaturan disimpan');
        Dashboard.render();
    },

    resetData() {
        if (!confirm('PERHATIAN: Semua data akan dihapus total. Lanjutkan?')) return;
        App.data.santri = [];
        App.data.keuangan = [];
        App.data.spp = [];
        App.saveData('santri'); App.saveData('keuangan'); App.saveData('spp');
        App.toast('Data berhasil dikosongkan', 'info');
        Dashboard.render();
        if (App.currentPage === 'santri') SantriModule.render();
        else if (App.currentPage === 'keuangan') KeuanganModule.render();
        else if (App.currentPage === 'spp') SPPModule.render();
        else if (App.currentPage === 'laporan') LaporanModule.render();
    },

    loadDemoData() {
        if (!confirm('Muat data demo? Data yang ada akan ditimpa.')) return;
        App.data.santri = JSON.parse(JSON.stringify(DEMO_DATA.santri));
        App.data.keuangan = JSON.parse(JSON.stringify(DEMO_DATA.keuangan));
        App.data.spp = JSON.parse(JSON.stringify(DEMO_DATA.spp));
        App.saveData('santri'); App.saveData('keuangan'); App.saveData('spp');
        App.toast('Data demo dimuat!', 'success');
        Dashboard.render();
        if (App.currentPage === 'santri') SantriModule.render();
        else if (App.currentPage === 'keuangan') KeuanganModule.render();
        else if (App.currentPage === 'spp') SPPModule.render();
        else if (App.currentPage === 'laporan') LaporanModule.render();
    }
};
