<?php
session_start();

// Generate a CSRF token if one doesn't exist
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// We accept requests if the session server name matches with the actual server name
$_SESSION['server_name'] = $_SERVER['SERVER_NAME'];
?>
