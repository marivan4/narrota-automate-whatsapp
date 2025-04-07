
#!/bin/bash
# Script to run the React application server

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "Python 3 is not installed. Please install it first."
    exit 1
fi

# Make the script executable
chmod +x "$(dirname "$0")/clean_and_serve.py"

# Build the React app if the dist directory doesn't exist
if [ ! -d "$(dirname "$0")/../../dist" ]; then
    echo "Building React application..."
    npm run build || {
        echo "Failed to build React application. Make sure you have run 'npm install' first."
        exit 1
    }
fi

# Run the server
echo "Starting the React application server..."
python3 "$(dirname "$0")/clean_and_serve.py"
