
#!/usr/bin/env python3
"""
Simple HTTP server for serving the React application
This script replaces the previous version that had PHP dependencies
"""

import os
import sys
import time
import logging
import argparse
import http.server
import socketserver
from pathlib import Path
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(
    filename="server.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Global variables
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dist"))
PORT = 8000
ALLOWED_EXTENSIONS = [
    '.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', 
    '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'
]

class ReactAppHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for serving React application."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self) -> None:
        """Handle GET requests."""
        # Security check to prevent directory traversal
        requested_path = os.path.normpath(self.path).lstrip('/')
        if '..' in requested_path or requested_path.startswith('/'):
            self.send_error(403, "Forbidden")
            return
            
        # For API-like requests that would previously go to PHP, redirect to index.html
        # This allows the React app to handle routing
        if self.path.startswith('/api/'):
            logging.info(f"API request redirected to React app: {self.path}")
            self.path = '/'
        
        # For client-side routing, serve index.html for all routes except static files
        _, ext = os.path.splitext(self.path)
        if ext == '' or ext not in ALLOWED_EXTENSIONS:
            logging.info(f"Route request redirected to React app: {self.path}")
            self.path = '/'
            
        # Log the request
        logging.info(f"Request: {self.path}")
        
        return super().do_GET()
    
    def log_message(self, format: str, *args: Any) -> None:
        """Override log_message to use our logger."""
        logging.info(f"{self.address_string()} - {format % args}")

def main() -> None:
    """Main function to run the server."""
    parser = argparse.ArgumentParser(description="React Application Server")
    parser.add_argument('--port', type=int, default=PORT, help='Server port')
    parser.add_argument('--directory', type=str, default=DIRECTORY, help='Directory to serve')
    args = parser.parse_args()
    
    if args.directory:
        global DIRECTORY
        DIRECTORY = os.path.abspath(args.directory)
    
    if not os.path.exists(DIRECTORY):
        print(f"Error: Directory '{DIRECTORY}' does not exist")
        print("Make sure you've built the React application with 'npm run build'")
        sys.exit(1)
    
    handler = ReactAppHandler
    
    with socketserver.TCPServer(("", args.port), handler) as httpd:
        host = "localhost" if args.port == 8000 else "0.0.0.0"
        print(f"Server running at http://{host}:{args.port}/")
        print(f"Serving from directory: {DIRECTORY}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()
