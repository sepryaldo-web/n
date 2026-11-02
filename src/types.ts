export type UserRole = 'admin' | 'operator';

export interface User {
  id_user: number;
  username: string;
  nama_lengkap: string;
  role: UserRole;
  status: 'aktif' | 'nonaktif';
  password?: string;
  created_at: string;
}

export type KomputerStatus = 'tersedia' | 'digunakan' | 'maintenance';

export interface Komputer {
  id_komputer: number;
  nomor_komputer: string;
  nama_komputer: string;
  spesifikasi: string;
  tarif_per_jam: number;
  status: KomputerStatus;
  created_at: string;
}

export interface Pelanggan {
  id_pelanggan: number;
  nama: string;
  username?: string;
  tanggal_daftar: string;
}

export interface Paket {
  id_paket: number;
  nama_paket: string;
  durasi_menit: number;
  harga: number;
  keterangan: string;
  is_aktif: boolean;
}

export type BillingStatus = 'aktif' | 'selesai' | 'dibatalkan';
export type BillingMode = 'normal' | 'paket' | 'manual';

export interface Billing {
  id_billing: number;
  kode_billing: string;
  id_komputer: number;
  id_pelanggan: number;
  id_paket: number | null; // null jika pakai tarif normal per jam atau manual
  id_operator: number;
  waktu_mulai: string; // ISO string
  waktu_selesai?: string | null;
  durasi_detik: number;
  durasi_target_menit?: number | null; // Target durasi (misal 30 menit, 60 menit)
  mode_billing?: BillingMode;
  nama_skema?: string; // misal "30 Menit (Rp 2.000)", "Tarif Normal", "Paket 3 Jam"
  tarif_diterapkan: number;
  total_biaya: number;
  status_billing: BillingStatus;
}

export type MetodePembayaran = 'tunai' | 'transfer' | 'qris';
export type StatusPembayaran = 'lunas' | 'belum_lunas' | 'batal';

export interface Pembayaran {
  id_pembayaran: number;
  nomor_transaksi: string;
  id_billing: number;
  id_operator: number;
  total_tagihan: number;
  jumlah_bayar: number;
  kembalian: number;
  metode_pembayaran: MetodePembayaran;
  status_pembayaran: StatusPembayaran;
  waktu_bayar: string;
  catatan?: string;
}

export interface TutupBukuRecord {
  id: number;
  tanggal: string;
  waktu_reset: string;
  total_omset: number;
  total_transaksi: number;
  operator_nama: string;
  catatan?: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'billing'
  | 'komputer'
  | 'pelanggan'
  | 'paket'
  | 'transaksi'
  | 'laporan'
  | 'pengguna';
