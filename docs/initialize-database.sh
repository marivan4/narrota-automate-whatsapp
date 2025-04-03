
#!/bin/bash
# Database initialization script for the faturamento system

echo "==== Database Initialization ===="
echo "This script will set up the database for the faturamento system"
echo ""

# Default config
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="faturamento"
DB_USER="faturamento_user"
DB_PASS="senha_segura"

# Check if .env file exists and read config from it
ENV_FILE="/var/www/html/faturamento/.env"
if [ -f "$ENV_FILE" ]; then
    echo "Reading configuration from .env file..."
    
    # Extract database configuration from .env
    DB_HOST=$(grep VITE_DB_HOST "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')
    DB_USER=$(grep VITE_DB_USER "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')
    DB_PASS=$(grep VITE_DB_PASSWORD "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')
    DB_NAME=$(grep VITE_DB_NAME "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')
    DB_PORT=$(grep VITE_DB_PORT "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ')
    
    echo "Using database configuration from .env:"
    echo "  Host: $DB_HOST"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
else
    echo "No .env file found. Using default configuration."
    echo "You can create a .env file at $ENV_FILE"
fi

# Test MySQL connection
echo "Testing MySQL connection..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1" >/dev/null 2>&1; then
    echo "  MySQL connection successful"
else
    echo "  MySQL connection failed."
    echo "  Would you like to create the database user? (y/n)"
    read -r CREATE_USER
    
    if [ "$CREATE_USER" = "y" ]; then
        echo "  Enter MySQL root password:"
        read -s ROOT_PASS
        
        # Create the user and grant privileges
        mysql -h "$DB_HOST" -P "$DB_PORT" -u root -p"$ROOT_PASS" <<EOF
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
        
        if [ $? -eq 0 ]; then
            echo "  User created successfully."
        else
            echo "  Failed to create user. Please check your MySQL root credentials."
            exit 1
        fi
    else
        echo "  Please fix your database credentials and try again."
        exit 1
    fi
fi

# Create database if it doesn't exist
echo "Checking if database exists..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" >/dev/null 2>&1; then
    echo "  Database '$DB_NAME' already exists"
    
    # Check for existing tables
    TABLE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT COUNT(table_name) FROM information_schema.tables WHERE table_schema='$DB_NAME'" | tail -n 1)
    echo "  Found $TABLE_COUNT tables in the database"
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo "  Would you like to drop all existing tables and recreate them? (y/n)"
        read -r DROP_TABLES
        
        if [ "$DROP_TABLES" = "y" ]; then
            echo "  Dropping all tables..."
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SET FOREIGN_KEY_CHECKS=0;"
            
            # Get all tables and drop them
            TABLES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SHOW TABLES" "$DB_NAME" | grep -v "Tables_in")
            for table in $TABLES; do
                mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DROP TABLE $table"
            done
            
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SET FOREIGN_KEY_CHECKS=1;"
            echo "  All tables dropped"
        else
            echo "  Keeping existing tables"
            echo "  Script will only create missing tables (if any)"
        fi
    fi
else
    echo "  Creating database '$DB_NAME'..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    
    if [ $? -eq 0 ]; then
        echo "  Database created successfully"
    else
        echo "  Failed to create database"
        exit 1
    fi
fi

# Schema location
SCHEMA_FILE="/var/www/html/faturamento/src/database/schema.sql"
ASAAS_SCHEMA_FILE="/var/www/html/faturamento/src/database/asaas_tables.sql"

echo "Initializing database schema..."
if [ -f "$SCHEMA_FILE" ]; then
    echo "  Running main schema script..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        echo "  Schema initialization successful"
    else
        echo "  Schema initialization failed"
        exit 1
    fi
else
    echo "  Schema file not found at $SCHEMA_FILE"
    exit 1
fi

# Run Asaas schema if available
if [ -f "$ASAAS_SCHEMA_FILE" ]; then
    echo "  Running Asaas schema script..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$ASAAS_SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        echo "  Asaas schema initialization successful"
    else
        echo "  Asaas schema initialization failed, but continuing anyway"
    fi
else
    echo "  Asaas schema file not found at $ASAAS_SCHEMA_FILE"
fi

# Create a test user if users table exists and is empty
echo "Checking if we need to create a test user..."
USER_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" -e "SELECT COUNT(*) FROM users" "$DB_NAME" 2>/dev/null | tail -n 1)

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "  Creating a test admin user..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES ('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW());
EOF
    
    if [ $? -eq 0 ]; then
        echo "  Created test admin user:"
        echo "    Email: admin@example.com"
        echo "    Password: password"
    else
        echo "  Failed to create test user"
    fi
fi

echo ""
echo "==== Database Initialization Complete ===="
echo "Test the database connection with:"
echo "curl https://app7.narrota.com.br/api/verify-database.php"
echo ""
