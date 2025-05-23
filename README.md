# npx quickwiki-ai 📚

<div align="center">

[![NPM version](https://img.shields.io/npm/v/quickwiki-ai.svg)](https://www.npmjs.com/package/quickwiki-ai)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Automated codebase documentation powered by Gemini**

**Like DeepWiki but fast, runs locally and under your control**

[Features](#-features) • [Usage](#-usage) • [How It Works](#-how-it-works)

</div>

> 🤔 Want to see what QuickWiki can do? Check out [its own documentation](https://github.com/CartographAI/quickwiki/blob/master/wiki/index.md) - yes, we used QuickWiki to document itself!

## 🚀 Features

- 🤖 **Fully Automated**: Just point it at your repository and get a complete wiki with zero human input
- 📊 **Smart Architecture Analysis**: Generates architectural overviews, diagrams, and code explanations
- ⚡ **Fast & Affordable**: Uses Google's Gemini models for quick, cost-effective processing
- 🔒 **Privacy First**: Runs locally with your own API key
- 📝 **Markdown Output**: Clean, readable files that you can use with other AI tools
- 📈 **Visual Documentation**: Auto-generates Mermaid diagrams for architecture and workflows

## 💻 Usage

### 🏃 Quick Start

If you don't have a Gemini API key, get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_api_key

# Generate docs for your repository
npx quickwiki-ai /path/to/your/repo
```

Your docs will be generated in a minute or two! They will be in the `wiki` directory by default.

### Command Line Options

```bash
npx quickwiki-ai <repository-path> [options]
```

Options:

- `-o, --output <directory>`: Custom output directory (default: <repository-path>/wiki)
- `-k, --gemini-api-key <key>`: Provide API key via command line instead of environment variable

## ⚙️ How It Works

QuickWiki uses Gemini 2.0 Flash to generate documentation in three steps:

1. **Explore Codebase**

   - Scans repository structure and identifies key files
   - Uses AI to select the most relevant files in two passes
   - Builds comprehensive understanding of your codebase

2. **Generate Documentation Structure**

   - Generates documentation outline with pages and sections
   - Identifies relevant files for each documentation topic

3. **Generate Documentation Pages**
   - Creates each page using relevant code context
   - Auto-generates diagrams and code explanations
   - Builds navigation and links everything together

## 🛠️ Requirements

- Node.js 16+
- TypeScript
- `tree` command-line utility with `--gitignore` support
- Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))
