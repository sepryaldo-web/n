import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDuration, formatDateTime } from '../utils/format';
import { MetodePembayaran, Pembayaran } from '../types';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  Receipt,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    paymentModalOpen,
    setPaymentModalOpen,
    activePaymentBillingId,
    billing,
    komputer,
    pelanggan,
    paket,
    processPayment,
    openReceiptModal,
  } = useApp();

  const [metode, setMetode] = useState<MetodePembayaran>('tunai');
  const [bayarNominal, setBayarNominal] = useState<number>(0);
  const [customInputStr, setCustomInputStr] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Completed payment state inside modal for immediate receipt trigger
  const [successPayment, setSuccessPayment] = useState<Pembayaran | null>(null);

  const activeBilling = billing.find(b => b.id_billing === activePaymentBillingId);
  const activePc = activeBilling ? komputer.find(k => k.id_komputer === activeBilling.id_komputer) : null;
  const activeCust = activeBilling ? pelanggan.find(p => p.id_pelanggan === activeBilling.id_pelanggan) : null;
  const activePaket = activeBilling && activeBilling.id_paket ? paket.find(p => p.id_paket === activeBilling.id_paket) : null;

  const totalTagihan = activeBilling ? activeBilling.total_biaya : 0;
  const kembalian = Math.max(0, bayarNominal - totalTagihan);
  const isBayarKurang = metode === 'tunai' && bayarNominal < totalTagihan;

  useEffect(() => {
    if (paymentModalOpen && activeBilling) {
      setMetode('tunai');
      setBayarNominal(activeBilling.total_biaya);
      setCustomInputStr(String(activeBilling.total_biaya));
      setCatatan('');
      setSuccessPayment(null);
    }
  }, [paymentModalOpen, activeBilling]);

  if (!paymentModalOpen || !activeBilling) return null;

  const handleNominalChange = (value: number) => {
    setBayarNominal(value);
    setCustomInputStr(String(value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = Number(raw) || 0;
    setCustomInputStr(raw);
    setBayarNominal(num);
  };

  const handleCopyAccount = (acc: string, bank: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBilling) return;

    if (metode === 'tunai' && bayarNominal < totalTagihan) {
      alert('Pembayaran tunai tidak boleh kurang dari total tagihan!');
      return;
    }

    const nominalFinal = metode === 'tunai' ? bayarNominal : totalTagihan;
    const payment = processPayment(activeBilling.id_billing, nominalFinal, metode, catatan);

    if (payment) {
      setSuccessPayment(payment);
    }
  };

  const handleViewReceipt = () => {
    if (successPayment) {
      setPaymentModalOpen(false);
      openReceiptModal(successPayment.id_pembayaran);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Kasir Pembayaran Sesi Billing</h2>
              <p className="text-xs text-slate-400">Penyelesaian billing & cetak bukti transaksi</p>
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jika Pembayaran Berhasil: Tampilkan Dialog Sukses & Cetak Struk */}
        {successPayment ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pembayaran Berhasil!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaksi telah disimpan dengan status <span className="text-emerald-400 font-semibold uppercase">LUNAS</span>
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg max-w-md mx-auto text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">No. Transaksi:</span>
                <span className="font-mono font-semibold text-slate-200">{successPayment.nomor_transaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tagihan:</span>
                <span className="font-mono font-bold text-slate-200">{formatRupiah(successPayment.total_tagihan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode:</span>
                <span className="uppercase font-semibold text-blue-400">{successPayment.metode_pembayaran}</span>
              </div>
              {successPayment.metode_pembayaran === 'tunai' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah Uang:</span>
                    <span className="font-mono text-slate-300">{formatRupiah(successPayment.jumlah_bayar)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                    <span className="text-emerald-400">Kembalian:</span>
                    <span className="font-mono text-emerald-400">{formatRupiah(successPayment.kembalian)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Selesai / Tutup
              </button>
              <button
                type="button"
                onClick={handleViewReceipt}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                Cetak Struk Kasir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Rincian Pemakaian Komputer */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Komputer:</span>
                  <span className="font-bold text-white text-sm">
                    {activePc ? `${activePc.nomor_komputer} - ${activePc.nama_komputer}` : 'PC-??'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pelanggan:</span>
                  <span className="font-bold text-white text-sm">
                    {activeCust ? activeCust.nama : 'Pelanggan'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500 block">Waktu Mulai</span>
                  <span className="font-mono">{formatDateTime(activeBilling.waktu_mulai).split(', ')[1] || activeBilling.waktu_mulai.slice(11, 19)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Waktu Selesai</span>
                  <span className="font-mono">
                    {activeBilling.waktu_selesai
                      ? formatDateTime(activeBilling.waktu_selesai).split(', ')[1]
                      : 'Baru saja'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Durasi Pemakaian</span>
                  <span className="font-mono font-bold text-blue-400">
                    {formatDuration(activeBilling.durasi_detik)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">
                  {activePaket ? `Paket: ${activePaket.nama_paket}` : 'Tarif Reguler / Jam'}
                </span>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Tagihan</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {formatRupiah(totalTagihan)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Metode Pembayaran */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetode('tunai')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                    metode === 'tunai'
                      ? 'border-emerald-500 bg-emerald-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1 text-emerald-400" />
                  <span className="text-xs font-bold">Tunai</span>
                  <span className="text-[10px] text-slate-500">Uang Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetode('transfer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                    metode === 'transfer'
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-blue-400" />
                  <span className="text-xs font-bold">Transfer Bank</span>
                  <span className="text-[10px] text-slate-500">BCA / Mandiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetode('qris')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                    metode === 'qris'
                      ? 'border-cyan-500 bg-cyan-950/40 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1 text-cyan-400" />
                  <span className="text-xs font-bold">QRIS Instant</span>
                  <span className="text-[10px] text-slate-500">Gopay/Ovo/Dana</span>
                </button>
              </div>
            </div>

            {/* Konten Spesifik Metode: TUNAI */}
            {metode === 'tunai' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Jumlah Uang Diterima:</label>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {formatRupiah(bayarNominal)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500">Rp</span>
                    <input
                      type="text"
                      value={customInputStr}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                      placeholder="Masukkan nominal uang cash"
                    />
                  </div>
                </div>

                {/* Tombol Cepat Pecahan Uang */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNominalChange(totalTagihan)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium text-slate-200"
                  >
                    Uang Pas ({formatRupiah(totalTagihan)})
                  </button>
                  {[5000, 10000, 20000, 50000, 100000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleNominalChange(amt)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-mono text-slate-300"
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>

                {/* Kalkulasi Kembalian */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Uang Kembalian:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      isBayarKurang ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {isBayarKurang ? 'Uang Kurang!' : formatRupiah(kembalian)}
                  </span>
                </div>

                {isBayarKurang && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Jumlah pembayaran tidak boleh kurang dari total tagihan!</span>
                  </div>
                )}
              </div>
            )}

            {/* Konten Spesifik Metode: TRANSFER */}
            {metode === 'transfer' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                <p className="text-xs font-semibold text-slate-300">Pilihan Rekening Tujuan Transfer:</p>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-400 block">Bank BCA</span>
                      <span className="font-mono text-xs text-white">8720-1928-31</span>
                      <span className="text-[10px] text-slate-400 block">a/n NetBilling Warnet Indo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('8720192831', 'BCA')}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedBank === 'BCA' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 block">Bank Mandiri</span>
                      <span className="font-mono text-xs text-white">137-00-192831-2</span>
                      <span className="text-[10px] text-slate-400 block">a/n NetBilling Warnet Indo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount('137001928312', 'Mandiri')}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedBank === 'Mandiri' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Pastikan bukti transfer sudah dicek di mutasi rekening.
                </div>
              </div>
            )}

            {/* Konten Spesifik Metode: QRIS */}
            {metode === 'qris' && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-center text-center">
                <div className="bg-white p-3 rounded-lg shadow-md max-w-[180px] mb-2">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-36 h-36 mx-auto text-black fill-current"
                  >
                    {/* SVG QR Pattern Simulation */}
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="28" height="28" fill="black" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="black" />
                    {/* Corner 2 */}
                    <rect x="67" y="5" width="28" height="28" fill="black" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="black" />
                    {/* Corner 3 */}
                    <rect x="5" y="67" width="28" height="28" fill="black" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="black" />
                    {/* Data dots */}
                    <rect x="38" y="8" width="8" height="8" fill="black" />
                    <rect x="50" y="12" width="6" height="6" fill="black" />
                    <rect x="42" y="24" width="10" height="6" fill="black" />
                    <rect x="8" y="38" width="6" height="10" fill="black" />
                    <rect x="18" y="44" width="8" height="8" fill="black" />
                    <rect x="38" y="38" width="24" height="24" fill="black" />
                    <rect x="44" y="44" width="12" height="12" fill="white" />
                    <rect x="47" y="47" width="6" height="6" fill="black" />
                    <rect x="68" y="38" width="8" height="6" fill="black" />
                    <rect x="82" y="42" width="10" height="6" fill="black" />
                    <rect x="38" y="68" width="10" height="8" fill="black" />
                    <rect x="54" y="74" width="8" height="6" fill="black" />
                    <rect x="72" y="68" width="18" height="8" fill="black" />
                    <rect x="68" y="82" width="8" height="10" fill="black" />
                    <rect x="82" y="84" width="10" height="8" fill="black" />
                  </svg>
                  <p className="text-[10px] font-bold tracking-wider text-slate-800 uppercase mt-1">
                    QRIS STATIS / DINAMIS
                  </p>
                </div>
                <p className="text-xs font-bold text-white">WARNET NETBILLING INDONESIA</p>
                <p className="text-[11px] text-slate-400 mt-0.5">NMID: ID1020268892182</p>
                <div className="mt-2 py-1 px-3 bg-cyan-950/60 border border-cyan-800/60 rounded-full text-xs font-mono font-bold text-cyan-300">
                  Nominal: {formatRupiah(totalTagihan)}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Scan menggunakan GoPay, OVO, Dana, ShopeePay, BCA Mobile, atau Livin'
                </p>
              </div>
            )}

            {/* Catatan Kasir */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Catatan Kasir (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Tambah es teh manis / uang pas"
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Batal / Tunda
              </button>
              <button
                type="submit"
                disabled={isBayarKurang}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                  isBayarKurang
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Konfirmasi & Bayar Lunas
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
