const SantriModule = {
    filter: { search: '', status: '', kelas: '' },
    editId: null,

    render() { this.renderTable(); this.bindEvents(); },

    bindEvents() {
        const searchEl = document.getElementById('santri-search');
        const statusEl = document.getElementById('santri-filter-status');
        const kelasEl = document.getElementById('santri-filter-kelas');
        if (searchEl) searchEl.addEventListener('input', (e) => { this.filter.search = e.target.value.toLowerCase(); this.renderTable(); });
        if (statusEl) statusEl.addEventListener('change', (e) => { this.filter.status = e.target.value; this.renderTable(); });
        if (kelasEl) kelasEl.addEventListener('change', (e) => { this.filter.kelas = e.target.value; this.renderTable(); });
    },

    getFiltered() {
        return App.data.santri.filter(s => {
            const matchSearch = !this.filter.search || s.nama.toLowerCase().includes(this.filter.search) || s.nis.toLowerCase().includes(this.filter.search) || s.asalDaerah.toLowerCase().includes(this.filter.search);
            const matchStatus = !this.filter.status || s.status === this.filter.status;
            const matchKelas = !this.filter.kelas || s.kelas === this.filter.kelas;
            return matchSearch && matchStatus && matchKelas;
        });
    },

    renderTable() {
        const data = this.getFiltered();
        const tbody = document.getElementById('santri-tbody');
        const count = document.getElementById('santri-count');
        if (count) count.textContent = `${data.length} santri`;
        if (!data.length) { tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-hint)">Tidak ada data santri</td></tr>`; return; }
        tbody.innerHTML = data.map(s => `<tr><td><span class="text-xs text-muted">${s.nis}</span></td><td><div class="d-flex align-center gap-1"><div class="avatar" style="width:30px;height:30px;font-size:0.7rem;flex-shrink:0; background:${s.jenisKelamin === 'P' ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'linear-gradient(135deg,var(--primary),var(--primary-light))'}">${s.nama.substring(0, 2).toUpperCase()}</div><div><div class="font-medium">${s.nama}</div><div class="text-xs text-muted">${s.wali}</div></div></div></td><td>${s.kelas}</td><td>${s.kamar}</td><td>${s.asalDaerah}</td><td><span class="badge ${s.jenisKelamin === 'L' ? 'badge-info' : 'badge-pink'}">${s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span></td><td><span class="badge badge-${s.status === 'aktif' ? 'success' : (s.status === 'alumni' ? 'info' : 'danger')}">${s.status}</span></td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-outline" onclick="SantriModule.showEdit(${s.id})">✎</button><button class="btn btn-sm btn-danger" onclick="SantriModule.hapus(${s.id})">✕</button></div></td></tr>`).join('');
    },

    showTambah() {
        this.editId = null;
        document.getElementById('modal-santri-title').textContent = 'Tambah Santri Baru';
        document.getElementById('form-santri').reset();
        document.getElementById('santri-tanggalMasuk').value = new Date().toISOString().slice(0, 10);
        App.openModal('modal-santri');
    },

    showEdit(id) {
        const s = App.data.santri.find(x => x.id === id);
        if (!s) return;
        this.editId = id;
        document.getElementById('modal-santri-title').textContent = 'Edit Data Santri';
        ['nis', 'nama', 'asalDaerah', 'kamar', 'kelas', 'jenisKelamin', 'tanggalMasuk', 'status', 'wali', 'kontakWali'].forEach(f => {
            const el = document.getElementById('santri-' + f);
            if (el) el.value = s[f] || '';
        });
        App.openModal('modal-santri');
    },

    simpan() {
        const get = id => document.getElementById('santri-' + id)?.value?.trim() || '';
        const data = { nis: get('nis'), nama: get('nama'), asalDaerah: get('asalDaerah'), kamar: get('kamar'), kelas: get('kelas'), jenisKelamin: get('jenisKelamin'), tanggalMasuk: get('tanggalMasuk'), status: get('status'), wali: get('wali'), kontakWali: get('kontakWali') };
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
    },

    hapus(id) {
        const s = App.data.santri.find(x => x.id === id);
        if (!s) return;
        if (!confirm(`Hapus data santri "${s.nama}"?`)) return;
        App.data.santri = App.data.santri.filter(x => x.id !== id);
        App.saveData('santri');
        this.renderTable();
        App.toast('Data santri dihapus');
    }
};
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