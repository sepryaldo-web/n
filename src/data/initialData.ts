import { User, Komputer, Pelanggan, Paket, Billing, Pembayaran } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id_user: 1,
    username: 'admin',
    nama_lengkap: 'Administrator Warnet',
    role: 'admin',
    status: 'aktif',
    password: 'admin123',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_user: 2,
    username: 'operator',
    nama_lengkap: 'Operator Kasir 1',
    role: 'operator',
    status: 'aktif',
    password: 'operator123',
    created_at: '2026-09-01T08:00:00Z',
  },
];

// Semua PC standby siap digunakan dari awal
export const INITIAL_KOMPUTER: Komputer[] = [
  {
    id_komputer: 1,
    nomor_komputer: 'PC-01',
    nama_komputer: 'Gaming Station 01',
    spesifikasi: 'Intel Core i5-12400F, RTX 3060 12GB, RAM 16GB 3200MHz, Monitor 165Hz IPS 24", Headset 7.1',
    tarif_per_jam: 6000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 2,
    nomor_komputer: 'PC-02',
    nama_komputer: 'Gaming Station 02',
    spesifikasi: 'Intel Core i5-12400F, RTX 3060 12GB, RAM 16GB 3200MHz, Monitor 165Hz IPS 24", Headset 7.1',
    tarif_per_jam: 6000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 3,
    nomor_komputer: 'PC-03',
    nama_komputer: 'Gaming Station 03',
    spesifikasi: 'Intel Core i5-12400F, RTX 3060 12GB, RAM 16GB 3200MHz, Monitor 165Hz IPS 24", Headset 7.1',
    tarif_per_jam: 6000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 4,
    nomor_komputer: 'PC-04',
    nama_komputer: 'Pro Esports 04',
    spesifikasi: 'Intel Core i7-13700KF, RTX 4070 12GB, RAM 32GB DDR5, Monitor 240Hz Fast IPS 27", Mech Keyboard',
    tarif_per_jam: 8000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 5,
    nomor_komputer: 'PC-05',
    nama_komputer: 'Pro Esports 05',
    spesifikasi: 'Intel Core i7-13700KF, RTX 4070 12GB, RAM 32GB DDR5, Monitor 240Hz Fast IPS 27", Mech Keyboard',
    tarif_per_jam: 8000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 6,
    nomor_komputer: 'PC-06',
    nama_komputer: 'Reguler Station 06',
    spesifikasi: 'Intel Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz IPS 24", Mouse Gaming',
    tarif_per_jam: 5000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 7,
    nomor_komputer: 'PC-07',
    nama_komputer: 'Reguler Station 07',
    spesifikasi: 'Intel Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz IPS 24", Mouse Gaming',
    tarif_per_jam: 5000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 8,
    nomor_komputer: 'PC-08',
    nama_komputer: 'Reguler Station 08',
    spesifikasi: 'Intel Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz IPS 24" (Dalam perbaikan power supply)',
    tarif_per_jam: 5000,
    status: 'maintenance',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 9,
    nomor_komputer: 'PC-09',
    nama_komputer: 'VIP Sofa Room 09',
    spesifikasi: 'AMD Ryzen 7 7800X3D, RTX 4080 Super 16GB, RAM 32GB DDR5, Monitor OLED 240Hz 27", Kursi Secretlab',
    tarif_per_jam: 12000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id_komputer: 10,
    nomor_komputer: 'PC-10',
    nama_komputer: 'VIP Sofa Room 10',
    spesifikasi: 'AMD Ryzen 7 7800X3D, RTX 4080 Super 16GB, RAM 32GB DDR5, Monitor OLED 240Hz 27", Kursi Secretlab',
    tarif_per_jam: 12000,
    status: 'tersedia',
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_PELANGGAN: Pelanggan[] = [
  {
    id_pelanggan: 1,
    nama: 'Budi Santoso',
    username: 'budi_gamer',
    tanggal_daftar: '2026-09-01',
  },
  {
    id_pelanggan: 2,
    nama: 'Dimas Pratama',
    username: 'dimas_pro',
    tanggal_daftar: '2026-09-05',
  },
  {
    id_pelanggan: 3,
    nama: 'Rizky Maulana',
    username: 'rizky_m',
    tanggal_daftar: '2026-09-10',
  },
  {
    id_pelanggan: 4,
    nama: 'Ahmad Fauzi',
    username: 'fauzi_99',
    tanggal_daftar: '2026-09-15',
  },
  {
    id_pelanggan: 5,
    nama: 'Siti Rahma',
    username: 'siti_gaming',
    tanggal_daftar: '2026-09-20',
  },
];

export const INITIAL_PAKET: Paket[] = [
  {
    id_paket: 1,
    nama_paket: 'Paket 1 Jam',
    durasi_menit: 60,
    harga: 5000,
    keterangan: 'Paket santai hemat 1 jam pemakaian',
    is_aktif: true,
  },
  {
    id_paket: 2,
    nama_paket: 'Paket 3 Jam',
    durasi_menit: 180,
    harga: 13000,
    keterangan: 'Paket gaming populer hemat Rp 2.000 dibanding tarif reguler',
    is_aktif: true,
  },
  {
    id_paket: 3,
    nama_paket: 'Paket 5 Jam',
    durasi_menit: 300,
    harga: 20000,
    keterangan: 'Paket push rank maraton hemat Rp 5.000',
    is_aktif: true,
  },
  {
    id_paket: 4,
    nama_paket: 'Paket Malam (8 Jam)',
    durasi_menit: 480,
    harga: 25000,
    keterangan: 'Berlaku mulai 22:00 - 06:00 pagi harga spesial malam',
    is_aktif: true,
  },
];

// Buat tanggal relatif sekarang untuk active billing & riwayat
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 85 * 60 * 1000).toISOString();
const fortyMinsAgo = new Date(now.getTime() - 42 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
const yyyymmdd = yesterday.toISOString().split('T')[0];

// Memulai dari nol (kosong) agar aplikasi dimulai dari awal
export const INITIAL_BILLING: Billing[] = [];

export const INITIAL_PEMBAYARAN: Pembayaran[] = [];
