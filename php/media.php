<?php
session_start();

// Upload directory
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true); // Create the upload directory if it doesn't exist
}

// Handle GET request: return JSON array of uploaded files
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uploadedFiles = array_values(array_filter(scandir($uploadDir), function ($file) use ($uploadDir) {
        return is_file($uploadDir . $file) && preg_match('/\.(jpg|jpeg|png|bmp|webp)$/i', $file);
    }));
    header('Content-Type: application/json');
    echo json_encode($uploadedFiles);
    exit;
}


// Verify that the request came from the about page
if (empty($_SESSION['server_name'])) {
    http_response_code(403);
    echo 'Access denied: Unauthorized page.';
    exit;
}

// Verify the Server Name
if (empty($_SESSION['server_name']) || $_SESSION['server_name'] !== $_SERVER['SERVER_NAME']) {
    http_response_code(403);
    echo 'Access denied: Invalid SERVER_NAME';
    exit;
}

// Verify the CSRF token
if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) ||
    !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    echo 'Access denied: Invalid CSRF token.';
    exit;
}

// Unset the CSRF token to prevent reuse
unset($_SESSION['csrf_token']);

// Handle POST request: file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'webp'];

    if ($file['error'] === UPLOAD_ERR_OK) {
        // Validate file size
        if ($file['size'] > $maxFileSize) {
            http_response_code(400);
            echo json_encode(['error' => 'File is too large. Maximum size is 5MB.']);
            exit;
        }
        // Validate file type
        $fileInfo = pathinfo($file['name']);
        $fileExtension = strtolower($fileInfo['extension']);
        if (!in_array($fileExtension, $allowedExtensions)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type.']);
            exit;
        }
        // Sanitize and generate a unique file name
        $newFileName = md5(time() . $fileInfo['filename']) . '.' . $fileExtension;
        $targetPath = $uploadDir . $newFileName;

        // Move the file to the upload directory
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            echo json_encode(['success' => true, 'fileName' => $newFileName]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload the file.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'An error occurred during file upload.']);
    }
    exit;
}

// Default response for unsupported methods
http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
exit;

?>
