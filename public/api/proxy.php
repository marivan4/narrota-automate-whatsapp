
<?php
/**
 * Simple API proxy to avoid CORS issues with Asaas API
 * 
 * This script should be placed on your server at /api/proxy.php
 * Set VITE_USE_PROXY=true and VITE_PROXY_URL=/api/proxy.php in your environment
 */

// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, access_token, X-Target-URL");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the URL from query parameter or request body
$targetUrl = isset($_GET['url']) ? $_GET['url'] : null;

// If URL not in query params, check request body
if (!$targetUrl) {
    $requestBody = file_get_contents('php://input');
    $jsonBody = json_decode($requestBody, true);
    
    if ($jsonBody && isset($jsonBody['url'])) {
        $targetUrl = $jsonBody['url'];
        $method = isset($jsonBody['method']) ? $jsonBody['method'] : $_SERVER['REQUEST_METHOD'];
        $data = isset($jsonBody['data']) ? $jsonBody['data'] : null;
        $headers = isset($jsonBody['headers']) ? $jsonBody['headers'] : [];
    }
} else {
    $method = $_SERVER['REQUEST_METHOD'];
    $data = file_get_contents('php://input');
}

// Check for target URL header as well
$targetUrlHeader = isset($_SERVER['HTTP_X_TARGET_URL']) ? $_SERVER['HTTP_X_TARGET_URL'] : null;
if ($targetUrlHeader && !$targetUrl) {
    // Combine target URL from header with the request URI
    $targetUrl = $targetUrlHeader . $_SERVER['REQUEST_URI'];
}

if (!$targetUrl) {
    http_response_code(400);
    echo json_encode(['error' => 'Target URL not specified']);
    exit;
}

// Initialize cURL
$ch = curl_init($targetUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward the headers
$requestHeaders = [];
if (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    foreach ($allHeaders as $name => $value) {
        if (strtolower($name) !== 'host' && 
            strtolower($name) !== 'content-length' && 
            strtolower($name) !== 'x-target-url') {
            $requestHeaders[] = "$name: $value";
        }
    }
}

// If we have headers from JSON body, add them
if (isset($headers) && is_array($headers)) {
    foreach ($headers as $name => $value) {
        $requestHeaders[] = "$name: $value";
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);

// Handle request body for POST/PUT
if ($method === 'POST' || $method === 'PUT') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
}

// Return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Check for cURL errors
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy Error: ' . curl_error($ch)]);
    exit;
}

curl_close($ch);

// Forward the status code
http_response_code($httpCode);

// Forward the content type if available
if ($contentType) {
    header("Content-Type: $contentType");
}

// Output the response
echo $response;
