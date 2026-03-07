<?php
// Prevent error output from contaminating JSON response
error_reporting(0);
ini_set('display_errors', 0);

// Set JSON content type
header('Content-Type: application/json');

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Start output buffering to catch any unwanted output
ob_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        $name = $_POST['from_name'] ?? '';
        $email = $_POST['from_email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $service = $_POST['service'] ?? '';
        $message = $_POST['message'] ?? '';

        $to = "contact@plumbing24service.com";
        $subject = "New Contact Form Submission from $name";
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";

        $emailBody = "
        <html>
        <body>
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Phone:</strong> {$phone}</p>
            <p><strong>Service:</strong> {$service}</p>
            <p><strong>Message:</strong><br>{$message}</p>
        </body>
        </html>";

        $mailResult = mail($to, $subject, $emailBody, $headers);

        // Clear any output buffer
        ob_clean();

        if ($mailResult) {
            echo json_encode([
                "success" => true,
                "message" => "Message sent successfully"
            ]);
        } else {
            throw new Exception("Failed to send email");
        }
    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
} else {
    ob_clean();
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}

// End output buffering
ob_end_flush();
?>