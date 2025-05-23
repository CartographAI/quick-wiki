# Data Flow
The data flow through QuickWiki encompasses several stages, starting from scanning the repository to generating comprehensive documentation. This process involves the [RepositoryScanner](/src/services/repositoryScanner.ts), [GeminiService](/src/services/geminiService.ts), and [DocumentationGenerator](/src/services/documentationGenerator.ts) working in concert under the coordination of the [Orchestrator](/src/services/orchestrator.ts).

## Repository Scanning
The process begins with the [RepositoryScanner](/src/services/repositoryScanner.ts), which builds a representation of the project's file structure.

### File Tree Generation
The [getFileTree()](/src/services/repositoryScanner.ts#L7) method leverages the `tree` command-line utility to create a string representation of the directory structure, respecting `.gitignore` rules. This command must be installed separately.

```typescript
import { execSync } from 'child_process';

async getFileTree(): Promise<string> {
  const treeOutput = execSync(`tree --gitignore "${this.repositoryPath}"`).toString();
  return treeOutput;
}
```

### File Content Reading
Individual files are read by the [readFileContent()](/src/services/repositoryScanner.ts#L30) method, which skips large or binary files to optimize performance. The [readMultipleFiles()](/src/services/repositoryScanner.ts#L52) function reads the content of multiple files concurrently and returns the data in a structured format.

## LLM-Driven Analysis and Structuring
Once the file structure and initial file contents are obtained, the [GeminiService](/src/services/geminiService.ts) uses Google's Gemini API to analyze the code and propose a documentation structure.

### Relevant File Selection
The [selectRelevantFiles()](/src/services/geminiService.ts#L66) method uses the file tree and initial file contents to select the most important files for documentation. This selection process can be performed iteratively, with each step refining the selection based on previous selections.

### Documentation Structure Generation
The [generateDocStructure()](/src/services/geminiService.ts#L125) method takes the file contents and generates a structured documentation outline. This structure consists of a hierarchy of pages, each with a title, description, and a list of relevant files. The [DocStructure](/src/models/types.ts#L9) interface defines this data structure.

```typescript
interface DocStructure {
  pages: DocPage[];
}

interface DocPage {
  id: string;
  title: string;
  description: string;
  relevantFilePaths: string[];
  subPages: string[] | null;
}
```

## Documentation Generation

The [DocumentationGenerator](/src/services/documentationGenerator.ts) takes the generated [DocStructure](/src/models/types.ts#L9) and creates the markdown files.

### Page Content Generation
For each page in the documentation structure, the [generatePageMarkdown()](/src/services/documentationGenerator.ts#L48) method calls [GeminiService.generatePageContent()](/src/services/geminiService.ts#L175) to produce the markdown content. The LLM is provided with the page's description and relevant file contents, allowing it to generate a summary tailored to the specific topic. The Gemini prompt provides strict formatting rules.

### Writing Documentation Files
The [writeDocPage()](/src/services/documentationGenerator.ts#L53) method writes the generated markdown to a file in the output directory, using the page ID as the filename.

### Index Page Creation
The [generateIndexPage()](/src/services/documentationGenerator.ts#L57) method creates an `index.md` file that serves as the table of contents for the documentation. This index links to all generated documentation pages.
