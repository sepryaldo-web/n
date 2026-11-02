import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration, formatDateTime } from '../utils/format';
import {
  ReceiptText,
  Search,
  Printer,
  Eye,
  Calendar,
  Banknote,
  CreditCard,
  QrCode,
  X,
  RotateCcw,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Pembayaran } from '../types';

export const TransaksiView: React.FC = () => {
  const {
    pembayaran,
    billing,
    komputer,
    pelanggan,
    users,
    openReceiptModal,
    setDailyResetModalOpen,
    trxFilterPelangganId,
    setTrxFilterPelangganId,
  } = useApp();

  const getLocalDateStr = (d: Date = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateStr();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPc, setFilterPc] = useState<string>('all');
  const [filterPelanggan, setFilterPelanggan] = useState<string>(() => {
    return trxFilterPelangganId ? String(trxFilterPelangganId) : 'all';
  });
  const [filterMetode, setFilterMetode] = useState<string>('all');

  // Real-time date range filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeDatePreset, setActiveDatePreset] = useState<'today' | '7days' | 'month' | 'all' | 'custom'>('all');

  const [detailTrx, setDetailTrx] = useState<Pembayaran | null>(null);

  // Sync dengan pilihan pelanggan dari menu Pelanggan
  React.useEffect(() => {
    if (trxFilterPelangganId) {
      setFilterPelanggan(String(trxFilterPelangganId));
    }
  }, [trxFilterPelangganId]);

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

  // Live filter transactions secara realtime
  const filtered = pembayaran.filter(p => {
    const b = billing.find(item => item.id_billing === p.id_billing);
    const pc = b ? komputer.find(k => k.id_komputer === b.id_komputer) : null;
    const cust = b ? pelanggan.find(c => c.id_pelanggan === b.id_pelanggan) : null;

    // Search query
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      p.nomor_transaksi.toLowerCase().includes(q) ||
      (cust && cust.nama.toLowerCase().includes(q)) ||
      (cust && cust.username && cust.username.toLowerCase().includes(q)) ||
      (pc && pc.nomor_komputer.toLowerCase().includes(q));

    // PC Filter
    const matchPc = filterPc === 'all' || (pc && String(pc.id_komputer) === filterPc);

    // Pelanggan Filter
    const matchPelanggan = filterPelanggan === 'all' || (cust && String(cust.id_pelanggan) === filterPelanggan);

    // Metode Filter
    const matchMetode = filterMetode === 'all' || p.metode_pembayaran === filterMetode;

    // Realtime Date Filter (membandingkan tanggal YYYY-MM-DD secara realtime)
    const trxDate = p.waktu_bayar.slice(0, 10);
    const matchStart = !startDate || trxDate >= startDate;
    const matchEnd = !endDate || trxDate <= endDate;

    return matchSearch && matchPc && matchPelanggan && matchMetode && matchStart && matchEnd;
  });

  const filteredTotalOmset = filtered.reduce((acc, curr) => acc + curr.total_tagihan, 0);

  // Statistik Real-time Hari Ini
  const todayTransactions = pembayaran.filter(p => p.waktu_bayar.startsWith(todayStr));
  const todayTotal = todayTransactions.reduce((acc, curr) => acc + curr.total_tagihan, 0);

  const getMetodeIcon = (m: string) => {
    switch (m) {
      case 'tunai': return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'transfer': return <CreditCard className="w-3.5 h-3.5 text-blue-400" />;
      case 'qris': return <QrCode className="w-3.5 h-3.5 text-cyan-400" />;
      default: return null;
    }
  };

  const selectedBilling = detailTrx ? billing.find(b => b.id_billing === detailTrx.id_billing) : null;
  const selectedPc = selectedBilling ? komputer.find(k => k.id_komputer === selectedBilling.id_komputer) : null;
  const selectedCust = selectedBilling ? pelanggan.find(c => c.id_pelanggan === selectedBilling.id_pelanggan) : null;
  const selectedOperator = detailTrx ? users.find(u => u.id_user === detailTrx.id_operator) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-400" />
            <span>Riwayat Transaksi Kasir Real-time</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar transaksi kasir, filter pelanggan, filter rentang tanggal realtime, dan cetak ulang struk.
          </p>
        </div>

        {/* Ringkasan Hari Ini & Tombol Riset Harian */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Shift Hari Ini:</span>
            <span className="font-bold text-white font-mono">{todayTransactions.length} Trx</span>
            <span className="font-mono text-emerald-400 font-bold">({formatRupiah(todayTotal)})</span>
          </div>

          <button
            type="button"
            onClick={() => setDailyResetModalOpen(true)}
            className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Riset Harian & Tutup Shift</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Terhubung ke Pelanggan, Komputer & Tanggal Realtime */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        {/* Preset Cepat Tanggal Real-time */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => handleDatePreset('today')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                activeDatePreset === 'today'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-300" />
              <span>Hari Ini (Real-time Sekarang)</span>
            </button>
            <button
              onClick={() => handleDatePreset('7days')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === '7days'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handleDatePreset('month')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === 'month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleDatePreset('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeDatePreset === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Tanggal
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">
              Ditemukan: <strong className="text-white">{filtered.length}</strong> trx
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Total: {formatRupiah(filteredTotalOmset)}
            </span>
          </div>
        </div>

        {/* Input Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari No. Trx, Pelanggan, PC..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Filter Pelanggan */}
          <div>
            <select
              value={filterPelanggan}
              onChange={e => setFilterPelanggan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">Semua Pelanggan / Member</option>
              {pelanggan.map(c => (
                <option key={c.id_pelanggan} value={String(c.id_pelanggan)}>
                  {c.nama} {c.username ? `(@${c.username})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Komputer */}
          <div>
            <select
              value={filterPc}
              onChange={e => setFilterPc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">Semua Station PC</option>
              {komputer.map(k => (
                <option key={k.id_komputer} value={String(k.id_komputer)}>
                  {k.nomor_komputer} - {k.nama_komputer} ({formatRupiah(k.tarif_per_jam)}/jam)
                </option>
              ))}
            </select>
          </div>

          {/* Filter Metode Pembayaran */}
          <div>
            <select
              value={filterMetode}
              onChange={e => setFilterMetode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-hidden focus:border-blue-500"
            >
              <option value="all">Semua Metode Pembayaran</option>
              <option value="tunai">Tunai (Cash)</option>
              <option value="transfer">Transfer Bank</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
        </div>

        {/* Date Range Inputs Real-time */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Dari Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setActiveDatePreset('custom');
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          {(startDate || endDate || filterPc !== 'all' || filterPelanggan !== 'all' || filterMetode !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPc('all');
                setFilterPelanggan('all');
                setFilterMetode('all');
                handleDatePreset('all');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline ml-auto"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Transaksi */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">No. Transaksi</th>
              <th className="px-4 py-3">Waktu Bayar</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Komputer</th>
              <th className="px-4 py-3">Durasi</th>
              <th className="px-4 py-3 text-right">Total Biaya</th>
              <th className="px-4 py-3 text-center">Metode</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  Belum ada data transaksi yang tercatat. Transaksi baru yang dibayarkan kasir akan otomatis muncul secara real-time di sini.
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const b = billing.find(item => item.id_billing === p.id_billing);
                const pc = b ? komputer.find(k => k.id_komputer === b.id_komputer) : null;
                const cust = b ? pelanggan.find(c => c.id_pelanggan === b.id_pelanggan) : null;

                return (
                  <tr key={p.id_pembayaran} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                      {p.nomor_transaksi}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDateTime(p.waktu_bayar)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200 whitespace-nowrap">
                      {cust ? cust.nama : 'Pelanggan'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-blue-400 font-mono">
                        {pc ? pc.nomor_komputer : 'PC-??'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400 whitespace-nowrap">
                      {b ? formatDuration(b.durasi_detik) : '00:00:00'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatRupiah(p.total_tagihan)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 uppercase font-semibold text-[11px] text-slate-300">
                        {getMetodeIcon(p.metode_pembayaran)}
                        <span>{p.metode_pembayaran}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {p.status_pembayaran}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailTrx(p)}
                          title="Lihat Detail Transaksi"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openReceiptModal(p.id_pembayaran)}
                          title="Cetak Struk Kasir"
                          className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 rounded-md transition-colors border border-emerald-800/40"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Modal Detail Transaksi */}
      {detailTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                <span>Detail Transaksi: {detailTrx.nomor_transaksi}</span>
              </h3>
              <button
                onClick={() => setDetailTrx(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="font-bold text-white">{selectedCust?.nama || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Komputer:</span>
                <span className="font-bold text-white">
                  {selectedPc?.nomor_komputer} ({selectedPc?.nama_komputer})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Bayar:</span>
                <span className="font-mono text-slate-200">{formatDateTime(detailTrx.waktu_bayar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operator Kasir:</span>
                <span className="text-slate-200">{selectedOperator?.nama_lengkap || 'Kasir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Durasi Pemakaian:</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {selectedBilling ? formatDuration(selectedBilling.durasi_detik) : '00:00:00'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-300">Total Tagihan:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {formatRupiah(detailTrx.total_tagihan)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Bayar:</span>
                <span className="uppercase font-semibold text-blue-400">
                  {detailTrx.metode_pembayaran}
                </span>
              </div>
              {detailTrx.metode_pembayaran === 'tunai' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah Uang Diterima:</span>
                    <span className="font-mono text-slate-200">{formatRupiah(detailTrx.jumlah_bayar)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>Kembalian:</span>
                    <span className="font-mono">{formatRupiah(detailTrx.kembalian)}</span>
                  </div>
                </>
              )}
              {detailTrx.catatan && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Catatan: {detailTrx.catatan}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDetailTrx(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const pId = detailTrx.id_pembayaran;
                  setDetailTrx(null);
                  openReceiptModal(pId);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Kasir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
