import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { Paket } from '../types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

export const PaketView: React.FC = () => {
  const { paket, addPaket, updatePaket, deletePaket, currentUser } = useApp();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingPaket, setEditingPaket] = useState<Paket | null>(null);

  // Modal Confirm Delete State (Berfungsi tanpa window.confirm)
  const [paketToDelete, setPaketToDelete] = useState<Paket | null>(null);

  // Form State
  const [formNama, setFormNama] = useState<string>('');
  const [formDurasiJam, setFormDurasiJam] = useState<number>(3);
  const [formHarga, setFormHarga] = useState<number>(13000);
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formAktif, setFormAktif] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  const isAdmin = currentUser?.role === 'admin';

  const handleOpenAdd = () => {
    setEditingPaket(null);
    setFormNama('Paket Gaming 2 Jam');
    setFormDurasiJam(2);
    setFormHarga(9000);
    setFormKeterangan('Hemat Rp 1.000 dibanding tarif reguler');
    setFormAktif(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Paket) => {
    setEditingPaket(p);
    setFormNama(p.nama_paket);
    setFormDurasiJam(Math.round(p.durasi_menit / 60));
    setFormHarga(p.harga);
    setFormKeterangan(p.keterangan);
    setFormAktif(p.is_aktif);
    setFormError('');
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!paketToDelete) return;
    deletePaket(paketToDelete.id_paket);
    setPaketToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNama.trim()) {
      setFormError('Nama paket wajib diisi!');
      return;
    }

    if (formDurasiJam <= 0 || isNaN(formDurasiJam)) {
      setFormError('Durasi jam harus lebih dari 0!');
      return;
    }

    if (formHarga <= 0 || isNaN(formHarga)) {
      setFormError('Harga paket harus lebih dari 0!');
      return;
    }

    const durasiMenit = Math.round(formDurasiJam * 60);

    if (editingPaket) {
      updatePaket(editingPaket.id_paket, {
        nama_paket: formNama.trim(),
        durasi_menit: durasiMenit,
        harga: Number(formHarga),
        keterangan: formKeterangan.trim(),
        is_aktif: formAktif,
      });
    } else {
      addPaket({
        nama_paket: formNama.trim(),
        durasi_menit: durasiMenit,
        harga: Number(formHarga),
        keterangan: formKeterangan.trim(),
        is_aktif: formAktif,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Manajemen Paket Internet & Gaming</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar paket durasi waktu billing (1 Jam, 3 Jam, 5 Jam, Paket Malam, dll).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Baru</span>
          </button>
        )}
      </div>

      {/* Grid Kartu Paket */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paket.map(p => {
          const durasiJam = Math.round(p.durasi_menit / 60);

          return (
            <div
              key={p.id_paket}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                p.is_aktif
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      p.is_aktif
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {p.is_aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">{p.nama_paket}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{p.keterangan || '-'}</p>

                <div className="my-4 py-3 px-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                      Durasi
                    </span>
                    <span className="text-sm font-bold text-slate-200">{durasiJam} Jam</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                      Harga Paket
                    </span>
                    <span className="text-base font-mono font-bold text-amber-400">
                      {formatRupiah(p.harga)}
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-colors flex items-center gap-1 px-2.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaketToDelete(p)}
                    className="p-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 rounded-md text-xs transition-colors cursor-pointer"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Konfirmasi Hapus Paket (Berfungsi Tanpa window.confirm) */}
      {paketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Paket</h3>
                <p className="text-xs text-slate-400">Paket internet akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              Apakah Anda yakin ingin menghapus <strong className="text-white">{paketToDelete.nama_paket}</strong> ({formatRupiah(paketToDelete.harga)})?
            </p>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPaketToDelete(null)}
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

      {/* Modal Tambah / Edit Paket */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPaket ? 'Edit Paket Warnet' : 'Tambah Paket Warnet Baru'}
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
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Paket</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  placeholder="Contoh: Paket 3 Jam / Paket Malam"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Durasi (Jam)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formDurasiJam}
                    onChange={e => setFormDurasiJam(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={formHarga}
                    onChange={e => setFormHarga(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={e => setFormKeterangan(e.target.value)}
                  placeholder="Keterangan durasi atau ketentuan paket..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paketAktif"
                  checked={formAktif}
                  onChange={e => setFormAktif(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="paketAktif" className="text-slate-300 font-medium">
                  Paket aktif dan dapat dipilih di kasir
                </label>
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
                  {editingPaket ? 'Simpan Perubahan' : 'Tambah Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
