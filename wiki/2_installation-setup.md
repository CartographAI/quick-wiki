# Installation and Setup

This document details the installation and setup process for QuickWiki, including system requirements, dependencies, and configuration.

## System Requirements

QuickWiki requires the following:

*   Node.js 16+
*   TypeScript
*   `tree` command-line utility with `--gitignore` support.
*   Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installing Dependencies

1.  **Node.js and npm:** Ensure Node.js and npm are installed. It is recommended to use Node.js version 16 or higher. You can download it from [https://nodejs.org/](https://nodejs.org/).
2.  **Gemini API Key:** Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and set it as an environment variable. Add the following line to your `.env` file at the root of the project:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

    Alternatively, you can pass the API key via the command line.
3. **Tree:** The `tree` command-line utility is required for scanning the repository's file structure. Install it using your system's package manager:

    *   macOS: `brew install tree`
    *   Debian/Ubuntu: `apt-get install tree`
    *   CentOS/RHEL: `yum install tree`

    Ensure that the installed version supports JSON output format (`--gitignore -J`). Version 1.7.0 or later is recommended.
4.  **QuickWiki Package:** Install the `quickwiki-ai` package globally using npm:

    ```bash
    npm install -g quickwiki-ai
    ```

## Configuration

1.  **.env file:** Create a `.env` file in the root directory of your project and add your Gemini API key as described above.
2.  **Command-line options:** You can configure QuickWiki using command-line options when running the `quickwiki-ai` command. The available options are:
    *   `<repository-path>`: Path to the repository to document.
    *   `-o, --output <directory>`: Custom output directory (default: `<repository-path>/wiki`).
    *   `-k, --gemini-api-key <key>`: Provide API key via command line instead of environment variable.

    Example:

    ```bash
    npx quickwiki-ai /path/to/your/repo -o /path/to/output/directory -k your_api_key
    ```

## Verification

You can use the provided [verify-installation.sh](/verify-installation.sh) script to verify that all dependencies are installed and configured correctly. This script checks for the presence of the `tree` command, the `.env` file, Node.js, and npm. It also attempts to build the project.

To run the verification script:

```bash
./verify-installation.sh
```

## Troubleshooting

*   **Missing Dependencies:** If you encounter errors related to missing dependencies, ensure that Node.js, npm, and the `tree` command are installed correctly. Double-check that the paths are correctly set in your system's environment variables.
*   **API Key Issues:** Verify that your Gemini API key is valid and correctly set in the `.env` file or passed via the command line.
*   **Permissions:** Ensure that you have the necessary permissions to read the repository files and write to the output directory.

## Local Development Setup

For local development, you can use the following commands:

*   `npm install`: Installs the project dependencies.
*   `npm run build`: Compiles the TypeScript code.
*   `npm run dev`: Runs the project in development mode using `ts-node`.
*   `npm run test`: Runs the test suite using Jest.
