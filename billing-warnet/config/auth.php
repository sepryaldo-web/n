<?php
/**
 * Helper Otentikasi dan Session Pengguna
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: ../auth/login.php');
        exit;
    }
}

function requireAdmin() {
    requireLogin();
    if ($_SESSION['user_role'] !== 'admin') {
        echo "<script>alert('Akses Ditolak! Halaman ini hanya untuk Administrator.'); window.location='../billing/index.php';</script>";
        exit;
    }
}

function currentUser() {
    return [
        'id'       => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['user_username'] ?? '',
        'nama'     => $_SESSION['user_nama'] ?? 'Guest',
        'role'     => $_SESSION['user_role'] ?? 'operator',
    ];
}
?>
