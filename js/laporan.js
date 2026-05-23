const LaporanModule = {
    render() {
        const keuangan = App.data.keuangan;
        const pemasukan = keuangan.filter(k => k.jenis === 'pemasukan').reduce((a, b) => a + b.jumlah, 0);
        const pengeluaran = keuangan.filter(k => k.jenis === 'pengeluaran').reduce((a, b) => a + b.jumlah, 0);
        document.getElementById('lap-pemasukan').textContent = App.formatRupiah(pemasukan);
        document.getElementById('lap-pengeluaran').textContent = App.formatRupiah(pengeluaran);
        document.getElementById('lap-saldo').textContent = App.formatRupiah(pemasukan - pengeluaran);
        const byKat = {};
        keuangan.forEach(k => { byKat[k.kategori] = (byKat[k.kategori] || 0) + k.jumlah; });
        const katEl = document.getElementById('lap-kategori');
        if (katEl) { katEl.innerHTML = Object.entries(byKat).sort((a, b) => b[1] - a[1]).map(([kat, jml]) => `<div class="d-flex align-center justify-between mb-1" style="padding:0.5rem 0; border-bottom:1px solid var(--border);"><span class="text-sm">${kat}</span><span class="font-bold text-sm">${App.formatRupiah(jml)}</span></div>`).join(''); }
    },

    cetak(jenis) {
        const settings = App.data.settings;
        const keuangan = App.data.keuangan;
        const santri = App.data.santri;
        const spp = App.data.spp;
        const pemasukan = keuangan.filter(k => k.jenis === 'pemasukan').reduce((a, b) => a + b.jumlah, 0);
        const pengeluaran = keuangan.filter(k => k.jenis === 'pengeluaran').reduce((a, b) => a + b.jumlah, 0);
        let tableHtml = '';
        if (jenis === 'keuangan') {
            tableHtml = `<h3>Ringkasan Keuangan</h3><table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:1rem"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th></tr></thead><tbody>${keuangan.map(k => `<tr><td>${App.formatTanggal(k.tanggal)}</td><td>${k.keterangan}</td><td>${k.kategori}</td><td>${k.jenis}</td><td style="text-align:right">${App.formatRupiah(k.jumlah)}</td></tr>`).join('')}<tr style="font-weight:bold; background:#eee"><td colspan="4" style="text-align:right">Total Pemasukan</td><td style="text-align:right">${App.formatRupiah(pemasukan)}</td></tr><tr style="font-weight:bold"><td colspan="4" style="text-align:right">Total Pengeluaran</td><td style="text-align:right">${App.formatRupiah(pengeluaran)}</td></tr><tr style="font-weight:bold; background:#d4edda"><td colspan="4" style="text-align:right">Saldo</td><td style="text-align:right">${App.formatRupiah(pemasukan - pengeluaran)}</td></tr></tbody></table>`;
        } else if (jenis === 'santri') {
            tableHtml = `<h3>Data Santri</h3><table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse"><thead><tr><th>No</th><th>NIS</th><th>Nama</th><th>Kelas</th><th>Kamar</th><th>Asal</th><th>Status</th><th>Wali</th></tr></thead><tbody>${santri.map((s, i) => `<tr><td>${i+1}</td><td>${s.nis}</td><td>${s.nama}</td><td>${s.kelas}</td><td>${s.kamar}</td><td>${s.asalDaerah}</td><td>${s.status}</td><td>${s.wali}</td></tr>`).join('')}</tbody></table>`;
        } else if (jenis === 'spp') {
            const aktif = santri.filter(s => s.status === 'aktif');
            let bulanFilter = document.getElementById('spp-bulan-filter')?.value;
            if (!bulanFilter) { const now = new Date(); bulanFilter = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; }
            tableHtml = `<h3>Laporan SPP - ${App.formatBulan(bulanFilter)}</h3><table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse"><thead><tr><th>No</th><th>Nama</th><th>Kelas</th><th>Jumlah SPP</th><th>Status</th><th>Tanggal Bayar</th></tr></thead><tbody>${aktif.map((s, i) => { const rec = spp.find(x => x.santriId === s.id && x.bulan === bulanFilter); return `<tr><td>${i+1}</td><td>${s.nama}</td><td>${s.kelas}</td><td style="text-align:right">${App.formatRupiah(settings.nominalSPP)}</td><td>${rec?.status || 'belum'}</td><td>${rec?.tanggalBayar ? App.formatTanggal(rec.tanggalBayar) : '-'}</td></tr>`; }).join('')}</tbody></table>`;
        }
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Laporan - ${settings.namaPesantren}</title><style>body { font-family: Arial, sans-serif; padding: 2rem; color: #111; font-size: 13px; } h1 { font-size: 18px; color: #1a4731; margin-bottom: 2px; } h2 { font-size: 13px; color: #444; font-weight: normal; margin-bottom: 0; } .header { border-bottom: 3px solid #1a4731; padding-bottom: 0.75rem; margin-bottom: 1.5rem; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th { background: #1a4731; color: white; padding: 7px 8px; text-align: left; } td { padding: 6px 8px; border-bottom: 1px solid #ddd; } tr:hover { background: #f5f5f5; } .meta { font-size:11px; color:#888; margin-bottom:1rem; } @media print { body { padding: 0.5rem; } }</style></head><body><div class="header"><h1>${settings.namaPesantren}</h1><h2>${settings.alamat} | ${settings.telepon}</h2></div><p class="meta">Dicetak oleh: ${App.user?.name || 'Admin'} &nbsp;|&nbsp; Tanggal: ${App.formatTanggal(new Date().toISOString().slice(0, 10))} &nbsp;|&nbsp; Tahun Ajaran: ${settings.tahunAjaran}</p>${tableHtml}</body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 400);
    }
};
