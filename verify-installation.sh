#!/bin/bash

# Verify that the tree command is installed
if ! command -v tree &> /dev/null; then
  echo "Error: 'tree' command is not installed."
  echo "Please install it using your package manager:"
  echo "  - macOS: brew install tree"
  echo "  - Debian/Ubuntu: apt-get install tree"
  echo "  - CentOS/RHEL: yum install tree"
  exit 1
fi

# Verify that tree has JSON output support
if ! tree --version | grep -q "1\.[7-9]"; then
  echo "Warning: Your tree version might not support JSON output format (--gitignore -J)."
  echo "Please install version 1.7.0 or later."
fi

# Verify environment configuration
if [ ! -f .env ]; then
  echo "Warning: .env file not found."
  echo "Please create a .env file with your Gemini API key:"
  echo "GEMINI_API_KEY=your_api_key_here"
fi

# Verify Node.js installation
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed."
  echo "Please install Node.js from https://nodejs.org/ (version 16+ recommended)"
  exit 1
fi

# Verify npm installation
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed."
  echo "Please install npm (usually comes with Node.js)"
  exit 1
fi

# Run npm install if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run TypeScript build
echo "Building project..."
npm run build

echo "Verification complete! The environment appears to be set up correctly."
echo "You can now use QuickWiki to generate documentation:"
echo "npm start -- /path/to/your/repository"