const Dashboard = {
    render() {
        const santri = App.data.santri;
        const keuangan = App.data.keuangan;
        const spp = App.data.spp;

        const aktif = santri.filter(s => s.status === 'aktif').length;
        const totalPemasukan = keuangan.filter(k => k.jenis === 'pemasukan').reduce((a, b) => a + b.jumlah, 0);
        const totalPengeluaran = keuangan.filter(k => k.jenis === 'pengeluaran').reduce((a, b) => a + b.jumlah, 0);
        const saldo = totalPemasukan - totalPengeluaran;

        document.getElementById('stat-santri').textContent = aktif;
        document.getElementById('stat-pemasukan').textContent = App.formatRupiah(totalPemasukan);
        document.getElementById('stat-pengeluaran').textContent = App.formatRupiah(totalPengeluaran);
        document.getElementById('stat-saldo').textContent = App.formatRupiah(saldo);
        document.getElementById('stat-saldo').style.color = saldo >= 0 ? 'var(--success)' : 'var(--danger)';

        // SPP progress untuk bulan yang dipilih di halaman SPP atau default
        let bulanFilter = document.getElementById('spp-bulan-filter')?.value;
        if (!bulanFilter) {
            const now = new Date();
            bulanFilter = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        }
        const sppBulanIni = spp.filter(s => s.bulan === bulanFilter);
        const sppLunas = sppBulanIni.filter(s => s.status === 'lunas').length;
        const sppBelum = sppBulanIni.filter(s => s.status !== 'lunas').length;
        const totalSantriAktif = santri.filter(s => s.status === 'aktif').length;
        const sppPct = totalSantriAktif > 0 ? Math.round((sppLunas / totalSantriAktif) * 100) : 0;
        document.getElementById('spp-progress-bar').style.width = sppPct + '%';
        document.getElementById('spp-progress-label').textContent = `${sppLunas} lunas, ${sppBelum} belum (${sppPct}%)`;

        const lastTx = [...keuangan].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 6);
        const txBody = document.getElementById('dashboard-tx-body');
        if (txBody) {
            txBody.innerHTML = lastTx.map(t => `<tr><td class="text-sm">${App.formatTanggal(t.tanggal)}</td><td>${t.keterangan}</td><td><span class="badge badge-${t.jenis === 'pemasukan' ? 'success' : 'danger'}">${t.jenis === 'pemasukan' ? 'Masuk' : 'Keluar'}</span></td><td class="text-right font-bold ${t.jenis === 'pemasukan' ? 'text-success' : 'text-danger'}">${t.jenis === 'pemasukan' ? '+' : '-'} ${App.formatRupiah(t.jumlah)}</td></tr>`).join('');
        }

        const recentSantri = [...santri].sort((a, b) => new Date(b.tanggalMasuk) - new Date(a.tanggalMasuk)).slice(0, 4);
        const santriList = document.getElementById('dashboard-santri-list');
        if (santriList) {
            santriList.innerHTML = recentSantri.map(s => `<div class="d-flex align-center gap-2 mb-2" style="padding:0.6rem 0; border-bottom:1px solid var(--border)"><div class="avatar" style="background: ${s.jenisKelamin === 'P' ? 'linear-gradient(135deg,#e91e8c,#f06292)' : 'linear-gradient(135deg,var(--primary),var(--primary-light))'}">${s.nama.substring(0, 2).toUpperCase()}</div><div style="flex:1"><div class="font-medium text-sm">${s.nama}</div><div class="text-xs text-muted">${s.kelas} · Kamar ${s.kamar}</div></div><span class="badge badge-${s.status === 'aktif' ? 'success' : 'neutral'}">${s.status}</span></div>`).join('');
        }

        this.renderChartDynamic();
    },

    renderChartDynamic() {
        const wrap = document.getElementById('dashboard-chart');
        if (!wrap) return;
        const keuangan = App.data.keuangan;
        if (keuangan.length === 0) {
            wrap.innerHTML = '<div class="text-center text-muted">Belum ada data keuangan</div>';
            return;
        }
        const allDates = keuangan.map(k => k.tanggal.substring(0,7)).sort();
        const uniqueMonths = [...new Set(allDates)].sort().slice(-6);
        if (uniqueMonths.length === 0) {
            wrap.innerHTML = '<div class="text-center text-muted">Tidak cukup data</div>';
            return;
        }
        const bulanLabels = uniqueMonths.map(m => App.formatBulan(m).substring(0,3));
        const pemasukan = uniqueMonths.map(m => keuangan.filter(k => k.jenis === 'pemasukan' && k.tanggal.startsWith(m)).reduce((a,x)=>a+x.jumlah,0));
        const pengeluaran = uniqueMonths.map(m => keuangan.filter(k => k.jenis === 'pengeluaran' && k.tanggal.startsWith(m)).reduce((a,x)=>a+x.jumlah,0));
        const maxVal = Math.max(...pemasukan, ...pengeluaran, 1);
        wrap.innerHTML = `<div style="display:flex; align-items:flex-end; gap:6px; height:150px; padding:0 4px;">${bulanLabels.map((label, i) => `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%;"><div style="flex:1; display:flex; align-items:flex-end; gap:2px; width:100%;"><div style="flex:1; background:var(--primary-light); border-radius:4px 4px 0 0; height:${pemasukan[i]/maxVal*100}%; min-height:3px;" title="Pemasukan: ${App.formatRupiah(pemasukan[i])}"></div><div style="flex:1; background:var(--danger); border-radius:4px 4px 0 0; height:${pengeluaran[i]/maxVal*100}%; min-height:3px; opacity:0.7;" title="Pengeluaran: ${App.formatRupiah(pengeluaran[i])}"></div></div><span style="font-size:0.65rem; color:var(--text-hint);">${label}</span></div>`).join('')}</div><div class="d-flex gap-2 mt-2 justify-center"><span><span style="background:var(--primary-light); display:inline-block; width:12px; height:12px;"></span> Pemasukan</span><span><span style="background:var(--danger); display:inline-block; width:12px; height:12px; opacity:0.7;"></span> Pengeluaran</span></div>`;
    }
};
