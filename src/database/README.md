
# Car Rental System Database Setup

This document provides instructions for setting up the MySQL database for the Car Rental System application.

## Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- PHP 8.1+ (for PHP integration)
- MySQL client or phpMyAdmin for database management

## Setup Instructions

### 1. Create the Database and Tables

There are two ways to create the database structure:

#### Option 1: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u username -p

# Create and use the database
CREATE DATABASE car_rental_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_rental_system;

# Import the schema (from terminal, not MySQL prompt)
mysql -u username -p car_rental_system < schema.sql
```

#### Option 2: Using phpMyAdmin

1. Login to phpMyAdmin
2. Create a new database named `car_rental_system` with collation `utf8mb4_unicode_ci`
3. Select the database and go to the "Import" tab
4. Choose the `schema.sql` file and click "Go"

### 2. Configure Database Connection

For PHP applications, update the database connection parameters in your application:

```php
$host = 'localhost';      // Database host
$dbname = 'car_rental_system'; // Database name
$username = 'root';       // Database username
$password = '';           // Database password
```

### 3. Default Credentials

After setup, you can login with these default credentials:

- **Email:** admin@example.com
- **Password:** admin123

## Database Schema Overview

The database includes the following main tables:

- `users` - System users (admin, managers, staff)
- `user_profiles` - Additional user information
- `clients` - Customer information
- `vehicles` - Vehicle inventory and details
- `contracts` - Rental contracts
- `invoices` - Payment invoices
- `checklists` - Vehicle inspection checklists
- `whatsapp_configs` - WhatsApp integration settings
- `settings` - System configuration settings

## PHP Integration

An example PHP connection file is provided in `php_connection_example.php`. This file demonstrates:

- Connecting to the database using PDO
- Basic CRUD operations for different entities
- Error handling
- Working with WhatsApp configurations

## Important Notes

1. For production use, always:
   - Use strong, unique passwords
   - Restrict database user privileges
   - Enable SSL for database connections
   - Store sensitive configuration separately from code

2. The schema includes sample data for testing. You may want to remove this for production.

3. Regular backups of your database are essential to prevent data loss.
