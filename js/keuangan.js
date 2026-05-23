const KeuanganModule = {
    filter: { search: '', jenis: '', bulan: '' },
    editId: null,
    lastSaldo: 0,

    render() {
        this.renderTable();
        this.renderSummary();
        this.bindEvents();
    },

    bindEvents() {
        const searchEl = document.getElementById('keu-search');
        const jenisEl = document.getElementById('keu-filter-jenis');
        const bulanEl = document.getElementById('keu-filter-bulan');
        if (searchEl) searchEl.addEventListener('input', (e) => { this.filter.search = e.target.value.toLowerCase(); this.renderTable(); });
        if (jenisEl) jenisEl.addEventListener('change', (e) => { this.filter.jenis = e.target.value; this.renderTable(); });
        if (bulanEl) bulanEl.addEventListener('change', (e) => { this.filter.bulan = e.target.value; this.renderTable(); });
    },

    getFiltered() {
        return App.data.keuangan.filter(k => {
            const matchSearch = !this.filter.search || k.keterangan.toLowerCase().includes(this.filter.search) || k.kategori.toLowerCase().includes(this.filter.search);
            const matchJenis = !this.filter.jenis || k.jenis === this.filter.jenis;
            const matchBulan = !this.filter.bulan || k.tanggal.startsWith(this.filter.bulan);
            return matchSearch && matchJenis && matchBulan;
        }).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    },

    renderSummary() {
        const keu = App.data.keuangan;
        const pemasukan = keu.filter(k => k.jenis === 'pemasukan').reduce((a, b) => a + b.jumlah, 0);
        const pengeluaran = keu.filter(k => k.jenis === 'pengeluaran').reduce((a, b) => a + b.jumlah, 0);
        document.getElementById('keu-total-pemasukan').textContent = App.formatRupiah(pemasukan);
        document.getElementById('keu-total-pengeluaran').textContent = App.formatRupiah(pengeluaran);
        const saldo = pemasukan - pengeluaran;
        document.getElementById('keu-saldo').textContent = App.formatRupiah(saldo);
        document.getElementById('keu-saldo').style.color = saldo >= 0 ? 'var(--success)' : 'var(--danger)';
        this.lastSaldo = saldo;
    },

    renderTable() {
        const data = this.getFiltered();
        const tbody = document.getElementById('keu-tbody');
        if (!tbody) return;
        tbody.innerHTML = data.map(k => `<tr><td class="text-sm">${App.formatTanggal(k.tanggal)}</td><td><div class="font-medium text-sm">${k.keterangan}</div><div class="text-xs text-muted">${k.kategori}</div></td><td><span class="badge badge-${k.jenis === 'pemasukan' ? 'success' : 'danger'}">${k.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span></td><td class="text-right font-bold ${k.jenis === 'pemasukan' ? 'text-success' : 'text-danger'}">${k.jenis === 'pemasukan' ? '+' : '-'} ${App.formatRupiah(k.jumlah)}</td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-outline" onclick="KeuanganModule.showEdit(${k.id})">✎</button><button class="btn btn-sm btn-danger" onclick="KeuanganModule.hapus(${k.id})">✕</button></div></td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-hint)">Tidak ada transaksi</td></tr>`;
    },

    showTambah() {
        document.getElementById('modal-keu-title').textContent = 'Tambah Transaksi';
        document.getElementById('keu-tanggal').value = new Date().toISOString().slice(0, 10);
        this.editId = null;
        App.openModal('modal-keuangan');
    },

    showEdit(id) {
        const k = App.data.keuangan.find(x => x.id === id);
        if (!k) return;
        this.editId = id;
        document.getElementById('modal-keu-title').textContent = 'Edit Transaksi';
        ['tanggal', 'jenis', 'kategori', 'keterangan', 'jumlah'].forEach(f => {
            const el = document.getElementById('keu-' + f);
            if (el) el.value = k[f] || '';
        });
        App.openModal('modal-keuangan');
    },

    simpan() {
        const get = id => document.getElementById('keu-' + id)?.value?.trim() || '';
        const jenis = get('jenis');
        let jumlah = parseFloat(get('jumlah')) || 0;
        if (jumlah <= 0) { App.toast('Jumlah harus lebih dari 0', 'error'); return; }
        if (jenis === 'pengeluaran') {
            if (this.lastSaldo - jumlah < 0) {
                if (!confirm(`Peringatan: Saldo kas akan menjadi negatif (${App.formatRupiah(this.lastSaldo - jumlah)}). Lanjutkan?`)) return;
            }
        }
        const data = {
            tanggal: get('tanggal'),
            jenis: jenis,
            kategori: get('kategori'),
            keterangan: get('keterangan'),
            jumlah: jumlah,
            penginput: App.user?.name || 'Admin'
        };
        if (!data.keterangan || !data.jenis) { App.toast('Lengkapi semua field wajib', 'error'); return; }
        if (this.editId) {
            const idx = App.data.keuangan.findIndex(x => x.id === this.editId);
            App.data.keuangan[idx] = { ...App.data.keuangan[idx], ...data };
            App.toast('Transaksi diperbarui');
        } else {
            App.data.keuangan.push({ id: App.generateId(App.data.keuangan), ...data });
            App.toast('Transaksi ditambahkan');
        }
        App.saveData('keuangan');
        App.closeAllModals();
        this.renderTable();
        this.renderSummary();
        Dashboard.render();
    },

    hapus(id) {
        if (!confirm('Hapus transaksi ini?')) return;
        App.data.keuangan = App.data.keuangan.filter(x => x.id !== id);
        App.saveData('keuangan');
        this.renderTable();
        this.renderSummary();
        App.toast('Transaksi dihapus');
    },

    resetFilter() {
    this.filter = { search: '', jenis: '', bulan: '' };
    const search = document.getElementById('keu-search');
    const jenis = document.getElementById('keu-filter-jenis');
    const bulan = document.getElementById('keu-filter-bulan');
    if (search) search.value = '';
    if (jenis) jenis.value = '';
    if (bulan) bulan.value = '';
    this.renderTable();
}