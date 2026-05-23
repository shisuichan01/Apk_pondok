const Backup = {
    exportToFile() {
        const allData = { santri: App.data.santri, keuangan: App.data.keuangan, spp: App.data.spp, settings: App.data.settings, exportDate: new Date().toISOString() };
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pesantren_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        App.toast("Backup berhasil di download!", "success");
    },

    importFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (backup.santri && backup.keuangan && backup.spp) {
                    App.data.santri = backup.santri;
                    App.data.keuangan = backup.keuangan;
                    App.data.spp = backup.spp;
                    if (backup.settings) App.data.settings = backup.settings;
                    App.saveData('santri'); App.saveData('keuangan'); App.saveData('spp'); App.saveData('settings');
                    App.toast("Restore data berhasil! Halaman akan refresh...", "success");
                    setTimeout(() => location.reload(), 1500);
                } else { App.toast("Format file backup tidak valid", "error"); }
            } catch (err) { App.toast("File backup rusak atau tidak valid", "error"); }
        };
        reader.readAsText(file);
    }
};
