<?php
require_once __DIR__ . '/config/auth.php';

if (isLoggedIn()) {
    if ($_SESSION['user_role'] === 'admin') {
        header('Location: admin/index.php');
    } else {
        header('Location: billing/index.php');
    }
} else {
    header('Location: auth/login.php');
}
exit;
?>
