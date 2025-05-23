#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}QuickWiki Documentation Generator${NC}"
echo "-------------------------------"

# Define paths
REPO_PATH=$(pwd)
DOCS_PATH="${REPO_PATH}/wiki"

# Check if .env file exists with GEMINI_API_KEY
if [ ! -f "${REPO_PATH}/.env" ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo "Please create a .env file in the project root with your Google Gemini API key:"
  echo "GEMINI_API_KEY=your_api_key_here"
  exit 1
fi

# Check if the API key is set
if ! grep -q "GEMINI_API_KEY=" "${REPO_PATH}/.env"; then
  echo -e "${RED}Error: GEMINI_API_KEY not found in .env file!${NC}"
  echo "Please add your Google Gemini API key to the .env file:"
  echo "GEMINI_API_KEY=your_api_key_here"
  exit 1
fi

# Build the project if dist directory doesn't exist
if [ ! -d "${REPO_PATH}/dist" ]; then
  echo -e "${YELLOW}Building project...${NC}"
  npm run build
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
  fi
fi

# Generate documentation
echo -e "${YELLOW}Generating documentation...${NC}"
node dist/index.js "${REPO_PATH}"

# Check if documentation was generated successfully
if [ $? -ne 0 ]; then
  echo -e "${RED}Documentation generation failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Documentation generated successfully!${NC}"
echo -e "Documentation is available at: ${DOCS_PATH}"

# Ask if the user wants to view the documentation
read -p "Do you want to view the documentation? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Check if a Markdown viewer is installed
  if command -v glow &> /dev/null; then
    echo -e "${YELLOW}Opening documentation with glow...${NC}"
    glow "${DOCS_PATH}/index.md"
  elif command -p open &> /dev/null; then
    # On macOS, try to open with default app
    echo -e "${YELLOW}Opening documentation with default Markdown viewer...${NC}"
    open "${DOCS_PATH}/index.md"
  else
    echo -e "${YELLOW}Please open ${DOCS_PATH}/index.md in your Markdown viewer.${NC}"
  fi
fi

echo -e "${GREEN}Done!${NC}"