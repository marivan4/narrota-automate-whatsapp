
#!/bin/bash
# Script to diagnose and fix API access issues

echo "==== API Access Diagnostics and Repair ===="
echo "This script will diagnose and attempt to fix common API access issues"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  echo "Please run: sudo bash fix-api-access.sh"
  exit 1
fi

# Define paths
APP_DIR="/var/www/html/faturamento"
VHOST_CONFIG="/etc/apache2/sites-available/app7.narrota.com.br.conf"
API_DIR="$APP_DIR/public/api"

echo "1. Checking directory structure..."
mkdir -p "$API_DIR"
echo "  - API directory: $(ls -la "$API_DIR" | wc -l) files found"

echo "2. Checking Apache configuration..."
if [ -f "$VHOST_CONFIG" ]; then
  echo "  - VirtualHost config file exists"
  
  # Check if the Alias directive exists
  if grep -q "Alias /api" "$VHOST_CONFIG"; then
    echo "  - Alias directive found"
  else
    echo "  - Alias directive missing, adding it"
    # Find the closing VirtualHost tag and insert before it
    sed -i '/<\/VirtualHost>/i \    # API Alias\n    Alias \/api \/var\/www\/html\/faturamento\/public\/api' "$VHOST_CONFIG"
  fi
else
  echo "  - VirtualHost config file missing!"
  echo "  - Creating a basic VirtualHost config"
  
  # Create a basic VirtualHost configuration
  cat > "$VHOST_CONFIG" << EOL
<VirtualHost *:443>
    ServerName app7.narrota.com.br
    ServerAdmin webmaster@narrota.com.br
    DocumentRoot /var/www/html/faturamento/dist

    # Enable SSL
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/app7.narrota.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/app7.narrota.com.br/privkey.pem

    # API Alias
    Alias /api /var/www/html/faturamento/public/api

    # API directory configuration
    <Directory "/var/www/html/faturamento/public/api">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Enable CORS for API
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Directory>

    # SPA routing
    <Directory "/var/www/html/faturamento/dist">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    ServerName app7.narrota.com.br
    Redirect permanent / https://app7.narrota.com.br/
</VirtualHost>
EOL
fi

echo "3. Checking Apache modules..."
for module in alias rewrite headers ssl; do
  if a2query -m $module >/dev/null 2>&1; then
    echo "  - $module module is enabled"
  else
    echo "  - Enabling $module module"
    a2enmod $module
    need_restart=true
  fi
done

echo "4. Checking API file permissions..."
chown -R www-data:www-data "$API_DIR"
chmod -R 755 "$API_DIR"
find "$API_DIR" -name "*.php" -exec chmod 644 {} \;
echo "  - Permissions set to www-data:www-data with 755 for directories and 644 for PHP files"

echo "5. Creating test API file..."
cat > "$API_DIR/test.php" << EOL
<?php
header("Content-Type: application/json");
echo json_encode([
    'success' => true,
    'message' => 'API is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => [
        'software' => \$_SERVER['SERVER_SOFTWARE'],
        'document_root' => \$_SERVER['DOCUMENT_ROOT'],
        'script_filename' => \$_SERVER['SCRIPT_FILENAME']
    ]
]);
EOL
chmod 644 "$API_DIR/test.php"
chown www-data:www-data "$API_DIR/test.php"
echo "  - Test API file created: /api/test.php"

echo "6. Creating API .htaccess file..."
cat > "$API_DIR/.htaccess" << EOL
# Enable rewrite engine
RewriteEngine On

# Handle OPTIONS method for CORS preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Set proper content type for PHP files
<FilesMatch "\.php$">
    SetHandler application/x-httpd-php
</FilesMatch>

# Enable CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
EOL
chmod 644 "$API_DIR/.htaccess"
chown www-data:www-data "$API_DIR/.htaccess"
echo "  - .htaccess file created"

echo "7. Enabling the site in Apache..."
a2ensite app7.narrota.com.br.conf >/dev/null 2>&1
echo "  - Site enabled"

echo "8. Restarting Apache..."
systemctl restart apache2
echo "  - Apache restarted"

echo "9. Testing API access..."
if curl -s https://app7.narrota.com.br/api/test.php > /dev/null; then
  echo "  - API access successful! Test the API with:"
  echo "    curl https://app7.narrota.com.br/api/test.php"
else
  echo "  - API access failed. Check Apache error logs:"
  echo "    tail -f /var/log/apache2/error.log"
fi

echo ""
echo "==== Diagnostics and Repair Complete ===="
echo "If issues persist, check the Apache error logs and the API diagnose.php script:"
echo "curl https://app7.narrota.com.br/api/diagnose.php"
echo ""
