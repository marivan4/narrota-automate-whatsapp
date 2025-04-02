
#!/bin/bash
# Deployment script for car rental system

# Configuration
APP_DIR="/var/www/app7.narrota.com.br"
DIST_DIR="$APP_DIR/dist"
PUBLIC_DIR="$APP_DIR/public"
BACKUP_DIR="$APP_DIR/backups/$(date +%Y-%m-%d_%H-%M-%S)"

# Make sure we have the directories
mkdir -p "$DIST_DIR"
mkdir -p "$PUBLIC_DIR"
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

# Copy .env file if it exists
if [ -f ".env" ]; then
    echo "Copying .env file..."
    cp .env "$APP_DIR/.env"
fi

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Restart Apache
echo "Restarting Apache..."
systemctl restart apache2

echo "Deployment completed successfully!"
