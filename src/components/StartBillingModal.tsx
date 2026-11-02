import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/format';
import { X, Monitor, Clock, Plus, Check, Sliders, Sparkles } from 'lucide-react';

export const StartBillingModal: React.FC = () => {
  const {
    startModalOpen,
    setStartModalOpen,
    startModalPcId,
    komputer,
    pelanggan,
    startBilling,
    addPelanggan,
  } = useApp();

  const [selectedPcId, setSelectedPcId] = useState<number>(0);
  const [selectedPelangganId, setSelectedPelangganId] = useState<number>(0);

  // Billing Mode Selection: 'preset' | 'manual' | 'normal'
  const [billingMode, setBillingMode] = useState<'preset' | 'manual' | 'normal'>('preset');

  // Preset option: '30m' | '1h' | '2h' | '3h' | '5h' | '8h'
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('30m');

  // Manual configuration inputs
  const [manualDurationType, setManualDurationType] = useState<'menit' | 'jam'>('menit');
  const [manualDurationVal, setManualDurationVal] = useState<number>(30);
  const [manualPriceVal, setManualPriceVal] = useState<number>(2000);
  const [isPriceCustomized, setIsPriceCustomized] = useState<boolean>(false);

  // Quick add customer toggle (tanpa nomor whatsapp/hp)
  const [showQuickCust, setShowQuickCust] = useState<boolean>(false);
  const [newCustNama, setNewCustNama] = useState<string>('');
  const [newCustUsername, setNewCustUsername] = useState<string>('');

  const availablePcs = komputer.filter(k => k.status === 'tersedia');
  const currentPc = komputer.find(k => k.id_komputer === selectedPcId);
  const currentRate = currentPc ? currentPc.tarif_per_jam : 5000;

  // Preset list dihitung secara KETAT & TRANSPARAN mengikuti tarif/jam komputer yang dipilih di menu komputer
  const getPresetsForRate = (rate: number) => [
    {
      key: '30m',
      nama: '30 Menit',
      menit: 30,
      harga: Math.round((30 / 60) * rate),
      desc: `(30/60) × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '1h',
      nama: '1 Jam',
      menit: 60,
      harga: 1 * rate,
      desc: `1 jam × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '2h',
      nama: '2 Jam',
      menit: 120,
      harga: 2 * rate,
      desc: `2 jam × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '3h',
      nama: '3 Jam',
      menit: 180,
      harga: 3 * rate,
      desc: `3 jam × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '4h',
      nama: '4 Jam',
      menit: 240,
      harga: 4 * rate,
      desc: `4 jam × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '5h',
      nama: '5 Jam',
      menit: 300,
      harga: 5 * rate,
      desc: `5 jam × ${formatRupiah(rate)}/jam`,
    },
    {
      key: '8h',
      nama: '8 Jam (Paket Malam)',
      menit: 480,
      harga: 8 * rate,
      desc: `8 jam × ${formatRupiah(rate)}/jam`,
    },
  ];

  const presets = getPresetsForRate(currentRate);

  // Helper hitung harga manual otomatis persis berdasarkan durasi & tarif komputer
  const calculateAutoPrice = (durationVal: number, durationType: 'menit' | 'jam', rate: number) => {
    const hours = durationType === 'jam' ? durationVal : durationVal / 60;
    return Math.max(500, Math.round(hours * rate));
  };

  useEffect(() => {
    if (startModalOpen) {
      const pcId = startModalPcId && availablePcs.some(k => k.id_komputer === startModalPcId)
        ? startModalPcId
        : availablePcs.length > 0
        ? availablePcs[0].id_komputer
        : 0;

      setSelectedPcId(pcId);

      if (pelanggan.length > 0) {
        setSelectedPelangganId(pelanggan[0].id_pelanggan);
      }
      setBillingMode('preset');
      setSelectedPresetKey('30m');
      setShowQuickCust(false);
      setNewCustNama('');
      setNewCustUsername('');

      const pc = komputer.find(k => k.id_komputer === pcId);
      const rate = pc ? pc.tarif_per_jam : 5000;
      setManualDurationVal(30);
      setManualDurationType('menit');
      setManualPriceVal(calculateAutoPrice(30, 'menit', rate));
      setIsPriceCustomized(false);
    }
  }, [startModalOpen, startModalPcId, komputer]);

  // Ketika pilihan komputer berubah, otomatis perbarui kalkulasi harga manual jika belum dikustomisasi operator
  const handleSelectPc = (pcId: number) => {
    setSelectedPcId(pcId);
    const pc = komputer.find(k => k.id_komputer === pcId);
    const rate = pc ? pc.tarif_per_jam : 5000;
    if (!isPriceCustomized) {
      setManualPriceVal(calculateAutoPrice(manualDurationVal, manualDurationType, rate));
    }
  };

  // Ketika durasi manual diubah, otomatis hitung harga sesuai tarif komputer
  const handleDurationChange = (val: number, type: 'menit' | 'jam') => {
    setManualDurationVal(val);
    setManualDurationType(type);
    setManualPriceVal(calculateAutoPrice(val, type, currentRate));
    setIsPriceCustomized(false);
  };

  if (!startModalOpen) return null;

  const handleQuickAddCust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustNama.trim()) return;
    const created = addPelanggan({
      nama: newCustNama.trim(),
      username: newCustUsername.trim() || newCustNama.trim().toLowerCase().replace(/\s+/g, '_'),
    });
    setSelectedPelangganId(created.id_pelanggan);
    setShowQuickCust(false);
    setNewCustNama('');
    setNewCustUsername('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPcId) return;
    if (!selectedPelangganId) return;

    if (billingMode === 'preset') {
      const selectedP = presets.find(p => p.key === selectedPresetKey) || presets[0];
      const success = startBilling(
        selectedPcId,
        selectedPelangganId,
        null,
        selectedP.menit,
        selectedP.harga,
        selectedP.nama
      );
      if (success) setStartModalOpen(false);
    } else if (billingMode === 'manual') {
      const totalMinutes =
        manualDurationType === 'jam' ? Math.round(manualDurationVal * 60) : Math.round(manualDurationVal);
      const skemaLabel = `Manual ${manualDurationVal} ${manualDurationType === 'jam' ? 'Jam' : 'Menit'}`;
      const success = startBilling(
        selectedPcId,
        selectedPelangganId,
        null,
        totalMinutes,
        manualPriceVal,
        skemaLabel
      );
      if (success) setStartModalOpen(false);
    } else {
      const success = startBilling(selectedPcId, selectedPelangganId, null, null, null, 'Tarif Normal / Jam');
      if (success) setStartModalOpen(false);
    }
  };

  // Ringkasan
  let perkiraanBiaya = currentRate;
  let labelDurasi = 'Fleksibel (Per Menit)';

  if (billingMode === 'preset') {
    const selectedP = presets.find(p => p.key === selectedPresetKey) || presets[0];
    perkiraanBiaya = selectedP.harga;
    labelDurasi = selectedP.nama;
  } else if (billingMode === 'manual') {
    perkiraanBiaya = manualPriceVal;
    labelDurasi = `${manualDurationVal} ${manualDurationType === 'jam' ? 'Jam' : 'Menit'}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mulai Sesi Billing Station PC</h2>
              <p className="text-xs text-slate-400">Harga dan durasi otomatis mengikuti tarif per jam di menu komputer</p>
            </div>
          </div>
          <button
            onClick={() => setStartModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {availablePcs.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Monitor className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-semibold">Semua station komputer sedang digunakan atau maintenance!</p>
            <button
              onClick={() => setStartModalOpen(false)}
              className="mt-3 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            {/* 1. Pilih Komputer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-semibold">Pilih Komputer Tersedia</label>
                {currentPc && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded">
                    Tarif PC: {formatRupiah(currentRate)}/jam
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-800 rounded-lg bg-slate-950/60">
                {availablePcs.map(pc => (
                  <button
                    key={pc.id_komputer}
                    type="button"
                    onClick={() => handleSelectPc(pc.id_komputer)}
                    className={`flex flex-col items-start p-2 rounded-md border text-left transition-all ${
                      selectedPcId === pc.id_komputer
                        ? 'border-blue-500 bg-blue-950/50 text-white ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-blue-400 font-mono">{pc.nomor_komputer}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{pc.nama_komputer}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                      {formatRupiah(pc.tarif_per_jam)}/jam
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pilih Pelanggan (Tanpa nomor HP) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-semibold">Data Pelanggan</label>
                <button
                  type="button"
                  onClick={() => setShowQuickCust(!showQuickCust)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showQuickCust ? 'Pilih yang Ada' : '+ Pelanggan Cepat'}
                </button>
              </div>

              {showQuickCust ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <p className="text-[11px] font-semibold text-slate-300">Pendaftaran Cepat Pelanggan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Pelanggan"
                      value={newCustNama}
                      onChange={e => setNewCustNama(e.target.value)}
                      required
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Username Member (opsional)"
                      value={newCustUsername}
                      onChange={e => setNewCustUsername(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddCust}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                  >
                    Simpan Pelanggan Ini
                  </button>
                </div>
              ) : (
                <select
                  value={selectedPelangganId}
                  onChange={e => setSelectedPelangganId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                >
                  {pelanggan.map(p => (
                    <option key={p.id_pelanggan} value={p.id_pelanggan}>
                      {p.nama} {p.username ? `(@${p.username})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 3. Pengaturan Durasi Waktu & Harga Mengikuti Tarif Komputer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-400 font-semibold">
                  Opsi Durasi Waktu & Tarif Sesi
                </label>
                <span className="text-[10px] text-slate-500">
                  Basis: {formatRupiah(currentRate)}/jam
                </span>
              </div>

              {/* Segmented Mode Control */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg mb-2.5">
                <button
                  type="button"
                  onClick={() => setBillingMode('preset')}
                  className={`py-1.5 rounded-md font-semibold text-center transition-all ${
                    billingMode === 'preset'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paket Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode('manual')}
                  className={`py-1.5 rounded-md font-semibold text-center transition-all ${
                    billingMode === 'manual'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Atur Manual Jam
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode('normal')}
                  className={`py-1.5 rounded-md font-semibold text-center transition-all ${
                    billingMode === 'normal'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Reguler / Jam
                </button>
              </div>

              {/* MODE 1: PRESET POPULER DINAMIS SESUAI TARIF KOMPUTER */}
              {billingMode === 'preset' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {presets.map(p => {
                    const isSelected = selectedPresetKey === p.key;
                    return (
                      <div
                        key={p.key}
                        onClick={() => setSelectedPresetKey(p.key)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-950/40 text-white ring-1 ring-blue-500/40'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{p.nama}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 block mt-1">
                          {formatRupiah(p.harga)}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">{p.desc}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: ATUR MANUAL JAM / MENIT OTOMATIS BERDASARKAN TARIF KOMPUTER */}
              {billingMode === 'manual' && (
                <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Input Durasi Waktu Bebas</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      Tarif PC: {formatRupiah(currentRate)}/jam
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Durasi Pemakaian:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="720"
                          value={manualDurationVal}
                          onChange={e => handleDurationChange(Number(e.target.value), manualDurationType)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-bold focus:outline-hidden focus:border-amber-500"
                        />
                        <select
                          value={manualDurationType}
                          onChange={e =>
                            handleDurationChange(manualDurationVal, e.target.value as 'menit' | 'jam')
                          }
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white focus:outline-hidden focus:border-amber-500"
                        >
                          <option value="menit">Menit</option>
                          <option value="jam">Jam</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-400 text-[11px]">
                          Biaya Total (Rp):
                        </label>
                        {isPriceCustomized && (
                          <button
                            type="button"
                            onClick={() => {
                              setManualPriceVal(calculateAutoPrice(manualDurationVal, manualDurationType, currentRate));
                              setIsPriceCustomized(false);
                            }}
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            Reset ke Tarif PC
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={manualPriceVal}
                        onChange={e => {
                          setManualPriceVal(Number(e.target.value));
                          setIsPriceCustomized(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono font-bold text-emerald-400 focus:outline-hidden focus:border-amber-500"
                      />
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {isPriceCustomized ? 'Harga diubah manual oleh operator' : `Otomatis dihitung dari tarif ${currentPc?.nomor_komputer}`}
                      </span>
                    </div>
                  </div>

                  {/* Formula Kalkulasi Sesuai Tarif Komputer */}
                  <div className="p-2 bg-slate-900/80 border border-slate-800 rounded text-[11px] text-slate-300 font-mono">
                    <span className="text-slate-400 text-[10px] block font-sans">Rumus Tarif Komputer:</span>
                    ({manualDurationType === 'jam' ? manualDurationVal * 60 : manualDurationVal} Menit ÷ 60) × {formatRupiah(currentRate)}/jam = <strong className="text-emerald-400">{formatRupiah(calculateAutoPrice(manualDurationVal, manualDurationType, currentRate))}</strong>
                  </div>

                  {/* Tombol Pintas Durasi Cepat */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 self-center">Pintas Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleDurationChange(30, 'menit')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                    >
                      30 Menit ({formatRupiah(calculateAutoPrice(30, 'menit', currentRate))})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationChange(1, 'jam')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                    >
                      1 Jam ({formatRupiah(calculateAutoPrice(1, 'jam', currentRate))})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationChange(2, 'jam')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                    >
                      2 Jam ({formatRupiah(calculateAutoPrice(2, 'jam', currentRate))})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationChange(3, 'jam')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                    >
                      3 Jam ({formatRupiah(calculateAutoPrice(3, 'jam', currentRate))})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationChange(5, 'jam')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                    >
                      5 Jam ({formatRupiah(calculateAutoPrice(5, 'jam', currentRate))})
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 3: REGULER */}
              {billingMode === 'normal' && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <p className="font-semibold text-white">Tarif Fleksibel Reguler</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Timer berjalan bebas tanpa batas waktu. Total dihitung saat stop billing berdasarkan tarif komputer {currentPc?.nomor_komputer}:
                  </p>
                  <p className="font-mono font-bold text-emerald-400 text-sm mt-1">
                    {formatRupiah(currentRate)} / jam
                  </p>
                </div>
              )}
            </div>

            {/* Ringkasan Biaya Sesi */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Station & Durasi:</span>
                <span className="font-bold text-slate-200">
                  {currentPc?.nomor_komputer || 'PC'} &bull; {labelDurasi}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Total Tagihan Sesi:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatRupiah(perkiraanBiaya)}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStartModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Mulai Sesi Billing</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
