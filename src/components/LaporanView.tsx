import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration, formatDateTime, formatDateOnly, downloadCsv } from '../utils/format';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Receipt,
  Clock,
  Monitor,
  Flame,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const { pembayaran, billing, komputer, pelanggan, resetSemuaLaporan } = useApp();

  const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // awal bulan
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [resetSuccessBanner, setResetSuccessBanner] = useState<boolean>(false);

  const handlePresetChange = (val: 'today' | 'week' | 'month' | 'custom') => {
    setPreset(val);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (val === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (val === 'week') {
      const past7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (val === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  const handleExecuteResetAll = () => {
    resetSemuaLaporan();
    setConfirmResetOpen(false);
    setResetSuccessBanner(true);
  };

  // Filter payments by date range
  const filteredPembayaran = pembayaran.filter(p => {
    let match = true;
    if (startDate) {
      match = match && p.waktu_bayar >= `${startDate}T00:00:00`;
    }
    if (endDate) {
      match = match && p.waktu_bayar <= `${endDate}T23:59:59`;
    }
    return match;
  });

  // Calculate Metrics
  const totalOmset = filteredPembayaran.reduce((sum, p) => sum + p.total_tagihan, 0);
  const totalTransaksi = filteredPembayaran.length;

  // Total durasi
  let totalDurasiDetik = 0;
  filteredPembayaran.forEach(p => {
    const b = billing.find(item => item.id_billing === p.id_billing);
    if (b) {
      totalDurasiDetik += b.durasi_detik;
    }
  });

  // Most used PC ranking
  const pcUsageMap: Record<number, { count: number; totalSeconds: number; revenue: number }> = {};
  filteredPembayaran.forEach(p => {
    const b = billing.find(item => item.id_billing === p.id_billing);
    if (b) {
      if (!pcUsageMap[b.id_komputer]) {
        pcUsageMap[b.id_komputer] = { count: 0, totalSeconds: 0, revenue: 0 };
      }
      pcUsageMap[b.id_komputer].count += 1;
      pcUsageMap[b.id_komputer].totalSeconds += b.durasi_detik;
      pcUsageMap[b.id_komputer].revenue += p.total_tagihan;
    }
  });

  const sortedPcUsage = Object.entries(pcUsageMap)
    .map(([pcIdStr, stats]) => {
      const pc = komputer.find(k => k.id_komputer === Number(pcIdStr));
      return {
        pcId: Number(pcIdStr),
        pcNomor: pc ? pc.nomor_komputer : `PC-${pcIdStr}`,
        pcNama: pc ? pc.nama_komputer : 'Komputer',
        ...stats,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Export CSV Handler
  const handleExportCsv = () => {
    const filename = `laporan-billing-warnet-${startDate || 'all'}-sd-${endDate || 'all'}.csv`;
    const headers = [
      'No. Transaksi',
      'Tanggal & Jam Bayar',
      'Pelanggan',
      'Komputer',
      'Durasi (Detik)',
      'Durasi Format',
      'Total Biaya (IDR)',
      'Metode Pembayaran',
      'Status',
    ];

    const rows = filteredPembayaran.map(p => {
      const b = billing.find(item => item.id_billing === p.id_billing);
      const pc = b ? komputer.find(k => k.id_komputer === b.id_komputer) : null;
      const cust = b ? pelanggan.find(c => c.id_pelanggan === b.id_pelanggan) : null;

      return [
        p.nomor_transaksi,
        p.waktu_bayar,
        cust ? cust.nama : 'Pelanggan',
        pc ? pc.nomor_komputer : '-',
        b ? b.durasi_detik : 0,
        b ? formatDuration(b.durasi_detik) : '00:00:00',
        p.total_tagihan,
        p.metode_pembayaran.toUpperCase(),
        p.status_pembayaran.toUpperCase(),
      ];
    });

    downloadCsv(filename, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Laporan Pendapatan & Kinerja Warnet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis omset harian, mingguan, bulanan, statistik pemakaian station PC, dan fitur riset mulai dari awal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Riset Semua Laporan Menjadi Nol */}
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Riset seluruh transaksi & laporan menjadi 0 untuk memulai dari awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Riset Semua ke 0 (Mulai dari Awal)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Banner Notifikasi Riset Berhasil */}
      {resetSuccessBanner && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Semua Data Laporan & Transaksi Berhasil Diriset ke 0!</p>
              <p className="text-[11px] text-emerald-300/80">
                Operasional warnet sekarang siap dimulai dari awal (fresh start). Seluruh pendapatan, transaksi kasir, dan ranking komputer telah bersih nol.
              </p>
            </div>
          </div>
          <button
            onClick={() => setResetSuccessBanner(false)}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Date Filter & Presets */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                preset === 'today' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => handlePresetChange('week')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                preset === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => handlePresetChange('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                preset === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPreset('custom')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                preset === 'custom' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kustom
            </button>
          </div>

          {/* Date Picker Inputs */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setPreset('custom');
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-hidden focus:border-blue-500 font-mono"
            />
            <span className="text-slate-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setPreset('custom');
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Omset */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Pendapatan (Omset)
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
              {formatRupiah(totalOmset)}
            </span>
            <span className="text-[11px] text-slate-500">Dari periode yang difilter</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Jumlah Transaksi
            </span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
              {totalTransaksi}{' '}
              <span className="text-xs font-normal text-slate-400">transaksi</span>
            </span>
            <span className="text-[11px] text-slate-500">Selesai terbayar</span>
          </div>
        </div>

        {/* Total Durasi Penggunaan */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Durasi Penggunaan
            </span>
            <span className="text-2xl font-bold font-mono text-cyan-400 mt-0.5 block">
              {formatDuration(totalDurasiDetik)}
            </span>
            <span className="text-[11px] text-slate-500">
              ≈ {(totalDurasiDetik / 3600).toFixed(1)} Jam operasional
            </span>
          </div>
        </div>
      </div>

      {/* Komputer Paling Sering Digunakan (Ranking Usage) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Komputer Paling Sering Digunakan (Top Station PC)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Diurutkan berdasarkan total pendapatan</span>
        </div>

        {sortedPcUsage.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Belum ada transaksi di periode tanggal yang dipilih.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedPcUsage.map((item, index) => {
              const maxRev = sortedPcUsage[0].revenue || 1;
              const percent = Math.min(100, Math.round((item.revenue / maxRev) * 100));

              return (
                <div key={item.pcId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-mono text-slate-500 font-bold">#{index + 1}</span>
                      <span className="font-bold text-white font-mono">{item.pcNomor}</span>
                      <span className="text-slate-400 text-[11px]">({item.pcNama})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">{item.count} sesi</span>
                      <span className="text-cyan-400 font-mono text-[11px]">
                        {formatDuration(item.totalSeconds)}
                      </span>
                      <span className="font-bold font-mono text-emerald-400 text-xs">
                        {formatRupiah(item.revenue)}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar visual */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rincian Transaksi Periode */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-sm text-white mb-3">Rincian Transaksi Sesi Billing</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3 py-2.5">No. Trx</th>
                <th className="px-3 py-2.5">Tanggal</th>
                <th className="px-3 py-2.5">Pelanggan</th>
                <th className="px-3 py-2.5">Unit PC</th>
                <th className="px-3 py-2.5">Durasi</th>
                <th className="px-3 py-2.5 text-right">Biaya</th>
                <th className="px-3 py-2.5 text-center">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPembayaran.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredPembayaran.map(p => {
                  const b = billing.find(item => item.id_billing === p.id_billing);
                  const pc = b ? komputer.find(k => k.id_komputer === b.id_komputer) : null;
                  const cust = b ? pelanggan.find(c => c.id_pelanggan === b.id_pelanggan) : null;

                  return (
                    <tr key={p.id_pembayaran} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-mono text-white font-bold">{p.nomor_transaksi}</td>
                      <td className="px-3 py-2 text-slate-400">{formatDateTime(p.waktu_bayar)}</td>
                      <td className="px-3 py-2 text-slate-200">{cust?.nama || 'Pelanggan'}</td>
                      <td className="px-3 py-2 font-mono text-blue-400 font-bold">{pc?.nomor_komputer || '-'}</td>
                      <td className="px-3 py-2 font-mono text-cyan-400">
                        {b ? formatDuration(b.durasi_detik) : '00:00:00'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(p.total_tagihan)}
                      </td>
                      <td className="px-3 py-2 text-center uppercase font-semibold text-[10px] text-slate-300">
                        {p.metode_pembayaran}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Konfirmasi Riset Semua Laporan ke 0 */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 ring-4 ring-rose-500/10">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Riset Semua Laporan ke Nol?</h3>
                <p className="text-xs text-rose-300">Aplikasi NetBilling akan dimulai dari awal (0)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan <strong>mengosongkan seluruh riwayat transaksi</strong>, sesi billing, dan riwayat tutup buku. Seluruh laporan pendapatan, durasi operasional, dan grafik pemakaian komputer akan menjadi <strong>Rp 0 (bersih dari awal)</strong>.
            </p>

            <div className="my-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Omset Saat Ini:</span>
                <span className="font-mono text-emerald-400 font-bold">{formatRupiah(totalOmset)} ➔ Rp 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Transaksi Saat Ini:</span>
                <span className="font-mono text-white font-bold">{totalTransaksi} ➔ 0 trx</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Station PC:</span>
                <span className="text-cyan-400 font-semibold">Semua Standby Tersedia</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Riset Semua ke 0</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
