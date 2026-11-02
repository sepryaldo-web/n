-- ====================================================================
-- SISTEM INFORMASI BILLING WARNET (NETBILLING)
-- Database: PostgreSQL 12+ / 14+ / 15+ / 16+
-- File: database/db_billing_warnet.sql
-- ====================================================================

-- 1. DROP TABEL JIKA SUDAH ADA (URUTAN DARI FOREIGN KEY TERLUAR)
DROP TABLE IF EXISTS pembayaran CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS paket CASCADE;
DROP TABLE IF EXISTS pelanggan CASCADE;
DROP TABLE IF EXISTS komputer CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. TABEL: users (Admin & Operator Warnet)
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Disimpan dalam bentuk Hash (Bcrypt / Argon2)
    nama_lengkap VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator')),
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL: komputer (Daftar PC Warnet)
CREATE TABLE komputer (
    id_komputer SERIAL PRIMARY KEY,
    nomor_komputer VARCHAR(10) UNIQUE NOT NULL, -- contoh: PC-01, PC-02
    nama_komputer VARCHAR(50) NOT NULL,
    spesifikasi TEXT NOT NULL,                  -- Core i5, RTX 3060, RAM 16GB, 165Hz
    tarif_per_jam NUMERIC(10, 2) NOT NULL DEFAULT 5000.00,
    status VARCHAR(20) NOT NULL DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'digunakan', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL: pelanggan (Member / Pengunjung Warnet)
CREATE TABLE pelanggan (
    id_pelanggan SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nomor_hp VARCHAR(20) NOT NULL,
    username VARCHAR(50) UNIQUE,                -- opsional jika member akun
    tanggal_daftar DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL: paket (Pilihan Paket Waktu Internet/Gaming)
CREATE TABLE paket (
    id_paket SERIAL PRIMARY KEY,
    nama_paket VARCHAR(100) NOT NULL,          -- contoh: Paket 1 Jam, Paket 3 Jam, Paket Malam
    durasi_menit INT NOT NULL,                  -- durasi dalam hitungan menit (misal 60, 180, 300, 480)
    harga NUMERIC(10, 2) NOT NULL,             -- contoh: 5000, 13000, 20000, 25000
    keterangan TEXT,
    is_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL: billing (Sesi Penggunaan Komputer)
CREATE TABLE billing (
    id_billing SERIAL PRIMARY KEY,
    kode_billing VARCHAR(30) UNIQUE NOT NULL,  -- contoh: BIL-20260929-001
    id_komputer INT NOT NULL REFERENCES komputer(id_komputer) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_pelanggan INT NOT NULL REFERENCES pelanggan(id_pelanggan) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_paket INT REFERENCES paket(id_paket) ON UPDATE CASCADE ON DELETE SET NULL, -- NULL jika tarif per jam normal
    id_operator INT NOT NULL REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT,
    waktu_mulai TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    waktu_selesai TIMESTAMP,
    durasi_detik INT DEFAULT 0,                 -- durasi pemakaian aktual dalam detik
    tarif_diterapkan NUMERIC(10, 2) NOT NULL,  -- tarif/paket dasar saat mulai billing
    total_biaya NUMERIC(10, 2) DEFAULT 0.00,
    status_billing VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status_billing IN ('aktif', 'selesai', 'dibatalkan')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL: pembayaran (Transaksi Kasir & Pembayaran Sesi Billing)
CREATE TABLE pembayaran (
    id_pembayaran SERIAL PRIMARY KEY,
    nomor_transaksi VARCHAR(30) UNIQUE NOT NULL, -- contoh: TRX-20260929-001
    id_billing INT UNIQUE NOT NULL REFERENCES billing(id_billing) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_operator INT NOT NULL REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT,
    total_tagihan NUMERIC(10, 2) NOT NULL,
    jumlah_bayar NUMERIC(10, 2) NOT NULL,
    kembalian NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    metode_pembayaran VARCHAR(20) NOT NULL CHECK (metode_pembayaran IN ('tunai', 'transfer', 'qris')),
    status_pembayaran VARCHAR(20) NOT NULL DEFAULT 'lunas' CHECK (status_pembayaran IN ('lunas', 'belum_lunas', 'batal')),
    waktu_bayar TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    catatan TEXT
);

-- ====================================================================
-- INDEKS UNTUK OPTIMASI PERFORMA QUERY
-- ====================================================================
CREATE INDEX idx_komputer_status ON komputer(status);
CREATE INDEX idx_billing_status ON billing(status_billing);
CREATE INDEX idx_billing_waktu ON billing(waktu_mulai);
CREATE INDEX idx_pembayaran_waktu ON pembayaran(waktu_bayar);
CREATE INDEX idx_pembayaran_metode ON pembayaran(metode_pembayaran);

-- ====================================================================
-- DATA AWAL / DUMMY UNTUK PENGUJIAN SISTEM (SEED DATA)
-- ====================================================================

-- Catatan Password Hash (Bcrypt PHP: password_hash('password', PASSWORD_DEFAULT)):
-- admin123    -> $2y$10$wE4R/g7H3V6z8m1W2... (contoh hash standar)
-- operator123 -> $2y$10$k1N5Y7m2J9P0a8B3...
INSERT INTO users (username, password, nama_lengkap, role, status) VALUES
('admin', '$2y$10$1Y8uD1tq7Pqf6V8e0hWv2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8', 'Administrator Warnet', 'admin', 'aktif'),
('operator', '$2y$10$9Z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3', 'Operator Kasir 1', 'operator', 'aktif');

-- Seed 10 Data Komputer
INSERT INTO komputer (nomor_komputer, nama_komputer, spesifikasi, tarif_per_jam, status) VALUES
('PC-01', 'Gaming Station 01', 'Core i5-12400F, RTX 3060 12GB, RAM 16GB, Monitor 165Hz IPS, Headset 7.1', 6000.00, 'tersedia'),
('PC-02', 'Gaming Station 02', 'Core i5-12400F, RTX 3060 12GB, RAM 16GB, Monitor 165Hz IPS, Headset 7.1', 6000.00, 'digunakan'),
('PC-03', 'Gaming Station 03', 'Core i5-12400F, RTX 3060 12GB, RAM 16GB, Monitor 165Hz IPS, Headset 7.1', 6000.00, 'tersedia'),
('PC-04', 'Pro Esports 04', 'Core i7-13700KF, RTX 4070 12GB, RAM 32GB, Monitor 240Hz Fast IPS, Mech Keyboard', 8000.00, 'digunakan'),
('PC-05', 'Pro Esports 05', 'Core i7-13700KF, RTX 4070 12GB, RAM 32GB, Monitor 240Hz Fast IPS, Mech Keyboard', 8000.00, 'tersedia'),
('PC-06', 'Reguler Station 06', 'Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz 24 inch', 5000.00, 'tersedia'),
('PC-07', 'Reguler Station 07', 'Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz 24 inch', 5000.00, 'tersedia'),
('PC-08', 'Reguler Station 08', 'Core i3-12100, GTX 1650 4GB, RAM 16GB, Monitor 75Hz 24 inch', 5000.00, 'maintenance'),
('PC-09', 'VIP Sofa Room 09', 'Ryzen 7 7800X3D, RTX 4080 Super, RAM 32GB, Curved 240Hz OLED 27 inch, Kursi Ergonomis', 12000.00, 'tersedia'),
('PC-10', 'VIP Sofa Room 10', 'Ryzen 7 7800X3D, RTX 4080 Super, RAM 32GB, Curved 240Hz OLED 27 inch, Kursi Ergonomis', 12000.00, 'tersedia');

-- Seed 5 Data Pelanggan
INSERT INTO pelanggan (nama, nomor_hp, username, tanggal_daftar) VALUES
('Budi Santoso', '081234567801', 'budi_gamer', '2026-09-01'),
('Dimas Pratama', '081234567802', 'dimas_pro', '2026-09-05'),
('Rizky Maulana', '081234567803', 'rizky_m', '2026-09-10'),
('Ahmad Fauzi', '081234567804', 'fauzi_99', '2026-09-15'),
('Siti Rahma', '081234567805', 'siti_gaming', '2026-09-20');

-- Seed 4 Paket Internet
INSERT INTO paket (nama_paket, durasi_menit, harga, keterangan, is_aktif) VALUES
('Paket 1 Jam', 60, 5000.00, 'Paket santai hemat 1 jam pemakaian', TRUE),
('Paket 3 Jam', 180, 13000.00, 'Paket gaming populer hemat Rp 2.000', TRUE),
('Paket 5 Jam', 300, 20000.00, 'Paket maraton gaming hemat Rp 5.000', TRUE),
('Paket Malam (8 Jam)', 480, 25000.00, 'Berlaku mulai 22:00 - 06:00 pagi', TRUE);

-- Seed Transaksi dan Billing Selesai (Riwayat untuk Pengujian Laporan)
INSERT INTO billing (kode_billing, id_komputer, id_pelanggan, id_paket, id_operator, waktu_mulai, waktu_selesai, durasi_detik, tarif_diterapkan, total_biaya, status_billing) VALUES
('BIL-20260928-001', 1, 1, 2, 2, '2026-09-28 10:00:00', '2026-09-28 13:00:00', 10800, 13000.00, 13000.00, 'selesai'),
('BIL-20260928-002', 3, 3, 1, 2, '2026-09-28 14:15:00', '2026-09-28 15:15:00', 3600, 5000.00, 5000.00, 'selesai'),
('BIL-20260928-003', 4, 4, 3, 2, '2026-09-28 16:00:00', '2026-09-28 21:00:00', 18000, 20000.00, 20000.00, 'selesai'),
('BIL-20260929-001', 6, 5, NULL, 2, '2026-09-29 08:30:00', '2026-09-29 10:30:00', 7200, 5000.00, 10000.00, 'selesai');

-- Seed Pembayaran dari Billing Selesai
INSERT INTO pembayaran (nomor_transaksi, id_billing, id_operator, total_tagihan, jumlah_bayar, kembalian, metode_pembayaran, status_pembayaran, waktu_bayar, catatan) VALUES
('TRX-20260928-001', 1, 2, 13000.00, 20000.00, 7000.00, 'tunai', 'lunas', '2026-09-28 13:02:00', 'Pembayaran paket 3 jam Budi'),
('TRX-20260928-002', 2, 2, 5000.00, 5000.00, 0.00, 'qris', 'lunas', '2026-09-28 15:16:00', 'QRIS Mandiri'),
('TRX-20260928-003', 3, 2, 20000.00, 50000.00, 30000.00, 'tunai', 'lunas', '2026-09-28 21:02:00', 'Uang pecahan 50rb'),
('TRX-20260929-001', 4, 2, 10000.00, 10000.00, 0.00, 'transfer', 'lunas', '2026-09-29 10:32:00', 'Transfer BCA');

-- Seed Billing yang Sedang Aktif (PC-02 dan PC-04)
INSERT INTO billing (kode_billing, id_komputer, id_pelanggan, id_paket, id_operator, waktu_mulai, waktu_selesai, durasi_detik, tarif_diterapkan, total_biaya, status_billing) VALUES
('BIL-20260929-002', 2, 1, 2, 2, CURRENT_TIMESTAMP - INTERVAL '1 hour 25 minutes', NULL, 5100, 13000.00, 13000.00, 'aktif'),
('BIL-20260929-003', 4, 2, NULL, 2, CURRENT_TIMESTAMP - INTERVAL '45 minutes', NULL, 2700, 8000.00, 6000.00, 'aktif');
