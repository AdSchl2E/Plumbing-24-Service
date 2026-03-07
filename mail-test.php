<?php
// Display PHP info
phpinfo();

// Test mail function
if(function_exists('mail')) {
    echo "PHP mail() function is enabled";
    
    // Try sending a test email
    $result = mail("contact@plumbing24service.com", "Test Subject", "Test Message");
    echo "<br>Mail send attempt result: " . ($result ? "Success" : "Failed");
} else {
    echo "PHP mail() function is disabled";
}
?>