import React from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration, formatDateTime } from '../utils/format';
import { X, Printer, CheckCircle } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const {
    receiptModalOpen,
    setReceiptModalOpen,
    activeReceiptPembayaranId,
    pembayaran,
    billing,
    komputer,
    pelanggan,
    paket,
    users,
  } = useApp();

  if (!receiptModalOpen || !activeReceiptPembayaranId) return null;

  const currentPembayaran = pembayaran.find(p => p.id_pembayaran === activeReceiptPembayaranId);
  if (!currentPembayaran) return null;

  const currentBilling = billing.find(b => b.id_billing === currentPembayaran.id_billing);
  const currentPc = currentBilling ? komputer.find(k => k.id_komputer === currentBilling.id_komputer) : null;
  const currentCust = currentBilling ? pelanggan.find(p => p.id_pelanggan === currentBilling.id_pelanggan) : null;
  const currentPaket = currentBilling && currentBilling.id_paket ? paket.find(p => p.id_paket === currentBilling.id_paket) : null;
  const currentOperator = users.find(u => u.id_user === currentPembayaran.id_operator);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Struk Kasir Warnet</h2>
          </div>
          <button
            onClick={() => setReceiptModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Thermal Receipt Container */}
        <div className="my-4 bg-white text-slate-900 p-6 rounded-lg shadow-lg font-mono text-xs select-all print-receipt-area">
          {/* Header Toko */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
            <h1 className="font-extrabold text-sm tracking-wider uppercase">NETBILLING WARNET</h1>
            <p className="text-[11px] text-slate-600">Jl. Mahasiswa No. 88, Kota Teknologi</p>
            <p className="text-[10px] text-slate-500">Telp/WA: 0812-3456-7890</p>
          </div>

          {/* Info Transaksi */}
          <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">No. Trx:</span>
              <span className="font-bold">{currentPembayaran.nomor_transaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tanggal:</span>
              <span>{formatDateTime(currentPembayaran.waktu_bayar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Kasir:</span>
              <span>{currentOperator ? currentOperator.nama_lengkap : 'Operator Kasir'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pelanggan:</span>
              <span className="font-bold">{currentCust ? currentCust.nama : 'Pelanggan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Unit PC:</span>
              <span className="font-bold">{currentPc ? currentPc.nomor_komputer : 'PC-??'}</span>
            </div>
          </div>

          {/* Rincian Billing */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 mb-3 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>{currentPaket ? currentPaket.nama_paket : 'Pemakaian Reguler'}</span>
              <span>{formatRupiah(currentPembayaran.total_tagihan)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>Durasi: {currentBilling ? formatDuration(currentBilling.durasi_detik) : '00:00:00'}</span>
              <span>
                {currentBilling?.waktu_mulai ? formatDateTime(currentBilling.waktu_mulai).split(', ')[1] : ''} -{' '}
                {currentBilling?.waktu_selesai ? formatDateTime(currentBilling.waktu_selesai).split(', ')[1] : ''}
              </span>
            </div>
          </div>

          {/* Perhitungan Pembayaran */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-between font-bold text-xs">
              <span>TOTAL TAGIHAN:</span>
              <span>{formatRupiah(currentPembayaran.total_tagihan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">
                BAYAR ({currentPembayaran.metode_pembayaran.toUpperCase()}):
              </span>
              <span>{formatRupiah(currentPembayaran.jumlah_bayar)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>KEMBALIAN:</span>
              <span>{formatRupiah(currentPembayaran.kembalian)}</span>
            </div>
          </div>

          {/* Status LUNAS Badge */}
          <div className="text-center py-2">
            <div className="inline-block border border-slate-800 px-3 py-1 font-extrabold tracking-widest text-xs uppercase">
              *** LUNAS ***
            </div>
          </div>

          {/* Footer Struk */}
          <div className="text-center text-[10px] text-slate-500 pt-2 space-y-0.5">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Simpan struk ini sebagai bukti pembayaran sah.</p>
            <p className="pt-1 text-[9px]">Sistem Informasi Billing Warnet v1.0</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 no-print">
          <button
            type="button"
            onClick={() => setReceiptModalOpen(false)}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk (Print)
          </button>
        </div>
      </div>
    </div>
  );
};
