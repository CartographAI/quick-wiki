# Repository Scanner
The [RepositoryScanner](/src/services/repositoryScanner.ts) class is responsible for scanning repository file structure and extracting file contents. It provides methods to get a tree representation of files, read the content of individual files, and efficiently read multiple files.

## Functionality

The primary functions of the `RepositoryScanner` include:

*   **File Tree Generation:** Creating a string representation of the repository's file system, similar to the output of the `tree` command.
*   **File Content Reading:** Reading the content of a file into a string, subject to size limitations and skipping binary files.
*   **Multiple File Reading:** Efficiently reading the content of multiple files in parallel.

## Usage

### Initialization

To use the `RepositoryScanner`, you first need to create an instance, providing the repository path:

```typescript
import { RepositoryScanner } from './services/repositoryScanner';

const repositoryPath = '/path/to/your/repository';
const scanner = new RepositoryScanner(repositoryPath);
```

### Getting the File Tree

The [getFileTree()](/src/services/repositoryScanner.ts#L7) method returns a string representing the file tree structure.

```typescript
const fileTree = await scanner.getFileTree();
console.log(fileTree);
```

This method uses the `tree` command-line utility. If the `tree` command is unavailable, an error will be thrown. It also supports `.gitignore` to exclude files.

### Reading File Content

The [readFileContent()](/src/services/repositoryScanner.ts#L27) method reads the content of a single file. It skips files larger than 1MB and identifies non-text files.

```typescript
const filePath = 'src/index.ts';
const content = await scanner.readFileContent(filePath);
console.log(content);
```

If the file is too large or cannot be read, a message indicating the error will be returned instead of the content.

### Reading Multiple Files

The [readMultipleFiles()](/src/services/repositoryScanner.ts#L48) method reads the content of multiple files concurrently, returning an array of [FileContent](/src/models/types.ts#L21) objects.

```typescript
const filePaths = ['src/index.ts', 'src/services/repositoryScanner.ts'];
const fileContents = await scanner.readMultipleFiles(filePaths);

fileContents.forEach(file => {
  console.log(`${file.path}: ${file.content.substring(0, 50)}...`); // Display first 50 characters
});
```

## Error Handling

The `RepositoryScanner` handles potential errors such as:

*   `tree` command not being available.
*   Files that are too large.
*   Files that cannot be read.

These errors are caught and appropriate messages are returned, preventing the application from crashing.
