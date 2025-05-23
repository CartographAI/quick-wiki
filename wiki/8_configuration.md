# Configuration

This page describes the different configuration options available for QuickWiki, including command-line arguments and environment variables, allowing users to customize the documentation generation process.

## Command-Line Arguments

QuickWiki's primary configuration is managed through command-line arguments, providing flexibility in how you run the tool. The main entry point is the [index.ts](/src/index.ts) file.

The basic command structure is:

```bash
npx quickwiki-ai <repository-path> [options]
```

### `<repository-path>`

This required argument specifies the path to the repository you want to document. It should be a valid path to a directory containing your codebase.

### `-o, --output <directory>`

This option allows you to specify the output directory for the generated documentation. If not provided, the default output directory will be `<repository-path>/wiki`.

Example:

```bash
npx quickwiki-ai /path/to/my/repo --output /path/to/my/docs
```

### `-k, --gemini-api-key <key>`

This option lets you directly provide your Google Gemini API key via the command line. This overrides the environment variable `GEMINI_API_KEY`. Consider using the environment variable approach for better security.

Example:

```bash
npx quickwiki-ai /path/to/my/repo --gemini-api-key YOUR_API_KEY
```

## Environment Variables

QuickWiki also supports configuration via environment variables. This approach is particularly useful for storing sensitive information like API keys.

### `GEMINI_API_KEY`

This environment variable is used to store your Google Gemini API key. If the `--gemini-api-key` command-line argument is not provided, QuickWiki will attempt to read the API key from this variable.

Setting the environment variable:

```bash
export GEMINI_API_KEY=YOUR_API_KEY
```

## Configuration Precedence

When both command-line arguments and environment variables are used, command-line arguments take precedence. For example, if you provide a Gemini API key via both the `--gemini-api-key` option and the `GEMINI_API_KEY` environment variable, the value provided via the command line will be used.

## Validation

QuickWiki uses the [validateRequiredArgs()](/src/utils/errorHandling.ts) function to validate that the required arguments (`repositoryPath` and `geminiApiKey`) are provided. If any of the required arguments are missing, the program will exit with an error message.

## Example Usage

To generate documentation for a repository located at `/home/user/my-project` and store the output in `/home/user/my-project-docs`, you can use the following command:

```bash
npx quickwiki-ai /home/user/my-project --output /home/user/my-project-docs
```

Make sure the `GEMINI_API_KEY` environment variable is set before running the command, or provide the API key using the `--gemini-api-key` option.
