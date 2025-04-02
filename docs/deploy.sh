
#!/bin/bash
# Deployment script for car rental system

# Configuration - UPDATED PATH
APP_DIR="/var/www/html/faturamento"
DIST_DIR="$APP_DIR/dist"
PUBLIC_DIR="$APP_DIR/public"
BACKUP_DIR="$APP_DIR/backups/$(date +%Y-%m-%d_%H-%M-%S)"

# Make sure we have the directories
mkdir -p "$DIST_DIR"
mkdir -p "$PUBLIC_DIR/api"  # Ensure the API directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting deployment process..."

# Backup current version
if [ -d "$DIST_DIR" ]; then
    echo "Backing up current version..."
    cp -r "$DIST_DIR" "$BACKUP_DIR/dist"
fi

if [ -d "$PUBLIC_DIR" ]; then
    echo "Backing up public directory..."
    cp -r "$PUBLIC_DIR" "$BACKUP_DIR/public"
fi

# Build the React app (if needed)
if [ -f "package.json" ]; then
    echo "Building React application..."
    npm install
    npm run build
    
    echo "Copying build files to deployment directory..."
    cp -r dist/* "$DIST_DIR/"
fi

# Copy API files
echo "Copying API files..."
mkdir -p "$PUBLIC_DIR/api"
cp -r public/api/* "$PUBLIC_DIR/api/"

# Ensure correct permissions for API files
chmod 755 "$PUBLIC_DIR/api/"*.php

# Copy .env file if it exists
if [ -f ".env" ]; then
    echo "Copying .env file..."
    cp .env "$APP_DIR/.env"
fi

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Check if Apache module headers is enabled
if ! apache2ctl -M 2>/dev/null | grep -q headers_module; then
    echo "Enabling Apache headers module..."
    a2enmod headers
    need_restart=true
fi

# Check if Apache module rewrite is enabled
if ! apache2ctl -M 2>/dev/null | grep -q rewrite_module; then
    echo "Enabling Apache rewrite module..."
    a2enmod rewrite
    need_restart=true
fi

# Restart Apache if needed
if [ "$need_restart" = true ]; then
    echo "Restarting Apache..."
    systemctl restart apache2
else
    echo "Reloading Apache..."
    systemctl reload apache2
fi

echo "Deployment completed successfully!"
