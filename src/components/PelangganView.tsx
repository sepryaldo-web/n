import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration, formatDateTime, formatDateOnly } from '../utils/format';
import { Pelanggan, Billing } from '../types';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  X,
  Calendar,
  Monitor,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  ReceiptText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PelangganView: React.FC = () => {
  const {
    pelanggan,
    billing,
    pembayaran,
    komputer,
    addPelanggan,
    updatePelanggan,
    deletePelanggan,
    setDailyResetModalOpen,
    setActiveTab,
    setTrxFilterPelangganId,
  } = useApp();

  const getLocalDateStr = (d: Date = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCust, setEditingCust] = useState<Pelanggan | null>(null);

  // Date range filters for customer registration / activity
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeDatePreset, setActiveDatePreset] = useState<'today' | '7days' | 'month' | 'all' | 'custom'>('all');

  // Modal Confirm Delete State (Menghilangkan window.confirm agar 100% berfungsi)
  const [custToDelete, setCustToDelete] = useState<Pelanggan | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  // Form State (Tanpa Nomor WhatsApp / HP)
  const [formNama, setFormNama] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // History Modal State
  const [historyCust, setHistoryCust] = useState<Pelanggan | null>(null);

  // Preset shortcut handler
  const handleDatePreset = (preset: 'today' | '7days' | 'month' | 'all') => {
    setActiveDatePreset(preset);
    const now = new Date();
    const nowStr = getLocalDateStr(now);

    if (preset === 'today') {
      setStartDate(nowStr);
      setEndDate(nowStr);
    } else if (preset === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      setStartDate(getLocalDateStr(past7));
      setEndDate(nowStr);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(getLocalDateStr(firstDay));
      setEndDate(nowStr);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleOpenAdd = () => {
    setEditingCust(null);
    setFormNama('');
    setFormUsername('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Pelanggan) => {
    setEditingCust(c);
    setFormNama(c.nama);
    setFormUsername(c.username || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!custToDelete) return;
    setDeleteErrorMsg('');
    const res = deletePelanggan(custToDelete.id_pelanggan);
    if (res.success) {
      setCustToDelete(null);
    } else {
      setDeleteErrorMsg(res.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNama.trim()) {
      setFormError('Nama lengkap pelanggan wajib diisi!');
      return;
    }

    if (editingCust) {
      updatePelanggan(editingCust.id_pelanggan, {
        nama: formNama.trim(),
        username: formUsername.trim() || formNama.trim().toLowerCase().replace(/\s+/g, '_'),
      });
    } else {
      addPelanggan({
        nama: formNama.trim(),
        username: formUsername.trim() || formNama.trim().toLowerCase().replace(/\s+/g, '_'),
      });
    }

    setModalOpen(false);
  };

  const filtered = pelanggan.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      p.nama.toLowerCase().includes(q) ||
      (p.username && p.username.toLowerCase().includes(q));

    const regDate = p.tanggal_daftar;
    const matchStart = !startDate || regDate >= startDate;
    const matchEnd = !endDate || regDate <= endDate;

    return matchSearch && matchStart && matchEnd;
  });

  const custHistory = historyCust
    ? billing.filter(b => b.id_pelanggan === historyCust.id_pelanggan)
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Manajemen Data Pelanggan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar member warnet, username akun, riwayat pemakaian, terhubung ke transaksi kasir & riset harian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDailyResetModalOpen(true)}
            className="px-3 py-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Riset Harian & Tutup Shift</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Terhubung ke Tanggal Real-time */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        {/* Preset Cepat Tanggal Realtime */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => handleDatePreset('today')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                activeDatePreset === 'today'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 text-purple-300" />
              <span>Hari Ini</span>
            </button>
            <button
              onClick={() => handleDatePreset('7days')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === '7days' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleDatePreset('month')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === 'month' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleDatePreset('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Tanggal
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Ditemukan: <strong className="text-white">{filtered.length}</strong> pelanggan
          </span>
        </div>

        {/* Input Pencarian & Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama atau username member..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="whitespace-nowrap">Dari Tgl:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-hidden focus:border-purple-500"
            />
            {(startDate || endDate || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleDatePreset('all');
                }}
                className="text-xs text-purple-400 hover:underline shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Pelanggan (Tanpa Kolom WhatsApp/HP) */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nama Pelanggan</th>
              <th className="px-4 py-3">Username Member</th>
              <th className="px-4 py-3">Tgl Daftar</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Tidak ada data pelanggan ditemukan pada filter ini.
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const totalSessions = billing.filter(b => b.id_pelanggan === c.id_pelanggan).length;

                return (
                  <tr key={c.id_pelanggan} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{c.id_pelanggan}</td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      {c.nama}
                    </td>
                    <td className="px-4 py-3 text-blue-400 font-mono text-[11px]">
                      @{c.username || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDateOnly(c.tanggal_daftar)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTrxFilterPelangganId(c.id_pelanggan);
                            setActiveTab('transaksi');
                          }}
                          title="Lihat Riwayat Transaksi Kasir Pelanggan Ini"
                          className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <ReceiptText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Transaksi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setHistoryCust(c)}
                          title={`Lihat Riwayat Sesi Billing (${totalSessions} sesi)`}
                          className="px-2 py-1 bg-slate-800 hover:bg-purple-950/60 hover:text-purple-300 text-slate-300 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-purple-400" />
                          <span>Sesi ({totalSessions})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Pelanggan"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErrorMsg('');
                            setCustToDelete(c);
                          }}
                          title="Hapus Pelanggan"
                          className="p-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Konfirmasi Hapus Pelanggan (Berfungsi Tanpa window.confirm) */}
      {custToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Pelanggan</h3>
                <p className="text-xs text-slate-400">Data pelanggan akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              Apakah Anda yakin ingin menghapus data member <strong className="text-white">{custToDelete.nama}</strong>?
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
                onClick={() => setCustToDelete(null)}
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

      {/* Modal Tambah / Edit Pelanggan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingCust ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
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
                <label className="block text-slate-400 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Username Member (Opsional)
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="Contoh: budi_gamer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                />
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
                  {editingCust ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Pemakaian Pelanggan */}
      {historyCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Riwayat Pemakaian: {historyCust.nama}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Member: @{historyCust.username || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryCust(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-96 overflow-y-auto">
              {custHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Belum ada catatan riwayat sesi billing untuk pelanggan ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Kode Billing</th>
                      <th className="px-3 py-2">Station PC</th>
                      <th className="px-3 py-2">Waktu Mulai</th>
                      <th className="px-3 py-2">Durasi</th>
                      <th className="px-3 py-2 text-right">Total Biaya</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {custHistory.map(b => {
                      const pc = komputer.find(k => k.id_komputer === b.id_komputer);
                      return (
                        <tr key={b.id_billing} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2.5 font-mono text-[11px] text-blue-400">
                            {b.kode_billing}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-white">
                            {pc ? pc.nomor_komputer : 'PC-??'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-400">
                            {formatDateTime(b.waktu_mulai)}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-cyan-400">
                            {formatDuration(b.durasi_detik)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-400">
                            {formatRupiah(b.total_biaya)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                b.status_billing === 'aktif'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {b.status_billing}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTrxFilterPelangganId(historyCust.id_pelanggan);
                  setHistoryCust(null);
                  setActiveTab('transaksi');
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Lihat Semua Transaksi Kasir Pelanggan Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setHistoryCust(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
