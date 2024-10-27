<?php
// Database connection settings
$host = 'localhost'; // Your database host
$dbname = 'bel1'; // Your database name
$user = 'root'; // Your database username
$password = ''; // Your database password

try {
    // Create a new PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if this is a request to display data (no file involved)
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mainQrCode']) && !isset($_FILES['file'])) {
        // Fetch submodules based on Main QR Code (when displaying data)
        $mainQrCode = $_POST['mainQrCode'];

        // Query to fetch linked submodules, including file path and created_at
        $stmt = $pdo->prepare("SELECT submodule_name, sub_qr_code, remarks, status, file_path, saved_at 
                               FROM linked_submodules 
                               WHERE main_qr_code = :main_qr_code");
        $stmt->execute([':main_qr_code' => $mainQrCode]);

        $submodules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($submodules) {
            // Return the submodules in JSON format, including file path and timestamp
            echo json_encode(['status' => 'success', 'submodules' => $submodules]);
        } else {
            // If no submodules are found
            echo json_encode(['status' => 'error', 'message' => 'No submodules found for Main System QR Code: ' . $mainQrCode]);
        }

    // Check if this is a request to insert data (with file)
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
        // Handle file upload
        $uploadDir = 'uploads/'; // Directory to store uploaded files
        $uploadedFilePath = ''; // Will store the file path if a file is uploaded

        if ($_FILES['file']['error'] === 0) {
            $fileName = basename($_FILES['file']['name']);
            $filePath = $uploadDir . $fileName;

            // Move the uploaded file to the uploads directory
            if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
                $uploadedFilePath = $filePath; // Store the file path
            } else {
                echo json_encode(['status' => 'error', 'message' => 'File upload failed']);
                exit;
            }
        }

        // Insert form data and file path into the database
        $stmt = $pdo->prepare("INSERT INTO linked_submodules (main_qr_code, submodule_name, sub_qr_code, remarks, status, file_path) 
                               VALUES (:main_qr_code, :submodule_name, :sub_qr_code, :remarks, :status, :file_path)");

        $stmt->execute([
            ':main_qr_code' => $_POST['mainQrCode'],
            ':submodule_name' => $_POST['submoduleName'],
            ':sub_qr_code' => $_POST['subQrCode'],
            ':remarks' => $_POST['remarks'],
            ':status' => $_POST['status'],
            ':file_path' => $uploadedFilePath
        ]);

        if ($stmt->rowCount() > 0) {
            // Return success response if data is inserted
            echo json_encode(['status' => 'success', 'filePath' => $uploadedFilePath]);
        } else {
            // Return error if data is not inserted
            echo json_encode(['status' => 'error', 'message' => 'Failed to save data in the database.']);
        }

    } else {
        // Invalid request or missing data
        echo json_encode(['status' => 'error', 'message' => 'Invalid request. Missing data or file.']);
    }

} catch (PDOException $e) {
    // Handle any database-related errors
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
