import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration } from '../utils/format';
import { Komputer, Billing } from '../types';
import {
  Monitor,
  Play,
  Square,
  Info,
  Clock,
  User,
  Package,
  Wrench,
  CheckCircle,
  Filter,
  PlusCircle,
  AlertTriangle,
  Hourglass,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const {
    komputer,
    pelanggan,
    paket,
    billing,
    openStartModal,
    stopBilling,
    updateKomputer,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailModalPc, setDetailModalPc] = useState<{ pc: Komputer; activeBilling?: Billing } | null>(null);

  // Filter computers
  const filteredKomputer = komputer.filter(pc => {
    if (filterStatus === 'all') return true;
    return pc.status === filterStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            <span>Live Station Billing Komputer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time status komputer, timer stopwatch pemakaian, sisa waktu paket/manual, dan biaya otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({komputer.length})
            </button>
            <button
              onClick={() => setFilterStatus('tersedia')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'tersedia'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tersedia ({komputer.filter(k => k.status === 'tersedia').length})
            </button>
            <button
              onClick={() => setFilterStatus('digunakan')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'digunakan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Digunakan ({komputer.filter(k => k.status === 'digunakan').length})
            </button>
            <button
              onClick={() => setFilterStatus('maintenance')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === 'maintenance'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maintenance ({komputer.filter(k => k.status === 'maintenance').length})
            </button>
          </div>

          <button
            onClick={() => openStartModal()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Billing</span>
          </button>
        </div>
      </div>

      {/* Grid Komputer Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredKomputer.map(pc => {
          const activeBilling = billing.find(
            b => b.id_komputer === pc.id_komputer && b.status_billing === 'aktif'
          );

          const cust = activeBilling
            ? pelanggan.find(p => p.id_pelanggan === activeBilling.id_pelanggan)
            : null;

          const isDigunakan = pc.status === 'digunakan' && activeBilling;
          const isTersedia = pc.status === 'tersedia';
          const isMaintenance = pc.status === 'maintenance';

          // Countdown calculation if has target duration
          let remainingSeconds: number | null = null;
          let isTimeUp = false;
          if (activeBilling && activeBilling.durasi_target_menit) {
            const targetSec = activeBilling.durasi_target_menit * 60;
            remainingSeconds = Math.max(0, targetSec - activeBilling.durasi_detik);
            if (activeBilling.durasi_detik >= targetSec) {
              isTimeUp = true;
            }
          }

          return (
            <div
              key={pc.id_komputer}
              className={`rounded-xl border p-4.5 flex flex-col justify-between transition-all duration-200 ${
                isDigunakan
                  ? isTimeUp
                    ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30'
                    : 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                  : isTersedia
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/60 border-rose-900/40 opacity-75'
              }`}
            >
              <div>
                {/* Header Kartu PC */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono text-white tracking-wide">
                      {pc.nomor_komputer}
                    </span>
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                      {pc.nama_komputer}
                    </span>
                  </div>

                  {/* Badge Status */}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isDigunakan
                        ? isTimeUp
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                        : isTersedia
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {isDigunakan && isTimeUp ? 'WAKTU HABIS' : pc.status}
                  </span>
                </div>

                {/* Spesifikasi Ringkas */}
                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-1" title={pc.spesifikasi}>
                  {pc.spesifikasi}
                </p>

                {/* KONDISI 1: JIKA TERSEDIA */}
                {isTersedia && (
                  <div className="my-5 py-4 px-3 bg-slate-950/60 border border-slate-800/60 rounded-lg text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                      Tarif Pemakaian
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {formatRupiah(pc.tarif_per_jam)}
                      <span className="text-xs font-normal text-slate-400"> / jam</span>
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Komputer standby & siap digunakan</p>
                  </div>
                )}

                {/* KONDISI 2: JIKA SEDANG DIGUNAKAN (LIVE TICKING TIMER & RUNNING COST) */}
                {isDigunakan && (
                  <div className="my-3 space-y-2.5">
                    {/* Info Pelanggan & Paket */}
                    <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          Pelanggan:
                        </span>
                        <span className="font-bold text-white text-xs">{cust?.nama || 'Pengguna'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          Skema:
                        </span>
                        <span className="font-medium text-amber-300 text-xs truncate max-w-[130px]">
                          {activeBilling.nama_skema || 'Tarif Reguler'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Mulai:
                        </span>
                        <span className="font-mono text-slate-300 text-xs">
                          {new Date(activeBilling.waktu_mulai).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Timer Digital & Biaya Sementara */}
                    <div className="p-3 bg-slate-950 border border-amber-500/20 rounded-lg text-center shadow-inner">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                        <span>Durasi Berjalan:</span>
                        {remainingSeconds !== null && (
                          <span className={isTimeUp ? 'text-red-400 font-bold' : 'text-amber-300'}>
                            {isTimeUp ? 'Overtime' : `Sisa: ${formatDuration(remainingSeconds)}`}
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold font-mono tracking-widest text-cyan-400 tabular-nums">
                        {formatDuration(activeBilling.durasi_detik)}
                      </div>
                      <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Total Biaya:</span>
                        <span className="font-bold font-mono text-emerald-400 text-sm">
                          {formatRupiah(activeBilling.total_biaya)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* KONDISI 3: JIKA MAINTENANCE */}
                {isMaintenance && (
                  <div className="my-5 py-4 px-3 bg-rose-950/20 border border-rose-900/30 rounded-lg text-center">
                    <Wrench className="w-6 h-6 text-rose-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-rose-400 block">Unit Dalam Perbaikan</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tidak dapat digunakan hingga selesai servis teknisi.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Sesuai State */}
              <div className="pt-3 border-t border-slate-800/80 mt-2">
                {isTersedia && (
                  <button
                    type="button"
                    onClick={() => openStartModal(pc.id_komputer)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai Billing</span>
                  </button>
                )}

                {isDigunakan && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalPc({ pc, activeBilling })}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      title="Lihat Rincian Sesi Ini"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => stopBilling(activeBilling.id_billing)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Billing</span>
                    </button>
                  </div>
                )}

                {isMaintenance && (
                  <button
                    type="button"
                    onClick={() => updateKomputer(pc.id_komputer, { status: 'tersedia' })}
                    className="w-full py-2 bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-400 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Selesaikan Servis & Aktifkan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail Sesi Komputer */}
      {detailModalPc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Detail Sesi {detailModalPc.pc.nomor_komputer}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{detailModalPc.pc.spesifikasi}</p>

            {detailModalPc.activeBilling && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kode Billing:</span>
                  <span className="font-mono text-white">{detailModalPc.activeBilling.kode_billing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Skema / Paket:</span>
                  <span className="text-amber-300 font-semibold">
                    {detailModalPc.activeBilling.nama_skema || 'Reguler'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Mulai:</span>
                  <span className="font-mono text-white">
                    {new Date(detailModalPc.activeBilling.waktu_mulai).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Durasi Berjalan:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {formatDuration(detailModalPc.activeBilling.durasi_detik)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Biaya:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {formatRupiah(detailModalPc.activeBilling.total_biaya)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDetailModalPc(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
              {detailModalPc.activeBilling && (
                <button
                  onClick={() => {
                    const id = detailModalPc.activeBilling!.id_billing;
                    setDetailModalPc(null);
                    stopBilling(id);
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop & Bayar Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
