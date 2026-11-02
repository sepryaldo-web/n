import React from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration } from '../utils/format';
import {
  Monitor,
  CheckCircle2,
  PlayCircle,
  Wrench,
  Receipt,
  Wallet,
  Users,
  Timer,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Square,
  RotateCcw,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    komputer,
    pelanggan,
    billing,
    pembayaran,
    openStartModal,
    stopBilling,
    setActiveTab,
    setDailyResetModalOpen,
  } = useApp();

  // Statistics calculation
  const totalPc = komputer.length;
  const pcTersedia = komputer.filter(k => k.status === 'tersedia').length;
  const pcDigunakan = komputer.filter(k => k.status === 'digunakan').length;
  const pcMaintenance = komputer.filter(k => k.status === 'maintenance').length;
  const totalPelanggan = pelanggan.length;

  // Transaksi hari ini (Local Date)
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const trxToday = pembayaran.filter(p => p.waktu_bayar.startsWith(todayDateStr));
  const countTrxToday = trxToday.length;
  const incomeToday = trxToday.reduce((acc, curr) => acc + curr.total_tagihan, 0);

  // Active Billing
  const activeBillings = billing.filter(b => b.status_billing === 'aktif');

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Panel Kasir & Billing Warnet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Status operasional real-time, monitoring sesi rental komputer, dan pendapatan kasir.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDailyResetModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Riset Harian & Tutup Shift</span>
          </button>
          <button
            type="button"
            onClick={() => openStartModal()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Billing Baru</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Statistik (7 Metrik Utama Sesuai Spesifikasi) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Total Komputer */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total PC</span>
            <Monitor className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalPc}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Unit Terdaftar</span>
          </div>
        </div>

        {/* PC Tersedia */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PC Tersedia</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{pcTersedia}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Siap Digunakan</span>
          </div>
        </div>

        {/* PC Digunakan */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PC Digunakan</span>
            <PlayCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{pcDigunakan}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Sesi Berjalan</span>
          </div>
        </div>

        {/* PC Maintenance */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Maintenance</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{pcMaintenance}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Perbaikan Unit</span>
          </div>
        </div>

        {/* Transaksi Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Trx Hari Ini</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{countTrxToday}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Selesai Bayar</span>
          </div>
        </div>

        {/* Pendapatan Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Omset Hari Ini</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold font-mono text-emerald-400 truncate block">
              {formatRupiah(incomeToday)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Kasir Lunas</span>
          </div>
        </div>

        {/* Jumlah Pelanggan */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pelanggan</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">{totalPelanggan}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Member Terdaftar</span>
          </div>
        </div>
      </div>

      {/* Sesi Billing Berjalan & Status Ringkas PC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Sesi Billing yang Sedang Berjalan */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Sesi Billing Sedang Berjalan</h3>
              <span className="text-[11px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                {activeBillings.length} Aktif
              </span>
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              Lihat Grid Billing <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeBillings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>Tidak ada sesi billing yang sedang aktif saat ini.</p>
              <button
                onClick={() => openStartModal()}
                className="mt-3 text-blue-400 hover:underline font-medium"
              >
                + Mulai Billing Sekarang
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800 mt-3">
              {activeBillings.map(b => {
                const pc = komputer.find(k => k.id_komputer === b.id_komputer);
                const cust = pelanggan.find(p => p.id_pelanggan === b.id_pelanggan);
                return (
                  <div
                    key={b.id_billing}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-sm text-amber-400 font-mono">
                        {pc ? pc.nomor_komputer : 'PC'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">
                            {cust ? cust.nama : 'Pelanggan'}
                          </span>
                          <span className="text-[10px] text-slate-400">({pc?.nama_komputer})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Mulai: {new Date(b.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>&bull;</span>
                          <span className="text-amber-300 font-mono">
                            Durasi: {formatDuration(b.durasi_detik)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 block">Biaya Berjalan</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {formatRupiah(b.total_biaya)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => stopBilling(b.id_billing)}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop & Bayar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Status Unit Komputer Cepat */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>Denah Station PC</span>
              </h3>
              <span className="text-xs text-slate-500">{totalPc} Station</span>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-4">
              {komputer.map(pc => {
                let colorClass = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400';
                if (pc.status === 'digunakan') {
                  colorClass = 'bg-amber-950/40 border-amber-500/40 text-amber-400 animate-pulse';
                } else if (pc.status === 'maintenance') {
                  colorClass = 'bg-rose-950/40 border-rose-500/40 text-rose-400 opacity-60';
                }

                return (
                  <button
                    key={pc.id_komputer}
                    onClick={() => {
                      if (pc.status === 'tersedia') {
                        openStartModal(pc.id_komputer);
                      } else {
                        setActiveTab('billing');
                      }
                    }}
                    title={`${pc.nomor_komputer} - ${pc.nama_komputer} (${pc.status.toUpperCase()})`}
                    className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${colorClass}`}
                  >
                    <span className="text-xs font-bold font-mono">{pc.nomor_komputer.replace('PC-', '')}</span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5 truncate max-w-full">
                      {pc.status === 'tersedia' ? 'Free' : pc.status === 'digunakan' ? 'Busy' : 'Maint'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-around text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Digunakan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('transaksi')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg text-center transition-colors"
            >
              Lihat Riwayat Transaksi Hari Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
