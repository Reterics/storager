<?php

// Connection info
$host = 'localhost';
$user = 'your_username';
$password = 'your_password';
$database = 'your_database';

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => "Connection failed: " . $conn->connect_error]));
}

// Set headers
header('Content-Type: application/json');

// Check if request comes from localhost
if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1') {
    die(json_encode(['error' => 'Access denied. Requests are only allowed from localhost.']));
}


// Handle request method
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Process based on the request method
switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'POST':
        handlePost($conn, $input);
        break;
    case 'PUT':
        handlePut($conn, $input);
        break;
    case 'DELETE':
        handleDelete($conn, $input);
        break;
    default:
        echo json_encode(['error' => 'Unsupported request method']);
}

// Close connection
$conn->close();

/**
 * Validate CSRF Token
 */
function validateCsrfToken($token)
{
    // For simplicity, this is a dummy token check.
    // In a real implementation, you would store the token on the server-side
    // and compare it with the token sent in the request.
    $valid_token = 'your_secure_csrf_token_here';
    return $token === $valid_token;
}

/**
 * Handle GET requests
 * Fetch data from the database.
 */
function handleGet($conn)
{
    $table = isset($_GET['table']) ? $_GET['table'] : null;
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if ($table) {
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM $table WHERE id = ?");
            $stmt->bind_param('i', $id);
        } else {
            $stmt = $conn->prepare("SELECT * FROM $table");
        }
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            echo json_encode($rows);
        } else {
            echo json_encode(['message' => 'No records found']);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => 'Table parameter is required']);
    }
}

/**
 * Handle POST requests
 * Insert data into the database.
 */
function handlePost($conn, $input)
{
    $table = isset($input['table']) ? $input['table'] : null;
    $data = isset($input['data']) ? $input['data'] : [];

    if ($table && !empty($data)) {
        $columns = implode(", ", array_keys($data));
        $placeholders = implode(", ", array_fill(0, count($data), '?'));
        $types = str_repeat('s', count($data)); // Assuming all values are strings for simplicity
        $values = array_values($data);

        $stmt = $conn->prepare("INSERT INTO $table ($columns) VALUES ($placeholders)");
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Record inserted successfully']);
        } else {
            echo json_encode(['error' => 'Insert failed: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => 'Table and data are required']);
    }
}

/**
 * Handle PUT requests
 * Update data in the database.
 */
function handlePut($conn, $input)
{
    $table = isset($input['table']) ? $input['table'] : null;
    $data = isset($input['data']) ? $input['data'] : [];
    $id = isset($input['id']) ? intval($input['id']) : null;

    if ($table && !empty($data) && $id) {
        $set = [];
        $types = '';
        $values = [];

        foreach ($data as $key => $value) {
            $set[] = "$key = ?";
            $types .= 's'; // Assuming all values are strings for simplicity
            $values[] = $value;
        }
        $values[] = $id; // Add the ID to the values array for the WHERE clause

        $set = implode(", ", $set);
        $stmt = $conn->prepare("UPDATE $table SET $set WHERE id = ?");
        $stmt->bind_param($types . 'i', ...$values);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Record updated successfully']);
        } else {
            echo json_encode(['error' => 'Update failed: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => 'Table, data, and ID are required']);
    }
}

/**
 * Handle DELETE requests
 * Delete data from the database.
 */
function handleDelete($conn, $input)
{
    $table = isset($input['table']) ? $input['table'] : null;
    $id = isset($input['id']) ? intval($input['id']) : null;

    if ($table && $id) {
        $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            echo json_encode(['message' => 'Record deleted successfully']);
        } else {
            echo json_encode(['error' => 'Delete failed: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => 'Table and ID are required']);
    }
}

?>
