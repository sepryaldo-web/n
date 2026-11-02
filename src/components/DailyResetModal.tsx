import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateTime } from '../utils/format';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Wallet,
  Receipt,
  History,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const DailyResetModal: React.FC = () => {
  const {
    dailyResetModalOpen,
    setDailyResetModalOpen,
    pembayaran,
    currentUser,
    resetHarian,
    tutupBukuHistory,
    setActiveTab,
  } = useApp();

  const [catatan, setCatatan] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<{ omset: number; count: number } | null>(null);

  if (!dailyResetModalOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const trxToday = pembayaran.filter(p => p.waktu_bayar.startsWith(todayStr));
  const omsetToday = trxToday.reduce((sum, p) => sum + p.total_tagihan, 0);
  const countToday = trxToday.length;

  const handleDoReset = () => {
    const res = resetHarian(catatan);
    setResetSuccess(res);
  };

  const handleClose = () => {
    setResetSuccess(null);
    setCatatan('');
    setDailyResetModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Riset Harian & Tutup Buku Kasir</h2>
              <p className="text-xs text-slate-400">Rekapitulasi shift, pembukuan kasir & reset transaksi hari ini</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resetSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Riset Harian Berhasil!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Buku kasir hari ini telah berhasil ditutup dan diarsipkan.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5 max-w-sm mx-auto text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Omset Diarsipkan:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatRupiah(resetSuccess.omset)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Transaksi:</span>
                <span className="font-mono font-semibold text-white">
                  {resetSuccess.count} transaksi
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Kasir Sekarang:</span>
                <span className="text-cyan-400 font-semibold">Siap untuk Hari / Shift Baru</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Warning Card */}
            <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg flex items-start gap-2.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-white">Informasi Tutup Buku Harian</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Fitur ini digunakan saat pergantian shift kasir atau tutup warnet harian. Omset dan jumlah transaksi hari ini akan diarsipkan ke riwayat pembukuan dan kasir siap untuk transaksi berikutnya.
                </p>
              </div>
            </div>

            {/* Rekap Hari Ini */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Omset Kasir Hari Ini</span>
                </div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {formatRupiah(omsetToday)}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jumlah Transaksi</span>
                </div>
                <div className="text-base font-bold font-mono text-white">
                  {countToday} <span className="text-xs font-normal text-slate-400">transaksi</span>
                </div>
              </div>
            </div>

            {/* Link Terhubung ke Menu Transaksi & Pelanggan */}
            <div className="flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-lg">
              <span className="text-[11px] text-slate-400">Pintas Terhubung:</span>
              <button
                type="button"
                onClick={() => {
                  setDailyResetModalOpen(false);
                  setActiveTab('transaksi');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-medium transition-colors"
              >
                Lihat Transaksi Kasir
              </button>
              <button
                type="button"
                onClick={() => {
                  setDailyResetModalOpen(false);
                  setActiveTab('pelanggan');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[11px] font-medium transition-colors"
              >
                Lihat Data Pelanggan
              </button>
            </div>

            {/* Operator info */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Kasir Bertugas:</span>
              </div>
              <span className="font-bold text-white">{currentUser?.nama_lengkap || 'Operator'}</span>
            </div>

            {/* Catatan Tutup Buku */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Catatan Shift / Tutup Buku (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                placeholder="Contoh: Shift 1 selesai, uang fisik di laci pas Rp 150.000..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 text-xs"
              />
            </div>

            {/* Riwayat Tutup Buku Sebelumnya */}
            {tutupBukuHistory.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 mb-2 font-semibold">
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  <span>Riwayat Tutup Buku Terakhir:</span>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {tutupBukuHistory.slice(0, 3).map(rec => (
                    <div
                      key={rec.id}
                      className="p-2 bg-slate-950/80 border border-slate-800 rounded flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-mono text-slate-300">{formatDateTime(rec.waktu_reset)}</span>
                        <span className="text-slate-500 block text-[10px]">Oleh: {rec.operator_nama}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400">
                          {formatRupiah(rec.total_omset)}
                        </span>
                        <span className="text-slate-500 block text-[10px]">{rec.total_transaksi} trx</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDoReset}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Lakukan Riset Harian</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
