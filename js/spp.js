const SPPModule = {
    bulan: '',

    render() {
        const now = new Date();
        const defaultBulan = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        const el = document.getElementById('spp-bulan-filter');
        if (el) {
            el.value = this.bulan || defaultBulan;
            this.bulan = el.value;
            el.addEventListener('change', (e) => {
                this.bulan = e.target.value;
                this.renderTable();
            });
        } else {
            this.bulan = defaultBulan;
        }
        this.renderTable();
    },

    renderTable() {
        const santri = App.data.santri.filter(s => s.status === 'aktif');
        const sppData = App.data.spp;
        const tbody = document.getElementById('spp-tbody');
        const nominalSPP = App.data.settings.nominalSPP;
        let lunas = 0, cicil = 0, belum = 0, totalTerkumpul = 0;

        if (tbody) {
            tbody.innerHTML = santri.map(s => {
                const rec = sppData.find(x => x.santriId === s.id && x.bulan === this.bulan);
                const status = rec ? rec.status : 'belum';
                const tglBayar = rec?.tanggalBayar || null;
                const jumlahDibayar = rec?.jumlahDibayar || 0;
                const sisaTagihan = nominalSPP - jumlahDibayar;
                const jumlah = rec?.jumlah || nominalSPP;

                if (status === 'lunas') { lunas++; totalTerkumpul += jumlah; }
                else if (status === 'cicil') { cicil++; totalTerkumpul += jumlahDibayar; }
                else { belum++; }

                return `<tr><td><div class="font-medium text-sm">${s.nama}</div><div class="text-xs text-muted">${s.nis} · Kelas ${s.kelas}</div></td><td>${App.formatRupiah(nominalSPP)}</td><td class="text-sm">${status === 'cicil' ? 'DP ' + App.formatRupiah(jumlahDibayar) + ' / Sisa ' + App.formatRupiah(sisaTagihan) : '-'}</td><td><span class="badge badge-${status === 'lunas' ? 'success' : (status === 'cicil' ? 'warning' : 'danger')}">${status === 'lunas' ? 'Lunas' : (status === 'cicil' ? 'Cicilan (' + Math.round(jumlahDibayar / nominalSPP * 100) + '%)' : 'Belum')}</span></td><td class="text-sm">${tglBayar ? App.formatTanggal(tglBayar) : '-'}</td><td><div class="d-flex gap-1" style="flex-wrap: wrap;">${status !== 'lunas' ? `<button class="btn btn-sm btn-primary" onclick="SPPModule.bayar(${s.id})">Lunas</button><button class="btn btn-sm btn-warning" onclick="SPPModule.bayarCicil(${s.id})">Cicil</button>` : `<button class="btn btn-sm btn-outline" disabled>✓ Lunas</button>`}${rec && rec.cicilan && rec.cicilan.length > 0 ? `<button class="btn btn-sm btn-info" onclick="SPPModule.lihatCicilan(${s.id})">Riwayat</button>` : ''}</div></td></tr>`;
            }).join('');
        }

        const total = santri.length;
        const pct = total > 0 ? Math.round((lunas + cicil) / total * 100) : 0;
        document.getElementById('spp-stat-lunas').textContent = lunas;
        document.getElementById('spp-stat-belum').textContent = belum;
        document.getElementById('spp-stat-terlambat').textContent = cicil;
        document.getElementById('spp-stat-terkumpul').textContent = App.formatRupiah(totalTerkumpul);
        const progressBar = document.getElementById('spp-progress');
        if (progressBar) { progressBar.style.width = pct + '%'; }
        const pLabel = document.getElementById('spp-progress-pct');
        if (pLabel) pLabel.textContent = pct + '% telah membayar (lunas/cicil)';
    },

    bayar(santriId) {
        const existing = App.data.spp.find(x => x.santriId === santriId && x.bulan === this.bulan);
        const today = new Date().toISOString().slice(0, 10);
        const nominal = App.data.settings.nominalSPP;
        if (existing) {
            existing.status = 'lunas';
            existing.tanggalBayar = today;
            existing.jumlahDibayar = nominal;
            existing.jumlah = nominal;
        } else {
            App.data.spp.push({ id: App.generateId(App.data.spp), santriId, bulan: this.bulan, status: 'lunas', tanggalBayar: today, jumlah: nominal, jumlahDibayar: nominal, cicilan: [] });
        }
        const s = App.data.santri.find(x => x.id === santriId);
        App.data.keuangan.push({ id: App.generateId(App.data.keuangan), tanggal: today, jenis: 'pemasukan', kategori: 'SPP', keterangan: `SPP LUNAS ${App.formatBulan(this.bulan)} - ${s?.nama || 'Santri'}`, jumlah: nominal, penginput: App.user?.name || 'Admin' });
        App.saveData('spp'); App.saveData('keuangan'); this.renderTable(); App.toast(`SPP ${s?.nama} LUNAS!`, 'success'); Dashboard.render();
    },

    bayarCicil(santriId) {
        const nominalSPP = App.data.settings.nominalSPP;
        const jumlahCicil = prompt(`Masukkan jumlah pembayaran cicilan (max Rp ${nominalSPP.toLocaleString('id-ID')}):`, '100000');
        if (!jumlahCicil) return;
        let jumlah = parseInt(jumlahCicil);
        if (isNaN(jumlah) || jumlah <= 0) { App.toast('Jumlah tidak valid', 'error'); return; }
        if (jumlah > nominalSPP) { App.toast(`Maksimal cicilan Rp ${nominalSPP.toLocaleString('id-ID')}`, 'error'); return; }
        const today = new Date().toISOString().slice(0, 10);
        const existing = App.data.spp.find(x => x.santriId === santriId && x.bulan === this.bulan);
        const s = App.data.santri.find(x => x.id === santriId);
        if (existing) {
            let jumlahDibayarBaru = (existing.jumlahDibayar || 0) + jumlah;
            existing.jumlahDibayar = jumlahDibayarBaru;
            existing.tanggalBayar = today;
            existing.cicilan = existing.cicilan || [];
            existing.cicilan.push({ tanggal: today, jumlah: jumlah, keterangan: `Cicilan ke-${existing.cicilan.length + 1}` });
            if (jumlahDibayarBaru >= nominalSPP) { existing.status = 'lunas'; existing.jumlah = nominalSPP; App.toast(`SPP ${s?.nama} LUNAS setelah cicilan!`, 'success'); }
            else { existing.status = 'cicil'; existing.jumlah = nominalSPP; App.toast(`Cicilan ${s?.nama} Rp ${jumlah.toLocaleString('id-ID')} berhasil. Sisa: Rp ${(nominalSPP - jumlahDibayarBaru).toLocaleString('id-ID')}`, 'info'); }
        } else {
            if (jumlah >= nominalSPP) {
                App.data.spp.push({ id: App.generateId(App.data.spp), santriId, bulan: this.bulan, status: 'lunas', tanggalBayar: today, jumlah: nominalSPP, jumlahDibayar: nominalSPP, cicilan: [{ tanggal: today, jumlah: jumlah, keterangan: 'Lunas langsung' }] });
                App.toast(`SPP ${s?.nama} LUNAS!`, 'success');
            } else {
                App.data.spp.push({ id: App.generateId(App.data.spp), santriId, bulan: this.bulan, status: 'cicil', tanggalBayar: today, jumlah: nominalSPP, jumlahDibayar: jumlah, cicilan: [{ tanggal: today, jumlah: jumlah, keterangan: 'Cicilan 1' }] });
                App.toast(`Cicilan pertama ${s?.nama} Rp ${jumlah.toLocaleString('id-ID')}. Sisa: Rp ${(nominalSPP - jumlah).toLocaleString('id-ID')}`, 'info');
            }
        }
        App.data.keuangan.push({ id: App.generateId(App.data.keuangan), tanggal: today, jenis: 'pemasukan', kategori: 'SPP', keterangan: `Cicilan SPP ${App.formatBulan(this.bulan)} - ${s?.nama || 'Santri'} (Rp ${jumlah.toLocaleString('id-ID')})`, jumlah: jumlah, penginput: App.user?.name || 'Admin' });
        App.saveData('spp'); App.saveData('keuangan'); this.renderTable(); Dashboard.render();
    },

    lihatCicilan(santriId) {
        const rec = App.data.spp.find(x => x.santriId === santriId && x.bulan === this.bulan);
        if (!rec || !rec.cicilan || rec.cicilan.length === 0) {
            App.toast('Belum ada riwayat cicilan', 'info');
            return;
        }
        const s = App.data.santri.find(x => x.id === santriId);
        let msg = `Riwayat Cicilan ${s?.nama} - ${App.formatBulan(this.bulan)}:\n\n`;
        rec.cicilan.forEach((c, i) => { msg += `${i+1}. ${App.formatTanggal(c.tanggal)}: Rp ${c.jumlah.toLocaleString('id-ID')} - ${c.keterangan}\n`; });
        msg += `\nTotal Dibayar: Rp ${rec.jumlahDibayar?.toLocaleString('id-ID') || 0}\nSisa: Rp ${(App.data.settings.nominalSPP - (rec.jumlahDibayar || 0)).toLocaleString('id-ID')}`;
        alert(msg);
    }
};
