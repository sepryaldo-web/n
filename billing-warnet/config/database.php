<?php
/**
 * Konfigurasi Database PostgreSQL untuk Sistem Informasi Billing Warnet
 * Menggunakan PDO (PHP Data Objects) dengan driver pdo_pgsql
 */

$host     = 'localhost';
$port     = '5432';
$dbname   = 'db_billing_warnet';
$user     = 'postgres';
$password = 'postgres'; // Sesuaikan password postgres lokal Anda

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    die("Koneksi Database PostgreSQL Gagal: " . $e->getMessage() . 
        "<br><small>Pastikan service PostgreSQL berjalan di port 5432 dan database <b>db_billing_warnet</b> sudah di-import.</small>");
}

// Fungsi bantu format Rupiah
function formatRupiah($angka) {
    return 'Rp ' . number_format($angka, 0, ',', '.');
}

// Fungsi bantu format Detik ke Jam:Menit:Detik
function formatDurasi($detik) {
    $jam   = floor($detik / 3600);
    $menit = floor(($detik % 3600) / 60);
    $sisaDetik = $detik % 60;
    return sprintf('%02d:%02d:%02d', $jam, $menit, $sisaDetik);
}
?>
