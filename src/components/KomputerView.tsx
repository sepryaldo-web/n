import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { Komputer, KomputerStatus } from '../types';
import {
  Monitor,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const KomputerView: React.FC = () => {
  const { komputer, addKomputer, updateKomputer, deleteKomputer, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal Form State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPc, setEditingPc] = useState<Komputer | null>(null);

  // Modal Confirm Delete State (Menghilangkan window.confirm agar 100% berfungsi di iframe/browser)
  const [pcToDelete, setPcToDelete] = useState<Komputer | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  // Form State
  const [formNomor, setFormNomor] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formSpek, setFormSpek] = useState<string>('');
  const [formTarif, setFormTarif] = useState<number>(5000);
  const [formStatus, setFormStatus] = useState<KomputerStatus>('tersedia');
  const [formError, setFormError] = useState<string>('');

  const isAdmin = currentUser?.role === 'admin';

  const handleOpenAdd = () => {
    setEditingPc(null);
    const nextNum = komputer.length + 1;
    setFormNomor(`PC-${String(nextNum).padStart(2, '0')}`);
    setFormNama(`Station PC ${String(nextNum).padStart(2, '0')}`);
    setFormSpek('Core i5, RTX 3060, RAM 16GB, Monitor 165Hz IPS');
    setFormTarif(6000);
    setFormStatus('tersedia');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (pc: Komputer) => {
    setEditingPc(pc);
    setFormNomor(pc.nomor_komputer);
    setFormNama(pc.nama_komputer);
    setFormSpek(pc.spesifikasi);
    setFormTarif(pc.tarif_per_jam);
    setFormStatus(pc.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!pcToDelete) return;
    setDeleteErrorMsg('');
    const res = deleteKomputer(pcToDelete.id_komputer);
    if (res.success) {
      setPcToDelete(null);
    } else {
      setDeleteErrorMsg(res.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNomor.trim() || !formNama.trim() || !formSpek.trim()) {
      setFormError('Nomor, nama komputer, dan spesifikasi wajib diisi!');
      return;
    }

    if (formTarif <= 0 || isNaN(formTarif)) {
      setFormError('Tarif per jam harus berupa angka positif!');
      return;
    }

    const duplicate = komputer.find(
      k =>
        k.nomor_komputer.toLowerCase() === formNomor.trim().toLowerCase() &&
        (!editingPc || editingPc.id_komputer !== k.id_komputer)
    );
    if (duplicate) {
      setFormError(`Nomor komputer ${formNomor} sudah digunakan!`);
      return;
    }

    if (editingPc) {
      updateKomputer(editingPc.id_komputer, {
        nomor_komputer: formNomor.trim(),
        nama_komputer: formNama.trim(),
        spesifikasi: formSpek.trim(),
        tarif_per_jam: Number(formTarif),
        status: formStatus,
      });
    } else {
      addKomputer({
        nomor_komputer: formNomor.trim(),
        nama_komputer: formNama.trim(),
        spesifikasi: formSpek.trim(),
        tarif_per_jam: Number(formTarif),
        status: formStatus,
      });
    }

    setModalOpen(false);
  };

  const filtered = komputer.filter(k => {
    const matchesSearch =
      k.nomor_komputer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.nama_komputer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.spesifikasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || k.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Manajemen Komputer (Station PC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar seluruh unit komputer warnet, pengaturan spesifikasi hardware, tarif, dan hapus unit.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Komputer</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor PC, nama, atau spesifikasi..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-blue-500"
        >
          <option value="all">Semua Status ({komputer.length})</option>
          <option value="tersedia">Tersedia ({komputer.filter(k => k.status === 'tersedia').length})</option>
          <option value="digunakan">Digunakan ({komputer.filter(k => k.status === 'digunakan').length})</option>
          <option value="maintenance">Maintenance ({komputer.filter(k => k.status === 'maintenance').length})</option>
        </select>
      </div>

      {/* Table Komputer */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">No. PC</th>
              <th className="px-4 py-3">Nama Unit</th>
              <th className="px-4 py-3">Spesifikasi Hardware</th>
              <th className="px-4 py-3 text-right">Tarif / Jam</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Tidak ada komputer yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filtered.map(pc => (
                <tr key={pc.id_komputer} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {pc.nomor_komputer}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                    {pc.nama_komputer}
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={pc.spesifikasi}>
                    {pc.spesifikasi}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                    {formatRupiah(pc.tarif_per_jam)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        pc.status === 'tersedia'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : pc.status === 'digunakan'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {pc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pc)}
                        title="Edit Data Komputer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErrorMsg('');
                            setPcToDelete(pc);
                          }}
                          title="Hapus Komputer"
                          className="p-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Konfirmasi Hapus Komputer (Berfungsi Tanpa window.confirm) */}
      {pcToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Station</h3>
                <p className="text-xs text-slate-400">Unit PC ini akan dihapus dari sistem</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              Apakah Anda yakin ingin menghapus <strong className="text-white font-mono">{pcToDelete.nomor_komputer}</strong> ({pcToDelete.nama_komputer})?
            </p>

            {deleteErrorMsg && (
              <div className="mb-3 p-2 bg-red-950/50 border border-red-800/60 rounded text-[11px] text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPcToDelete(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-600/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Komputer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPc ? `Edit Komputer (${editingPc.nomor_komputer})` : 'Tambah Komputer Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-2.5 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nomor Komputer</label>
                  <input
                    type="text"
                    value={formNomor}
                    onChange={e => setFormNomor(e.target.value)}
                    placeholder="Contoh: PC-01"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nama Station</label>
                  <input
                    type="text"
                    value={formNama}
                    onChange={e => setFormNama(e.target.value)}
                    placeholder="Contoh: Gaming Station 01"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Spesifikasi Hardware</label>
                <textarea
                  rows={2}
                  value={formSpek}
                  onChange={e => setFormSpek(e.target.value)}
                  placeholder="Processor, VGA, RAM, Monitor, Headset..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tarif Per Jam (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={formTarif}
                    onChange={e => setFormTarif(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status Komputer</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as KomputerStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="tersedia">Tersedia (Ready)</option>
                    <option value="digunakan">Digunakan (In-Use)</option>
                    <option value="maintenance">Maintenance (Perbaikan)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md shadow-blue-600/20"
                >
                  {editingPc ? 'Simpan Perubahan' : 'Tambah Komputer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
