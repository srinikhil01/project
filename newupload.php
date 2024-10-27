<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Establish a connection to the MySQL database
    $conn = mysqli_connect("localhost", "root", "", "bel1");

    // Check connection
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    // Target directory for file uploads
    $targetDir = "uploads/";

    // Ensure the uploads directory exists
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // Check if the file was uploaded successfully
    if (isset($_FILES['tmr']) && $_FILES['tmr']['error'] === UPLOAD_ERR_OK) {
        $filename = basename($_FILES["tmr"]["name"]);
        $targetPath = $targetDir . $filename;

        // Validate file type (allow PDF, DOCX, TXT, PNG)
        $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
        $allowedTypes = array("pdf", "doc", "docx", "txt", "png"); // PNG added
        
        // Ensure MIME type matches the expected types (added "image/png" for PNG files)
        $mimeType = mime_content_type($_FILES["tmr"]["tmp_name"]);
        $allowedMimeTypes = array(
            "application/pdf", 
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            "text/plain", 
            "image/png" // PNG added
        );
        
        if (!in_array($fileType, $allowedTypes) || !in_array($mimeType, $allowedMimeTypes)) {
            die("<script>alert('Invalid file type or MIME type. Only PDF, DOC, DOCX, TXT, and PNG files are allowed.');</script>");
        }

        // Moving the uploaded file to the target directory
        if (move_uploaded_file($_FILES["tmr"]["tmp_name"], $targetPath)) {
            // Prepare SQL statement to prevent SQL injection
            $sql = "INSERT INTO uploads (qr_scan, test_stage, tmr_file, file_path, problem_faced, solution, remarks, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);

            // Check if prepare() failed
            if ($stmt === false) {
                die("Error in SQL statement: " . $conn->error);
            }

            // Collect form data
            $qr_scan = htmlspecialchars($_POST['qr-scan']);
            $test_stage = htmlspecialchars($_POST['test-stage']);
            $problem_faced = htmlspecialchars($_POST['problem-faced']);
            $solution = htmlspecialchars($_POST['solution']);
            $remarks = htmlspecialchars($_POST['remarks']);
            
            // If the timestamp is not provided from the frontend, use the current date and time in MySQL format
            $timestamp = empty($_POST['timestamp']) ? date('Y-m-d H:i:s') : $_POST['timestamp'];
            
            $tmr_file = $filename; // Assign the file name here

            // Bind the parameters
            $stmt->bind_param("ssssssss", $qr_scan, $test_stage, $tmr_file, $targetPath, $problem_faced, $solution, $remarks, $timestamp);

            // Execute the query
            if ($stmt->execute()) {
                // Show success message with alert, but stay on the same page
                echo "<script>alert('File uploaded and data saved to the database.');</script>";
            } else {
                echo "<p style='color: red;'>Error: " . $stmt->error . "</p>";
            }

            // Close the prepared statement
            $stmt->close();
        } else {
            echo "<script>alert('Error moving the file.');</script>";
        }
    } else {
        echo "<script>alert('File not uploaded. Error Code: " . $_FILES['tmr']['error'] . "');</script>";
    }

    // Close the database connection
    $conn->close();
}
?>
