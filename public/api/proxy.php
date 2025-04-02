
<?php
/**
 * Simple API proxy to avoid CORS issues with Asaas API
 * 
 * This script should be placed on your server at /api/proxy.php
 * Set VITE_USE_PROXY=true and VITE_PROXY_URL=/api/proxy.php in your environment
 */

// Output debugging information to a log file
function debug_log($message) {
    $log_file = __DIR__ . '/proxy_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

debug_log("Proxy request received");

// Allow from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, access_token, X-Target-URL");
header("Access-Control-Max-Age: 3600");

// Log request details
debug_log("Request Method: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    debug_log("Handling OPTIONS preflight request");
    http_response_code(200);
    exit;
}

// Get the URL from query parameter or request body
$targetUrl = isset($_GET['url']) ? $_GET['url'] : null;
debug_log("Target URL from query: " . ($targetUrl ?? "none"));

// If URL not in query params, check request body
if (!$targetUrl) {
    debug_log("URL not in query params, checking request body");
    $requestBody = file_get_contents('php://input');
    debug_log("Request body: " . $requestBody);
    
    $jsonBody = json_decode($requestBody, true);
    
    if ($jsonBody && isset($jsonBody['url'])) {
        $targetUrl = $jsonBody['url'];
        $method = isset($jsonBody['method']) ? $jsonBody['method'] : $_SERVER['REQUEST_METHOD'];
        $data = isset($jsonBody['data']) ? $jsonBody['data'] : null;
        $headers = isset($jsonBody['headers']) ? $jsonBody['headers'] : [];
        
        debug_log("URL from request body: " . $targetUrl);
        debug_log("Method from request body: " . $method);
    }
} else {
    $method = $_SERVER['REQUEST_METHOD'];
    $data = file_get_contents('php://input');
    debug_log("Using query parameter URL with method: " . $method);
}

// Check for target URL header as well
$targetUrlHeader = isset($_SERVER['HTTP_X_TARGET_URL']) ? $_SERVER['HTTP_X_TARGET_URL'] : null;
debug_log("Target URL from header: " . ($targetUrlHeader ?? "none"));

if ($targetUrlHeader && !$targetUrl) {
    // Combine target URL from header with the request URI
    $targetUrl = $targetUrlHeader . $_SERVER['REQUEST_URI'];
    debug_log("Constructed URL from header and URI: " . $targetUrl);
}

if (!$targetUrl) {
    debug_log("ERROR: No target URL specified");
    http_response_code(400);
    echo json_encode(['error' => 'Target URL not specified']);
    exit;
}

// Initialize cURL
debug_log("Initializing cURL with target URL: " . $targetUrl);
$ch = curl_init($targetUrl);

// Set cURL options
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
debug_log("Setting cURL method to: " . $method);

// Forward the headers
$requestHeaders = [];
if (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    foreach ($allHeaders as $name => $value) {
        if (strtolower($name) !== 'host' && 
            strtolower($name) !== 'content-length' && 
            strtolower($name) !== 'x-target-url') {
            $requestHeaders[] = "$name: $value";
            debug_log("Adding header: $name: " . substr($value, 0, 30) . (strlen($value) > 30 ? "..." : ""));
        }
    }
}

// If we have headers from JSON body, add them
if (isset($headers) && is_array($headers)) {
    foreach ($headers as $name => $value) {
        $requestHeaders[] = "$name: $value";
        debug_log("Adding header from JSON body: $name: " . substr($value, 0, 30) . (strlen($value) > 30 ? "..." : ""));
    }
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);

// Handle request body for POST/PUT
if ($method === 'POST' || $method === 'PUT') {
    debug_log("Setting POST/PUT data: " . substr($data, 0, 100) . (strlen($data) > 100 ? "..." : ""));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
}

// Return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Enable verbose debug output
curl_setopt($ch, CURLOPT_VERBOSE, true);
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

// Execute the request
debug_log("Executing cURL request");
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

debug_log("Response HTTP code: " . $httpCode);
debug_log("Response content type: " . ($contentType ?? "none"));

// Log verbose info
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
debug_log("cURL verbose log:\n" . $verboseLog);

// Check for cURL errors
if (curl_errno($ch)) {
    $errorMessage = curl_error($ch);
    debug_log("cURL error: " . $errorMessage);
    
    http_response_code(500);
    echo json_encode(['error' => 'Proxy Error: ' . $errorMessage]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Forward the status code
debug_log("Forwarding status code: " . $httpCode);
http_response_code($httpCode);

// Forward the content type if available
if ($contentType) {
    debug_log("Setting content type: " . $contentType);
    header("Content-Type: $contentType");
}

// Output the response
debug_log("Response length: " . strlen($response));
debug_log("Sending response to client");
echo $response;

debug_log("Proxy request completed");
