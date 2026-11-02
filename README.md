# NetBilling - Sistem Informasi Billing Warnet

Sistem Informasi Billing & Kasir Warnet (Internet & Gaming Cafe) modern, responsif, dan siap dijalankan secara lokal menggunakan **PHP 8+, PostgreSQL 12+, dan Apache/XAMPP**. Dilengkapi dengan interface interaktif real-time live timer, pencatatan sesi rental, perhitungan tarif otomatis, struk kasir termal, manajemen paket internet, laporan pendapatan, serta skema basis data PostgreSQL ternormalisasi lengkap dengan rancangan ERD.

---

## 1. Deskripsi Aplikasi

NetBilling dirancang untuk mempermudah operasional usaha warnet dan arena gaming esports dalam:
- Mengontrol status ketersediaan setiap komputer (*Tersedia, Digunakan, Maintenance*).
- Menghitung durasi pemakaian dan total biaya secara otomatis dan akurat menggunakan waktu server.
- Menyediakan fleksibilitas skema tarif: **Tarif Reguler per Jam** atau **Paket Promo Internet** (Paket 1 Jam, Paket 3 Jam, Paket 5 Jam, Paket Malam).
- Memfasilitasi pembayaran kasir dengan metode **Tunai** (dengan perhitungan kembalian dan validasi uang tidak boleh kurang), **Transfer Bank** (BCA & Mandiri), serta **QRIS Dinamis**.
- Mencetak dan menampilkan **Struk Kasir Termal (58mm/80mm POS Slip)** secara langsung.
- Menyediakan rekapitulasi **Laporan Omset & Statistik Kinerja** (harian, mingguan, bulanan, ranking komputer terlaris, serta ekspor file CSV untuk Microsoft Excel).

---

## 2. Fitur Utama

### A. Role & Hak Akses
1. **Administrator**
   - Mengelola seluruh data komputer (CRUD, spesifikasi hardware, tarif/jam).
   - Mengelola member & pelanggan.
   - Mengelola paket billing internet (durasi menit & harga promo).
   - Mengelola akun operator kasir & hak akses pengguna.
   - Melihat riwayat transaksi lengkap dan cetak ulang struk kasir.
   - Mengakses laporan omset pendapatan, ranking station PC terlaris, dan ekspor CSV.
2. **Operator (Kasir)**
   - Monitoring status komputer real-time (*Tersedia, Digunakan, Maintenance*).
   - Memulai sesi billing komputer (*Pilih Pelanggan, Unit PC, Paket / Tarif Normal*).
   - Menghentikan sesi billing (*Stop Billing*).
   - Memproses pembayaran kasir (*Tunai, Transfer, QRIS*).
   - Mencetak struk bukti pembayaran pelanggan.
   - Melihat riwayat transaksi shift kasir.

### B. Otomasi Perhitungan Billing & Kasir
- **Live Stopwatch Timer**: Timer detik-menit-jam berjalan otomatis secara real-time.
- **Dynamic Cost Accrual**: Biaya sementara dihitung dinamis setiap detik.
- **Cashier Safety Validation**: Pembayaran tunai divalidasi agar tidak boleh kurang dari total tagihan.
- **Thermal Receipt Generator**: Format struk kasir thermal siap cetak via printer POS thermal (`window.print`).

---

## 3. Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: PHP 8.0+ (Native, PDO Database Abstraction)
- **Database Engine**: PostgreSQL 12+ / 14+ / 15+ / 16+
- **Database Driver**: `pdo_pgsql`
- **Web Server**: Apache / XAMPP lokal
- **Enkripsi Keamanan**: Bcrypt Password Hashing (`password_hash`, `password_verify`), Prepared Statements (Anti SQL Injection)

---

## 4. Akun Pengujian (Demo Accounts)

| Role | Username | Password Plain Demo | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses penuh seluruh modul dan kelola akun |
| **Operator** | `operator` | `operator123` | Akses kasir, live billing, dan pembayaran |

*Catatan: Pada database PostgreSQL, seluruh password disimpan dalam bentuk Bcrypt Hash demi memenuhi standar keamanan industri.*

---

## 5. Struktur Database & Rancangan ERD

Database yang digunakan bernama: `db_billing_warnet`

### A. Daftar 6 Tabel Utama:
1. `users`: Menyimpan data login akun admin dan operator warnet.
2. `komputer`: Menyimpan nomor station (PC-01, PC-02), nama unit, spesifikasi hardware, tarif per jam, dan status.
3. `pelanggan`: Menyimpan data member dan pengunjung warnet (nama, nomor HP/WA, username, tanggal daftar).
4. `paket`: Menyimpan daftar paket promo waktu internet (durasi menit, harga, status aktif).
5. `billing`: Menyimpan sesi pemakaian komputer aktif maupun selesai (waktu mulai, selesai, durasi detik, total biaya).
6. `pembayaran`: Menyimpan bukti transaksi pembayaran kasir, nominal bayar, kembalian, metode bayar (*tunai, transfer, qris*), dan status lunas.

### B. Kardinalitas & Relasi Antar Tabel:
- **`komputer` &rarr; `billing` (1:N)**: Satu komputer dapat digunakan dalam banyak sesi billing dari waktu ke waktu.
- **`pelanggan` &rarr; `billing` (1:N)**: Satu pelanggan dapat memiliki banyak riwayat sesi pemakaian.
- **`paket` &rarr; `billing` (1:N, Nullable)**: Satu paket promo dapat diterapkan pada banyak sesi billing (atau NULL jika pelanggan memilih tarif per jam normal).
- **`billing` &rarr; `pembayaran` (1:1)**: Satu sesi billing yang selesai menghasilkan tepat satu transaksi pembayaran kasir (`id_billing` bersifat UNIQUE pada tabel pembayaran).
- **`users` &rarr; `billing` & `pembayaran` (1:N)**: Mencatat operator kasir yang bertanggung jawab terhadap sesi dan penerimaan uang.

---

## 6. Panduan Instalasi Lokal di XAMPP + PostgreSQL

### Langkah 1: Persiapan Driver PostgreSQL di XAMPP
1. Buka folder instalasi XAMPP Anda (misal `C:\xampp\php\php.ini`).
2. Buka file `php.ini` menggunakan Notepad atau VS Code.
3. Cari baris berikut dan pastikan tanda titik koma (`;`) di depannya telah dihapus:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   ```
4. Simpan file `php.ini`.
5. Buka **XAMPP Control Panel**, lalu restart Apache (klik **Stop** lalu **Start**).

### Langkah 2: Pembuatan Database di PostgreSQL
1. Buka aplikasi **pgAdmin 4** atau terminal **psql**.
2. Buat database baru bernama `db_billing_warnet`:
   ```sql
   CREATE DATABASE db_billing_warnet;
   ```
3. Buka Query Tool pada database `db_billing_warnet`.
4. Buka file `database/db_billing_warnet.sql`, lalu jalankan/eksekusi seluruh perintah SQL di dalamnya.
5. Seluruh tabel (`users`, `komputer`, `pelanggan`, `paket`, `billing`, `pembayaran`) beserta data awal dummy (10 PC, 5 pelanggan, 4 paket, transaksi contoh) akan otomatis terbuat.

### Langkah 3: Konfigurasi File PHP
1. Salin seluruh isi folder project ke dalam direktori `htdocs`:
   ```
   C:\xampp\htdocs\billing-warnet\
   ```
2. Buka file `config/database.php` dan sesuaikan kredensial PostgreSQL lokal Anda:
   ```php
   $host     = 'localhost';
   $port     = '5432';
   $dbname   = 'db_billing_warnet';
   $user     = 'postgres'; // sesuaikan user postgres Anda
   $password = 'postgres'; // sesuaikan password postgres Anda
   ```

### Langkah 4: Menjalankan Aplikasi
1. Buka web browser (Chrome / Edge / Firefox).
2. Akses alamat URL berikut:
   ```
   http://localhost/billing-warnet/
   ```
3. Masukkan username `admin` dan password `admin123` untuk menguji hak akses Administrator, atau `operator` dan `operator123` untuk hak akses Kasir.

---

## 7. Struktur Folder Project

```
billing-warnet/
├── config/
│   ├── database.php         # Koneksi PDO PostgreSQL & helper format
│   └── auth.php             # Session & pengaman role Admin/Operator
├── admin/
│   └── index.php            # Dashboard Administrator
├── operator/
│   └── index.php            # Dashboard Operator Kasir
├── assets/
│   ├── css/
│   │   └── style.css        # Desain stylesheet POS kasir warnet
│   └── js/
│       └── main.js          # Skrip interaksi & timer billing
├── auth/
│   ├── login.php            # Form & proses otentikasi login
│   └── logout.php           # Proses destroy session
├── billing/
│   ├── index.php            # Grid PC & status station real-time
│   ├── start.php            # Proses mulai sesi rental
│   └── stop.php             # Proses stop sesi rental
├── komputer/
│   ├── index.php            # CRUD data unit komputer
│   ├── tambah.php
│   ├── edit.php
│   └── hapus.php
├── pelanggan/
│   ├── index.php            # CRUD member & riwayat pemakaian
│   ├── tambah.php
│   ├── edit.php
│   └── hapus.php
├── paket/
│   ├── index.php            # CRUD paket promo internet
│   ├── tambah.php
│   ├── edit.php
│   └── hapus.php
├── transaksi/
│   ├── index.php            # Riwayat transaksi pembayaran kasir
│   ├── bayar.php            # Proses hitung uang & status lunas
│   └── struk.php            # Format thermal struk kasir (siap print)
├── laporan/
│   ├── index.php            # Laporan omset & top komputer
│   └── export_csv.php       # Generator download file CSV
├── database/
│   └── db_billing_warnet.sql # Skema DDL & seed data PostgreSQL
├── index.php                # Entry point redirector
└── README.md                # Dokumentasi lengkap
```
