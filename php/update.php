<?php
session_start();

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

// Check if a file was uploaded without errors
if (isset($_FILES['zip_file']) && $_FILES['zip_file']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['zip_file']['tmp_name'];
    $fileName = $_FILES['zip_file']['name'];
    $fileSize = $_FILES['zip_file']['size'];
    $fileType = $_FILES['zip_file']['type'];
    $fileNameCmps = pathinfo($fileName);
    $fileExtension = strtolower($fileNameCmps['extension']);

    // Validate file size (e.g., max 5MB)
    if ($fileSize > 5 * 1024 * 1024) {
        echo 'Error: File size exceeds the maximum allowed size.';
        exit;
    }

    // Allow only ZIP files
    $allowedExtensions = ['zip'];
    if (!in_array($fileExtension, $allowedExtensions)) {
        echo 'Error: Only ZIP files are allowed.';
        exit;
    }

    // Sanitize file name to prevent directory traversal
    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;

    // Define the upload directory
    $uploadFileDir = './uploads/';
    if (!is_dir($uploadFileDir)) {
        mkdir($uploadFileDir, 0755, true);
    }

    $uploadedZipPath = $uploadFileDir . $newFileName;

    // Move the file to the upload directory
    if (move_uploaded_file($fileTmpPath, $uploadedZipPath)) {
        echo 'File uploaded successfully.';

        // Open the ZIP archive
        $zip = new ZipArchive();
        if ($zip->open($uploadedZipPath) === TRUE) {
            // Define the extraction path (current directory)
            $extractPath = __DIR__; // or './' for current directory

            // Validate each file in the ZIP archive to prevent path traversal
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $entry = $zip->getNameIndex($i);

                // Normalize the file path to prevent directory traversal
                $normalizedEntry = str_replace('\\', '/', $entry);
                $normalizedEntry = rtrim($normalizedEntry, '/');

                // Check for path traversal attempts
                if (strpos($normalizedEntry, '../') !== false || strpos($normalizedEntry, '/..') !== false || substr($normalizedEntry, 0, 1) === '/') {
                    // Invalid file path detected
                    echo 'Error: Invalid file path detected in ZIP entry.';
                    $zip->close();
                    exit;
                }
            }

            // Extract the ZIP archive to the current directory
            if ($zip->extractTo($extractPath)) {
                echo 'Application updated successfully.';
            } else {
                echo 'Error: Failed to extract the ZIP file.';
            }

            // Close the ZIP archive
            $zip->close();

            // Optionally, delete the uploaded ZIP file after extraction
            // unlink($uploadedZipPath);
        } else {
            echo 'Error: Failed to open the ZIP file.';
        }
    } else {
        echo 'Error: There was a problem moving the file.';
    }
} else {
    echo 'Error: No file uploaded or there was an upload error.';
}

// Delete the uploaded ZIP file
if (file_exists($uploadedZipPath)) {
    unlink($uploadedZipPath);
}
