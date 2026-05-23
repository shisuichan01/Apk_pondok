const Store = {
    get: (key) => {
        try { return JSON.parse(localStorage.getItem('pesantren_' + key)); }
        catch { return null; }
    },
    set: (key, val) => { localStorage.setItem('pesantren_' + key, JSON.stringify(val)); },
    remove: (key) => localStorage.removeItem('pesantren_' + key)
};

const DEFAULTS = {
    settings: {
        namaPesantren: 'Pondok Pesantren Al-Hidayah',
        alamat: 'Jl. Pesantren No. 1, Kota Santri',
        kota: 'Surabaya',
        telepon: '031-1234567',
        tahunAjaran: '2025/2026',
        nominalSPP: 350000
    },
    santri: [],
    keuangan: [],
    spp: []
};

const DEMO_DATA = {
    santri: [
        { id: 1, nis: 'PST-001', nama: 'Ahmad Fauzan', asalDaerah: 'Surabaya', kamar: 'A1', kelas: 'VII', jenisKelamin: 'L', tanggalMasuk: '2025-01-15', status: 'aktif', wali: 'Bapak Hasan', kontakWali: '08123456001' },
        { id: 2, nis: 'PST-002', nama: 'Nur Azizah', asalDaerah: 'Malang', kamar: 'B2', kelas: 'VIII', jenisKelamin: 'P', tanggalMasuk: '2025-01-10', status: 'aktif', wali: 'Ibu Siti', kontakWali: '08123456002' },
        { id: 3, nis: 'PST-003', nama: 'Rizky Maulana', asalDaerah: 'Sidoarjo', kamar: 'A2', kelas: 'IX', jenisKelamin: 'L', tanggalMasuk: '2025-01-12', status: 'aktif', wali: 'Bapak Wahyu', kontakWali: '08123456003' }
    ],
    keuangan: [
        { id: 1, tanggal: '2025-01-01', jenis: 'pemasukan', kategori: 'SPP', keterangan: 'SPP Januari - Ahmad Fauzan', jumlah: 350000, penginput: 'Admin' },
        { id: 2, tanggal: '2025-01-02', jenis: 'pemasukan', kategori: 'SPP', keterangan: 'SPP Januari - Nur Azizah', jumlah: 350000, penginput: 'Admin' },
        { id: 3, tanggal: '2025-01-05', jenis: 'pengeluaran', kategori: 'Operasional', keterangan: 'Pembelian bahan kebersihan', jumlah: 175000, penginput: 'Admin' },
        { id: 4, tanggal: '2025-01-10', jenis: 'pemasukan', kategori: 'Donasi', keterangan: 'Donasi Umum', jumlah: 500000, penginput: 'Admin' }
    ],
    spp: [
        { id: 1, santriId: 1, bulan: '2025-01', status: 'lunas', tanggalBayar: '2025-01-01', jumlah: 350000, jumlahDibayar: 350000, cicilan: [] },
        { id: 2, santriId: 2, bulan: '2025-01', status: 'lunas', tanggalBayar: '2025-01-02', jumlah: 350000, jumlahDibayar: 350000, cicilan: [] },
        { id: 3, santriId: 3, bulan: '2025-01', status: 'belum', tanggalBayar: null, jumlah: 350000, jumlahDibayar: 0, cicilan: [] }
    ]
};
