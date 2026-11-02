<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$error = '';

if (isLoggedIn()) {
    if ($_SESSION['user_role'] === 'admin') {
        header('Location: ../admin/index.php');
    } else {
        header('Location: ../billing/index.php');
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'Username dan password wajib diisi!';
    } else {
        // Query menggunakan Prepared Statement mencegah SQL Injection
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username AND status = 'aktif' LIMIT 1");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        // Validasi password (mendukung password_verify Bcrypt dan fallback plain text demo 'admin123' / 'operator123')
        $isMatch = false;
        if ($user) {
            if (password_verify($password, $user['password'])) {
                $isMatch = true;
            } elseif ($password === 'admin123' && $username === 'admin') {
                $isMatch = true;
            } elseif ($password === 'operator123' && $username === 'operator') {
                $isMatch = true;
            }
        }

        if ($user && $isMatch) {
            $_SESSION['user_id'] = $user['id_user'];
            $_SESSION['user_username'] = $user['username'];
            $_SESSION['user_nama'] = $user['nama_lengkap'];
            $_SESSION['user_role'] = $user['role'];

            if ($user['role'] === 'admin') {
                header('Location: ../admin/index.php');
            } else {
                header('Location: ../billing/index.php');
            }
            exit;
        } else {
            $error = 'Username atau password tidak sesuai!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistem Billing Warnet</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="bg-login">
    <div class="login-card">
        <div class="login-header">
            <div class="brand-icon">⚡</div>
            <h2>NetBilling Warnet</h2>
            <p>Sistem Informasi Billing & Kasir Warnet</p>
        </div>

        <?php if ($error): ?>
            <div class="alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form action="" method="POST" class="login-form">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Masukkan username" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Masukkan password" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block">Masuk ke Sistem</button>
        </form>

        <div class="demo-hints">
            <p><b>Akun Demo Pengujian:</b></p>
            <p>Admin: <code>admin</code> / <code>admin123</code></p>
            <p>Operator: <code>operator</code> / <code>operator123</code></p>
        </div>
    </div>
</body>
</html>
