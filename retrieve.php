<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Enable error reporting for debugging
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $conn = mysqli_connect("localhost", "root", "", "bel1");

    if (!$conn) {
        echo json_encode(["status" => "error", "message" => "Connection failed."]);
        exit();
    }

    $qr_code = $_POST['retrieveQrCode'];

    $sql = "SELECT * FROM uploads WHERE qr_scan = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => "SQL Error."]);
        exit();
    }

    $stmt->bind_param("s", $qr_code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();

        // Construct the file path for viewing (no download)
        $filePath = $row['file_path'];
        $fileLink = !empty($filePath) ? "<a href='" . htmlspecialchars($filePath) . "' target='_blank'>View File</a>" : 'No file available';

        // Return the JSON response
        echo json_encode([
            "status" => "success",
            "test_stage" => $row['test_stage'],
            "problem_faced" => $row['problem_faced'],
            "solution" => $row['solution'],
            "remarks" => $row['remarks'],
            "file_link" => $fileLink,  // Send the file link
            "timestamp" => $row['timestamp']
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "No data found for the provided QR code."]);
    }

    $stmt->close();
    $conn->close();
}
?>
