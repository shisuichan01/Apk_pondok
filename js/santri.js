simpan() {
    const get = id => document.getElementById('santri-' + id)?.value?.trim() || '';
    const data = {
        nis: get('nis'), nama: get('nama'), asalDaerah: get('asalDaerah'),
        kamar: get('kamar'), kelas: get('kelas'), jenisKelamin: get('jenisKelamin'),
        tanggalMasuk: get('tanggalMasuk'), status: get('status'),
        wali: get('wali'), kontakWali: get('kontakWali')
    };
    if (!data.nama || !data.nis) { App.toast('Nama dan NIS wajib diisi', 'error'); return; }
    const existing = App.data.santri.find(s => s.nis === data.nis && s.id !== this.editId);
    if (existing) { App.toast('NIS sudah digunakan!', 'error'); return; }
    if (this.editId) {
        const idx = App.data.santri.findIndex(x => x.id === this.editId);
        App.data.santri[idx] = { ...App.data.santri[idx], ...data };
        App.toast('Data santri diperbarui');
    } else {
        App.data.santri.push({ id: App.generateId(App.data.santri), ...data });
        App.toast('Santri baru ditambahkan');
    }
    App.saveData('santri');
    App.closeAllModals();
    this.renderTable();
    Dashboard.render();
}