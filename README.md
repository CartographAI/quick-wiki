# QuickWiki

QuickWiki is an automated documentation generator for codebases. It analyzes repositories by examining file structures and contents, then leverages Google's Gemini LLM to generate insightful, well-structured documentation that includes diagrams, code explanations, and architectural overviews.

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/quick-wiki.git
cd quick-wiki

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Create a `.env` file in the project root with your Google Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

You can obtain a Gemini API key from the [Google AI Studio](https://makersuite.google.com/).

## Usage

```bash
# Generate documentation for a repository
npx quick-wiki /path/to/repository

# Specify a custom output directory
npx quick-wiki /path/to/repository -o /path/to/output

# Provide API key via command line
npx quick-wiki /path/to/repository -k your_api_key_here
```

### Development Commands

```bash
# Test repository scanner
npm run dev -- test-scan /path/to/repository

# Test file reading
npm run dev -- test-read /path/to/repository path/to/file

# Test Gemini API connection
npm run dev -- test-gemini
```

## Features

- **Automated Documentation Generation**: Creates comprehensive documentation with minimal human intervention
- **Codebase Analysis**: Analyzes repository structure and file contents
- **Markdown Output**: Generates flat, easy-to-navigate documentation structure
- **Visual Aids**: Incorporates Mermaid diagrams for better understanding
- **Logical Organization**: Creates documentation with a hierarchical structure

## Requirements

- Node.js 16+
- TypeScript
- `tree` command-line utility with `--gitignore` support
- Google Gemini API key

## License

MIT
