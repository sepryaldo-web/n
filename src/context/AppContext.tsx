import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  Komputer,
  Pelanggan,
  Paket,
  Billing,
  Pembayaran,
  ActiveTab,
  MetodePembayaran,
  KomputerStatus,
  TutupBukuRecord,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_KOMPUTER,
  INITIAL_PELANGGAN,
  INITIAL_PAKET,
  INITIAL_BILLING,
  INITIAL_PEMBAYARAN,
} from '../data/initialData';
import { soundFX } from '../utils/audio';
import { calculateBillingCost } from '../utils/format';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  users: User[];
  komputer: Komputer[];
  pelanggan: Pelanggan[];
  paket: Paket[];
  billing: Billing[];
  pembayaran: Pembayaran[];
  tutupBukuHistory: TutupBukuRecord[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  currentTime: Date;
  
  // Modals state
  startModalOpen: boolean;
  setStartModalOpen: (open: boolean) => void;
  startModalPcId: number | null;
  openStartModal: (pcId?: number) => void;

  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  activePaymentBillingId: number | null;
  openPaymentModal: (billingId: number) => void;

  receiptModalOpen: boolean;
  setReceiptModalOpen: (open: boolean) => void;
  activeReceiptPembayaranId: number | null;
  openReceiptModal: (pembayaranId: number) => void;

  dailyResetModalOpen: boolean;
  setDailyResetModalOpen: (open: boolean) => void;

  // Filter Pelanggan terhubung ke Transaksi
  trxFilterPelangganId: number | null;
  setTrxFilterPelangganId: (id: number | null) => void;

  // Actions
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  switchRole: (role: 'admin' | 'operator') => void;
  resetToDefaultData: () => void;
  resetHarian: (catatan?: string) => { omset: number; count: number };
  resetSemuaLaporan: () => void;

  // Core Billing Actions
  startBilling: (
    pcId: number,
    pelangganId: number,
    paketId: number | null,
    manualDurationMinutes?: number | null,
    manualPrice?: number | null,
    namaSkema?: string
  ) => boolean;
  stopBilling: (billingId: number) => void;
  processPayment: (
    billingId: number,
    jumlahBayar: number,
    metode: MetodePembayaran,
    catatan?: string
  ) => Pembayaran | null;

  // CRUD Komputer
  addKomputer: (data: Omit<Komputer, 'id_komputer' | 'created_at'>) => void;
  updateKomputer: (id: number, data: Partial<Komputer>) => void;
  deleteKomputer: (id: number) => { success: boolean; message: string };

  // CRUD Pelanggan
  addPelanggan: (data: Omit<Pelanggan, 'id_pelanggan' | 'tanggal_daftar'>) => Pelanggan;
  updatePelanggan: (id: number, data: Partial<Pelanggan>) => void;
  deletePelanggan: (id: number) => { success: boolean; message: string };

  // CRUD Paket
  addPaket: (data: Omit<Paket, 'id_paket'>) => void;
  updatePaket: (id: number, data: Partial<Paket>) => void;
  deletePaket: (id: number) => { success: boolean; message: string };

  // CRUD User
  addUser: (data: Omit<User, 'id_user' | 'created_at'>) => void;
  updateUser: (id: number, data: Partial<User>) => void;
  deleteUser: (id: number) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load or fallback to initial data
  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('nb_users');
    if (s) {
      try {
        const parsed: User[] = JSON.parse(s);
        return parsed.map(u => ({
          ...u,
          password: u.password || (u.username === 'admin' ? 'admin123' : 'operator123'),
        }));
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // HANYA cek sessionStorage (dipersist di refresh F5, dibersihkan saat close tab/window)
    // Jika sessionStorage kosong, tampilkan login meski localData masih ada
    const s = sessionStorage.getItem('nb_current_user');
    return s ? JSON.parse(s) : null;
  });

  const [komputer, setKomputer] = useState<Komputer[]>(() => {
    const s = localStorage.getItem('nb_komputer');
    return s ? JSON.parse(s) : INITIAL_KOMPUTER;
  });

  const [pelanggan, setPelanggan] = useState<Pelanggan[]>(() => {
    const s = localStorage.getItem('nb_pelanggan');
    return s ? JSON.parse(s) : INITIAL_PELANGGAN;
  });

  const [paket, setPaket] = useState<Paket[]>(() => {
    const s = localStorage.getItem('nb_paket');
    return s ? JSON.parse(s) : INITIAL_PAKET;
  });

  const [billing, setBilling] = useState<Billing[]>(() => {
    const isClean = localStorage.getItem('nb_v4_clean_zero');
    if (!isClean) {
      localStorage.setItem('nb_v4_clean_zero', 'true');
      localStorage.setItem('nb_billing', JSON.stringify([]));
      return [];
    }
    const s = localStorage.getItem('nb_billing');
    return s ? JSON.parse(s) : [];
  });

  const [pembayaran, setPembayaran] = useState<Pembayaran[]>(() => {
    const isClean = localStorage.getItem('nb_v4_clean_zero');
    if (!isClean) {
      localStorage.setItem('nb_v4_clean_zero', 'true');
      localStorage.setItem('nb_pembayaran', JSON.stringify([]));
      return [];
    }
    const s = localStorage.getItem('nb_pembayaran');
    return s ? JSON.parse(s) : [];
  });

  const [tutupBukuHistory, setTutupBukuHistory] = useState<TutupBukuRecord[]>(() => {
    const s = localStorage.getItem('nb_tutup_buku');
    return s ? JSON.parse(s) : [];
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const s = localStorage.getItem('nb_activeTab');
    return s ? JSON.parse(s) : 'dashboard';
  });
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Hapus sebelumunload agar user tetap login saat refresh
  // State user sudah dipersist ke localStorage, jadi tidak perlu menghapusnya saat unload

  // Modals
  const [startModalOpen, setStartModalOpen] = useState<boolean>(false);
  const [startModalPcId, setStartModalPcId] = useState<number | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [activePaymentBillingId, setActivePaymentBillingId] = useState<number | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [activeReceiptPembayaranId, setActiveReceiptPembayaranId] = useState<number | null>(null);

  const [dailyResetModalOpen, setDailyResetModalOpen] = useState<boolean>(false);
  const [trxFilterPelangganId, setTrxFilterPelangganId] = useState<number | null>(null);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    soundFX.enabled = val;
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nb_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nb_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nb_komputer', JSON.stringify(komputer));
  }, [komputer]);

  useEffect(() => {
    localStorage.setItem('nb_pelanggan', JSON.stringify(pelanggan));
  }, [pelanggan]);

  useEffect(() => {
    localStorage.setItem('nb_paket', JSON.stringify(paket));
  }, [paket]);

  useEffect(() => {
    localStorage.setItem('nb_billing', JSON.stringify(billing));
  }, [billing]);

  useEffect(() => {
    localStorage.setItem('nb_pembayaran', JSON.stringify(pembayaran));
  }, [pembayaran]);

  useEffect(() => {
    localStorage.setItem('nb_tutup_buku', JSON.stringify(tutupBukuHistory));
  }, [tutupBukuHistory]);

  useEffect(() => {
    localStorage.setItem('nb_activeTab', JSON.stringify(activeTab));
  }, [activeTab]);

  // Real-time ticking stopwatch for live billing sessions and current clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      setBilling(prevBilling => {
        let changed = false;
        const updated = prevBilling.map(b => {
          if (b.status_billing === 'aktif') {
            changed = true;
            const startMs = new Date(b.waktu_mulai).getTime();
            const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - startMs) / 1000));
            
            let calculatedCost = b.total_biaya;

            // Jika mode manual dengan durasi target tertentu (misal 30 menit Rp 2.000)
            if (b.mode_billing === 'manual' && b.durasi_target_menit) {
              const targetSeconds = b.durasi_target_menit * 60;
              if (elapsedSeconds <= targetSeconds) {
                calculatedCost = b.tarif_diterapkan;
              } else {
                // Kelebihan waktu overtime dikenakan tarif proporsional
                const extraSeconds = elapsedSeconds - targetSeconds;
                const pc = komputer.find(k => k.id_komputer === b.id_komputer);
                const rate = pc ? pc.tarif_per_jam : 5000;
                const overtimeCost = Math.ceil(((extraSeconds / 3600) * rate) / 500) * 500;
                calculatedCost = b.tarif_diterapkan + overtimeCost;
              }
            } else {
              const pc = komputer.find(k => k.id_komputer === b.id_komputer);
              const pkt = b.id_paket ? paket.find(p => p.id_paket === b.id_paket) : null;
              const rate = pc ? pc.tarif_per_jam : 5000;
              const { cost } = calculateBillingCost(elapsedSeconds, rate, pkt);
              calculatedCost = cost;
            }

            return {
              ...b,
              durasi_detik: elapsedSeconds,
              total_biaya: calculatedCost,
            };
          }
          return b;
        });
        return changed ? updated : prevBilling;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [komputer, paket]);

  const openStartModal = (pcId?: number) => {
    setStartModalPcId(pcId ?? null);
    setStartModalOpen(true);
  };

  const openPaymentModal = (billingId: number) => {
    setActivePaymentBillingId(billingId);
    setPaymentModalOpen(true);
  };

  const openReceiptModal = (pembayaranId: number) => {
    setActiveReceiptPembayaranId(pembayaranId);
    setReceiptModalOpen(true);
  };

  const login = (username: string, pass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();
    const found = users.find(u => u.username.toLowerCase() === cleanUser);
    if (!found) return false;
    if (found.status !== 'aktif') return false;

    // Otentikasi sesuai dengan username & password akun yang dibuat di Menu Pengguna
    const userPass = found.password || (found.username === 'admin' ? 'admin123' : 'operator123');
    if (userPass === cleanPass) {
      setCurrentUser(found);
      // Simpan ke localStorage (persisten) dan sessionStorage (per-tab, dibersihkan saat close)
      localStorage.setItem('nb_current_user', JSON.stringify(found));
      sessionStorage.setItem('nb_current_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    // Hapus dari localStorage dan sessionStorage
    localStorage.removeItem('nb_current_user');
    sessionStorage.removeItem('nb_current_user');
  };

  const switchRole = (role: 'admin' | 'operator') => {
    const target = users.find(u => u.role === role) || {
      id_user: role === 'admin' ? 1 : 2,
      username: role,
      nama_lengkap: role === 'admin' ? 'Administrator Warnet' : 'Operator Kasir 1',
      role,
      status: 'aktif' as const,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(target);
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setKomputer(INITIAL_KOMPUTER);
    setPelanggan(INITIAL_PELANGGAN);
    setPaket(INITIAL_PAKET);
    setBilling(INITIAL_BILLING);
    setPembayaran(INITIAL_PEMBAYARAN);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
  };

  // Fitur Riset Harian / Tutup Buku Harian Kasir
  const resetHarian = (catatan?: string): { omset: number; count: number } => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const trxToday = pembayaran.filter(p => p.waktu_bayar.startsWith(todayStr));
    const omsetToday = trxToday.reduce((sum, p) => sum + p.total_tagihan, 0);
    const countToday = trxToday.length;

    // Catat ke riwayat tutup buku harian
    const record: TutupBukuRecord = {
      id: Date.now(),
      tanggal: todayStr,
      waktu_reset: new Date().toISOString(),
      total_omset: omsetToday,
      total_transaksi: countToday,
      operator_nama: currentUser ? currentUser.nama_lengkap : 'Operator Kasir',
      catatan: catatan || 'Tutup buku & reset harian kasir',
    };

    setTutupBukuHistory(prev => [record, ...prev]);

    // Arsipkan transaksi hari ini dengan mengubah tag tanggal ke arsip lampau
    // agar hitungan hari ini kembali 0 untuk shift / hari baru
    const yesterdayDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
    setPembayaran(prev =>
      prev.map(p => {
        if (p.waktu_bayar.startsWith(todayStr)) {
          return {
            ...p,
            waktu_bayar: p.waktu_bayar.replace(todayStr, `${yesterdayDate}_closed`),
            catatan: p.catatan ? `${p.catatan} (Tutup Buku)` : '(Tutup Buku)',
          };
        }
        return p;
      })
    );

    soundFX.playPaymentSuccess();
    return { omset: omsetToday, count: countToday };
  };

  // Riset Semua Laporan & Transaksi ke NOL (Mulai dari Awal)
  const resetSemuaLaporan = () => {
    setBilling([]);
    setPembayaran([]);
    setTutupBukuHistory([]);
    setKomputer(prev => prev.map(k => ({ ...k, status: 'tersedia' as KomputerStatus })));
    localStorage.setItem('nb_billing', JSON.stringify([]));
    localStorage.setItem('nb_pembayaran', JSON.stringify([]));
    localStorage.setItem('nb_tutup_buku', JSON.stringify([]));
    soundFX.playPaymentSuccess();
  };

  // Mulai Billing (Mendukung manual jam/menit, misal 30 menit Rp 2.000)
  const startBilling = (
    pcId: number,
    pelangganId: number,
    paketId: number | null,
    manualDurationMinutes?: number | null,
    manualPrice?: number | null,
    namaSkema?: string
  ): boolean => {
    const pc = komputer.find(k => k.id_komputer === pcId);
    if (!pc || pc.status !== 'tersedia') {
      return false;
    }

    const nowIso = new Date().toISOString();
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const randomCode = Math.floor(100 + Math.random() * 900);
    const kodeBilling = `BIL-${ymd}-${randomCode}`;

    let initialCost = pc.tarif_per_jam;
    let modeBilling: 'normal' | 'paket' | 'manual' = 'normal';
    let targetMenit: number | null = null;
    let skema = 'Tarif Normal / Jam';

    if (manualDurationMinutes && manualPrice !== undefined && manualPrice !== null) {
      modeBilling = 'manual';
      targetMenit = manualDurationMinutes;
      initialCost = manualPrice;
      skema = namaSkema || `${manualDurationMinutes} Menit (${manualPrice})`;
    } else if (paketId) {
      const selectedPaket = paket.find(p => p.id_paket === paketId);
      if (selectedPaket) {
        modeBilling = 'paket';
        targetMenit = selectedPaket.durasi_menit;
        initialCost = selectedPaket.harga;
        skema = selectedPaket.nama_paket;
      }
    }

    const newBilling: Billing = {
      id_billing: Date.now(),
      kode_billing: kodeBilling,
      id_komputer: pcId,
      id_pelanggan: pelangganId,
      id_paket: paketId,
      id_operator: currentUser ? currentUser.id_user : 2,
      waktu_mulai: nowIso,
      waktu_selesai: null,
      durasi_detik: 0,
      durasi_target_menit: targetMenit,
      mode_billing: modeBilling,
      nama_skema: skema,
      tarif_diterapkan: initialCost,
      total_biaya: initialCost,
      status_billing: 'aktif',
    };

    setBilling(prev => [newBilling, ...prev]);

    setKomputer(prev =>
      prev.map(k => (k.id_komputer === pcId ? { ...k, status: 'digunakan' as KomputerStatus } : k))
    );

    soundFX.playStart();
    return true;
  };

  // Stop Billing -> Buka Kasir Pembayaran
  const stopBilling = useCallback((billingId: number) => {
    const b = billing.find(item => item.id_billing === billingId);
    if (!b || b.status_billing !== 'aktif') return;

    const now = new Date();
    const startMs = new Date(b.waktu_mulai).getTime();
    const elapsedSeconds = Math.max(1, Math.floor((now.getTime() - startMs) / 1000));

    let finalCost = b.total_biaya;

    if (b.mode_billing === 'manual' && b.durasi_target_menit) {
      const targetSecs = b.durasi_target_menit * 60;
      if (elapsedSeconds <= targetSecs) {
        finalCost = b.tarif_diterapkan;
      } else {
        const extraSeconds = elapsedSeconds - targetSecs;
        const pc = komputer.find(k => k.id_komputer === b.id_komputer);
        const rate = pc ? pc.tarif_per_jam : 5000;
        const overtimeCost = Math.ceil(((extraSeconds / 3600) * rate) / 500) * 500;
        finalCost = b.tarif_diterapkan + overtimeCost;
      }
    } else {
      const pc = komputer.find(k => k.id_komputer === b.id_komputer);
      const pkt = b.id_paket ? paket.find(p => p.id_paket === b.id_paket) : null;
      const rate = pc ? pc.tarif_per_jam : 5000;
      const { cost } = calculateBillingCost(elapsedSeconds, rate, pkt);
      finalCost = cost;
    }

    setBilling(prev =>
      prev.map(item =>
        item.id_billing === billingId
          ? {
              ...item,
              waktu_selesai: now.toISOString(),
              durasi_detik: elapsedSeconds,
              total_biaya: finalCost,
              status_billing: 'selesai' as const,
            }
          : item
      )
    );

    setKomputer(prev =>
      prev.map(k => (k.id_komputer === b.id_komputer ? { ...k, status: 'tersedia' as KomputerStatus } : k))
    );

    soundFX.playStop();
    openPaymentModal(billingId);
  }, [billing, komputer, paket]);

  // Proses Pembayaran Kasir
  const processPayment = (
    billingId: number,
    jumlahBayar: number,
    metode: MetodePembayaran,
    catatan?: string
  ): Pembayaran | null => {
    const b = billing.find(item => item.id_billing === billingId);
    if (!b) return null;

    const tagihan = b.total_biaya;
    if (metode === 'tunai' && jumlahBayar < tagihan) {
      return null;
    }

    const kembalian = Math.max(0, jumlahBayar - tagihan);
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const randomTrx = Math.floor(100 + Math.random() * 900);
    const nomorTransaksi = `TRX-${ymd}-${randomTrx}`;

    const newPayment: Pembayaran = {
      id_pembayaran: Date.now(),
      nomor_transaksi: nomorTransaksi,
      id_billing: billingId,
      id_operator: currentUser ? currentUser.id_user : 2,
      total_tagihan: tagihan,
      jumlah_bayar: jumlahBayar,
      kembalian,
      metode_pembayaran: metode,
      status_pembayaran: 'lunas',
      waktu_bayar: new Date().toISOString(),
      catatan: catatan || '',
    };

    setPembayaran(prev => [newPayment, ...prev]);
    soundFX.playPaymentSuccess();

    return newPayment;
  };

  // CRUD Komputer
  const addKomputer = (data: Omit<Komputer, 'id_komputer' | 'created_at'>) => {
    const newPc: Komputer = {
      ...data,
      id_komputer: Date.now(),
      created_at: new Date().toISOString(),
    };
    setKomputer(prev => [...prev, newPc]);
  };

  const updateKomputer = (id: number, data: Partial<Komputer>) => {
    setKomputer(prev => prev.map(k => (k.id_komputer === id ? { ...k, ...data } : k)));
  };

  const deleteKomputer = (id: number): { success: boolean; message: string } => {
    const pc = komputer.find(k => k.id_komputer === id);
    if (!pc) return { success: false, message: 'Komputer tidak ditemukan' };
    if (pc.status === 'digunakan') {
      return { success: false, message: 'Komputer sedang digunakan! Hentikan sesi billing terlebih dahulu.' };
    }
    const hasActiveBilling = billing.some(b => b.id_komputer === id && b.status_billing === 'aktif');
    if (hasActiveBilling) {
      return { success: false, message: 'Komputer memiliki sesi billing aktif!' };
    }
    setKomputer(prev => prev.filter(k => k.id_komputer !== id));
    return { success: true, message: 'Komputer berhasil dihapus' };
  };

  // CRUD Pelanggan (Tanpa nomor whatsapp/hp)
  const addPelanggan = (data: Omit<Pelanggan, 'id_pelanggan' | 'tanggal_daftar'>): Pelanggan => {
    const newCust: Pelanggan = {
      ...data,
      id_pelanggan: Date.now(),
      tanggal_daftar: new Date().toISOString().split('T')[0],
    };
    setPelanggan(prev => [newCust, ...prev]);
    return newCust;
  };

  const updatePelanggan = (id: number, data: Partial<Pelanggan>) => {
    setPelanggan(prev => prev.map(p => (p.id_pelanggan === id ? { ...p, ...data } : p)));
  };

  const deletePelanggan = (id: number): { success: boolean; message: string } => {
    const isUsed = billing.some(b => b.id_pelanggan === id && b.status_billing === 'aktif');
    if (isUsed) {
      return { success: false, message: 'Pelanggan masih memiliki sesi billing aktif di salah satu komputer!' };
    }
    setPelanggan(prev => prev.filter(p => p.id_pelanggan !== id));
    return { success: true, message: 'Pelanggan berhasil dihapus' };
  };

  // CRUD Paket
  const addPaket = (data: Omit<Paket, 'id_paket'>) => {
    const newPaket: Paket = {
      ...data,
      id_paket: Date.now(),
    };
    setPaket(prev => [...prev, newPaket]);
  };

  const updatePaket = (id: number, data: Partial<Paket>) => {
    setPaket(prev => prev.map(p => (p.id_paket === id ? { ...p, ...data } : p)));
  };

  const deletePaket = (id: number): { success: boolean; message: string } => {
    setPaket(prev => prev.filter(p => p.id_paket !== id));
    return { success: true, message: 'Paket berhasil dihapus' };
  };

  // CRUD User
  const addUser = (data: Omit<User, 'id_user' | 'created_at'>) => {
    const newUser: User = {
      ...data,
      id_user: Date.now(),
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: number, data: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id_user === id ? { ...u, ...data } : u)));
    if (currentUser && currentUser.id_user === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteUser = (id: number): { success: boolean; message: string } => {
    if (currentUser && currentUser.id_user === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang Anda gunakan saat ini!' };
    }
    setUsers(prev => prev.filter(u => u.id_user !== id));
    return { success: true, message: 'Akun pengguna berhasil dihapus' };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        komputer,
        pelanggan,
        paket,
        billing,
        pembayaran,
        tutupBukuHistory,
        activeTab,
        setActiveTab,
        soundEnabled,
        setSoundEnabled,
        currentTime,
        startModalOpen,
        setStartModalOpen,
        startModalPcId,
        openStartModal,
        paymentModalOpen,
        setPaymentModalOpen,
        activePaymentBillingId,
        openPaymentModal,
        receiptModalOpen,
        setReceiptModalOpen,
        activeReceiptPembayaranId,
        openReceiptModal,
        dailyResetModalOpen,
        setDailyResetModalOpen,
        trxFilterPelangganId,
        setTrxFilterPelangganId,
        login,
        logout,
        switchRole,
        resetToDefaultData,
        resetHarian,
        resetSemuaLaporan,
        startBilling,
        stopBilling,
        processPayment,
        addKomputer,
        updateKomputer,
        deleteKomputer,
        addPelanggan,
        updatePelanggan,
        deletePelanggan,
        addPaket,
        updatePaket,
        deletePaket,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
