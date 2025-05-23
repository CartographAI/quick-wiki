# Technical Specification: QuickWiki Documentation Generator

## 1. Context & Goals

### 1.1 Project Overview

QuickWiki is a TypeScript-based documentation generator that automatically creates comprehensive documentation for codebases. It analyzes repositories by examining file structures and contents, then leverages Google's Gemini LLM to generate insightful, well-structured documentation that includes diagrams, code explanations, and architectural overviews.

### 1.2 Core Goals

- Create an automated system that generates high-quality documentation with minimal human intervention
- Provide comprehensive insights into the codebase's architecture, workflows, and components
- Generate documentation that includes visual aids (Mermaid diagrams) for better understanding
- Produce a flat, easy-to-navigate documentation structure with logical organization

## 2. Technical Requirements

### 2.1 Environment

- **Language**: TypeScript
- **Runtime**: Node.js
- **External Tools**:
  - `tree` command-line utility (with `--gitignore` support)
  - Google Gemini API
  - File system access

### 2.2 Authentication

- Authentication via Google Gemini API key provided as environment variable `GEMINI_API_KEY`

### 2.3 Repository Analysis Capabilities

- Parse file tree structure using `tree --gitignore`
- Read file contents for analysis
- Handle repositories with up to 1000 files
- Process various file types (code, configuration, documentation) similarly

### 2.4 Documentation Output

- Generate flat markdown files in the `wiki` directory
- Use hierarchical naming convention (e.g., "1_project-overview", "1-1_architecture")
- Include Mermaid diagrams for visualizations
- Support standard markdown components (headings, code blocks, tables)

## 3. System Architecture

### 3.1 High-Level Components

1. **Repository Scanner**: Analyzes the repository structure
2. **File Analyzer**: Reads and processes file contents
3. **LLM Interaction Layer**: Manages communication with Google Gemini
4. **Documentation Generator**: Creates and writes markdown documentation files
5. **Orchestrator**: Coordinates the overall process

### 3.2 Process Flow

1. Scan repository structure using `tree --gitignore`
2. First LLM interaction: Request 50 most relevant files for overview
3. Read those 50 files and send contents to LLM
4. Second LLM interaction: Request additional files to analyze
5. Read additional files and send all gathered information to LLM
6. Third LLM interaction: Generate documentation structure and page outlines
7. For each page:
   - Start new LLM conversation with relevant file contents
   - Generate detailed page content
   - Write to markdown file in output directory

### 3.3 File Tree Structure

The project follows a structured organization of files and directories:

```
.
├── README.md                     # Project overview and usage instructions
├── generate-docs.sh              # Script to generate documentation
├── jest.config.js                # Jest testing configuration
├── package-lock.json             # NPM dependencies lock file
├── package.json                  # Project metadata and dependencies
├── progress.md                   # Development progress tracking
├── src                           # Source code directory
│   ├── index.ts                  # Main entry point
│   ├── models                    # Data models and interfaces
│   │   └── types.ts              # Type definitions for the application
│   ├── services                  # Core services
│   │   ├── documentationGenerator.ts  # Generates markdown documentation
│   │   ├── geminiService.ts      # Handles Gemini API communication
│   │   ├── orchestrator.ts       # Coordinates the documentation process
│   │   └── repositoryScanner.ts  # Scans repository and reads files
│   ├── tests                     # Test files
│   │   └── repositoryScanner.test.ts  # Tests for repository scanner
│   └── utils                     # Utility functions
│       └── errorHandling.ts      # Error handling utilities
├── technical-spec.md             # Technical specification
├── tsconfig.json                 # TypeScript configuration
└── verify-installation.sh        # Installation verification script
```

This structure organizes the code logically with:

- Configuration files at the root level
- Source code in the `src` directory, further divided into modules
- Core logic in the `services` directory
- Data model definitions in the `models` directory
- Utility functions in the `utils` directory
- Tests in a dedicated `tests` directory

## 4. Detailed Implementation Specification

### 4.1 Command-Line Interface

```typescript
// Accept directory to analyze and optional output directory
// Read GEMINI_API_KEY from environment
interface CommandLineArgs {
  repositoryPath: string;
  outputDir?: string; // Defaults to `${repositoryPath}/wiki`
  geminiApiKey?: string; // Uses process.env.GEMINI_API_KEY if not provided
}
```

### 4.2 Repository Scanner

```typescript
interface FileTreeNode {
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
}

class RepositoryScanner {
  constructor(private repositoryPath: string) {}

  async getFileTree(): Promise<FileTreeNode[]> {
    // Execute tree --gitignore and parse output
    // Return structured file tree
  }

  async readFileContent(path: string): Promise<string> {
    // Read and return file content
  }

  async readMultipleFiles(
    paths: string[]
  ): Promise<{ path: string; content: string }[]> {
    // Read multiple files and return with their paths
  }
}
```

### 4.3 LLM Interaction Layer

```typescript
interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
}

class GeminiService {
  constructor(private apiKey: string) {}

  async initialize() {
    // Set up Gemini API client
  }

  async generateResponse(
    prompt: string,
    context?: string,
    options?: LLMRequestOptions,
    responseSchema?: any
  ): Promise<any> {
    // Call Gemini API with prompt and context
    // If responseSchema is provided, configure the model to return structured output
    // Return generated response
  }

  async selectRelevantFiles(
    fileTree: FileTreeNode[],
    count: number = 50,
    initialFileContents?: { path: string; content: string }[]
  ): Promise<string[]> {
    // Prompt Gemini to select the most relevant files
    // If initialFileContents is provided, use it for context in selecting additional files
    // Configure structured output with Type.ARRAY of Type.STRING
    // Return list of file paths
  }

  async generateDocStructure(
    fileContents: { path: string; content: string }[]
  ): Promise<DocStructure> {
    // Use file contents to generate documentation structure
    // Configure structured output using DocStructure schema
    // This is a standalone call that includes all collected file contents
    // Will use the schema to ensure proper structure is returned
    // Return structure with page hierarchy
  }

  async generatePageContent(
    pageInfo: DocPage,
    relevantFiles: { path: string; content: string }[]
  ): Promise<string> {
    // Generate content for a specific documentation page
    // Include appropriate Mermaid diagrams when applicable
    // Return markdown content
  }
}
```

### 4.4 Documentation Generator

```typescript
interface DocPage {
  id: string; // e.g., "1_project-overview"
  title: string;
  description: string;
  relevantFilePaths: string[];
  subPages?: string[]; // References to child page IDs
}

interface DocStructure {
  pages: DocPage[];
}

// Schema for DocStructure to be used with Gemini structured output
const docStructureSchema = {
  type: Type.OBJECT,
  properties: {
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description:
              'Numerical ID with kebab-case title (e.g., "1_project-overview")',
          },
          title: {
            type: Type.STRING,
            description: "Human-readable title for the page",
          },
          description: {
            type: Type.STRING,
            description: "Brief description of what the page will contain",
          },
          relevantFilePaths: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "File path relative to repository root",
            },
            description: "All file paths relevant to this page",
          },
          subPages: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: 'IDs of sub-pages (e.g., "1-1_architecture")',
            },
            description: "IDs of sub-pages",
            nullable: true,
          },
        },
        required: ["id", "title", "description", "relevantFilePaths"],
      },
    },
  },
  required: ["pages"],
};

class DocumentationGenerator {
  constructor(
    private outputDir: string,
    private geminiService: GeminiService,
    private repositoryScanner: RepositoryScanner
  ) {}

  async generateAllDocs(docStructure: DocStructure): Promise<void> {
    // Create output directory if it doesn't exist
    // For each page in the structure:
    //   - Get relevant file contents
    //   - Generate page content via Gemini
    //   - Write to markdown file
  }

  private async generatePageMarkdown(page: DocPage): Promise<string> {
    // Get relevant file contents
    // Generate page content using LLM
    // Format as proper markdown
    // Return markdown content
  }

  private async writeDocPage(pageId: string, content: string): Promise<void> {
    // Write markdown content to file in output directory
  }
}
```

### 4.5 Orchestrator

```typescript
class Orchestrator {
  constructor(
    private repositoryPath: string,
    private outputDir: string,
    private geminiApiKey: string
  ) {}

  async run(): Promise<void> {
    // Initialize services
    const scanner = new RepositoryScanner(this.repositoryPath);
    const gemini = new GeminiService(this.geminiApiKey);
    await gemini.initialize();
    const docGenerator = new DocumentationGenerator(
      this.outputDir,
      gemini,
      scanner
    );

    // 1. Get file tree
    const fileTree = await scanner.getFileTree();

    // 2. Get initial file selection
    const initialFiles = await gemini.selectRelevantFiles(fileTree);

    // 3. Read initial files
    const initialFileContents = await scanner.readMultipleFiles(initialFiles);

    // 4. Get secondary file selection
    const additionalFiles = await gemini.selectRelevantFiles(
      fileTree,
      50,
      initialFileContents
    );

    // 5. Read additional files
    const additionalFileContents = await scanner.readMultipleFiles(
      additionalFiles
    );

    // 6. Generate doc structure
    const allFileContents = [...initialFileContents, ...additionalFileContents];
    const docStructure = await gemini.generateDocStructure(allFileContents);

    // 7. Generate all doc pages
    await docGenerator.generateAllDocs(docStructure);

    console.log(`Documentation generated successfully at ${this.outputDir}`);
  }
}
```

## 5. Prompt Engineering

### 5.1 Initial File Selection Prompt

```
You are analyzing a codebase to generate documentation. Given the following file tree structure, select the 50 most important files that would help you understand the overall architecture, main components, and key functionality of this project. Choose files that provide the most insight into how the system works.

File Tree:
[FILE_TREE]

Select files that:
1. Describe the project architecture
2. Contain core business logic
3. Define key interfaces, types, or data models
4. Show the main entry points and application flow
5. Configure the system

Respond with only the file paths, nothing else.
```

For this prompt, we'll configure the Gemini model to return a structured output using the following schema:

```typescript
{
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
    description: 'A file path from the repository',
  }
}
```

### 5.2 Secondary File Selection Prompt

```
Based on my review of the initial 50 files, I now have some understanding of the project. To complete my understanding, please suggest up to 50 additional files that would fill in important gaps in my knowledge of the system. Focus on files that:

1. Implement core business logic not covered in the initial files
2. Show important workflows or processes
3. Demonstrate how different components interact
4. Contain configuration that explains system behavior
5. Provide context on deployment or infrastructure

I've already reviewed these files:
[INITIAL_FILES]

The content of these files indicates that the system [BRIEF_SUMMARY_OF_FINDINGS].

File Tree:
[FILE_TREE]

Respond with only the file paths of additional files to examine, nothing else.
```

For this prompt, we'll configure the Gemini model to return a structured output using the following schema:

```typescript
{
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
    description: 'A file path from the repository that was not in the initial selection',
  }
}
```

### 5.3 Documentation Structure Generation Prompt

```
Based on your analysis of this codebase, create a documentation structure that will comprehensively explain this system to new developers.

I've examined the following files to understand the system:

[ALL_FILE_CONTENTS]

The documentation should follow this format:
1. Top-level pages with numbered prefixes (e.g., "1_project-overview", "2_architecture")
2. Optionally, one level of sub-pages (e.g., "1-1_system-design", "1-2_workflows")
3. No deeper nesting is allowed

Start with high-level overview pages, then cover technical architecture, installation/setup, and specific components or services.

For each page, provide:
1. A numerical ID (e.g., "1", "1-1", "2")
2. A kebab-case title (e.g., "project-overview")
3. A brief description of what the page will contain
4. A COMPREHENSIVE list of relevant file paths that should be referenced when generating this page

IMPORTANT: For each page, include ALL files that might be relevant to that topic. The page content generator will ONLY have access to the files you list in "relevantFilePaths". Err strongly on the side of including more files rather than fewer. You can include files you haven't read but that might be relevant based on their paths or relationships to other files.

Return a properly structured documentation outline that organizes the codebase knowledge in a logical, hierarchical manner.
```

For this prompt, we'll configure the Gemini model to return a structured output using the docStructureSchema defined earlier to ensure we get a properly formatted response.

### 5.4 Page Content Generation Prompt

```
You are generating comprehensive documentation for a specific aspect of a codebase. Based on the provided files, create detailed markdown documentation for the page titled "[PAGE_TITLE]" with description "[PAGE_DESCRIPTION]".

This documentation should:
1. Start with a clear H1 title and introduction
2. Use H2 and H3 subheadings to organize content logically
3. Include code examples with proper syntax highlighting
4. Create Mermaid diagrams when useful for visualizing:
   - Architecture
   - Workflows
   - Data models
   - Component relationships
5. Include tables when appropriate to organize information
6. Explain not just what the code does, but why it's designed that way

Here are the relevant files for this page:
[FILE_CONTENTS]

Write comprehensive, clear, and insightful documentation that would be valuable to a developer new to this codebase. Be sure to include Mermaid diagrams where they would help visualize relationships or processes. Your response should be complete markdown that can be directly saved as a documentation page.
```

For this prompt, we'll use the standard text output rather than structured output, as we want the full markdown content with proper formatting.

## 6. Error Handling & Edge Cases

### 6.1 Error Scenarios

- API rate limiting from Gemini
- Missing `tree` utility
- Insufficient permissions to read files
- Repository too large for effective processing
- LLM token limits exceeded
- File encoding issues

### 6.2 Error Handling Strategy

- Implement exponential backoff for API rate limiting
- Validate prerequisites before starting (tree command existence)
- Gracefully handle and report permission errors
- Implement chunking strategies for large repositories
- Split contexts if token limits are reached
- Detect and handle different file encodings

## 7. Performance Considerations

### 7.1 Parallel Processing

- Process file reading operations in parallel batches
- Generate documentation pages in parallel

### 7.2 Caching

- Cache file contents to prevent redundant reads
- Cache LLM responses for similar queries

### 7.3 Resource Management

- Implement token counting to avoid exceeding LLM limits
- Use streaming responses when appropriate to reduce memory usage

## 8. Implementation Plan

### 8.1 Phase 1: Core Infrastructure

- Set up TypeScript project structure
- Implement repository scanner and file reader
- Create basic Gemini API integration
- Develop command-line interface

**Verification Steps:**

1. Run `npm run build` to verify no TypeScript errors
2. Execute `node dist/index.js --help` to verify CLI is working
3. Run `node dist/index.js --test-scan <test_directory>` to verify repository scanner outputs file tree structure to console
4. Run `node dist/index.js --test-gemini` with valid API key to verify a basic "What model are you?" prompt returns expected response
5. Create a small sample repository with a few files and verify file reading functionality with `node dist/index.js --test-read <test_directory>`

### 8.2 Phase 2: LLM Integration

- Implement file selection prompts with structured output
- Develop documentation structure generation
- Build page content generation logic
- Test with small repositories

**Verification Steps:**

1. Run `npm run build` to verify no TypeScript errors
2. Execute `node dist/index.js --test-file-selection <test_directory>` to verify the file selection logic works and outputs a valid array of files
3. Run `node dist/index.js --test-doc-structure <test_directory>` to verify documentation structure generation produces valid JSON matching our schema
4. Run `node dist/index.js --test-page-content "<page_title>" "<description>" <test_directory> <file1> <file2>` to verify page content generation produces valid markdown
5. Check that all responses are properly structured according to the defined schemas

### 8.3 Phase 3: Documentation Generation

- Implement markdown file writing
- Add Mermaid diagram generation support
- Build the full documentation generation pipeline
- Test with small repositories

**Verification Steps:**

1. Run `npm run build` to verify no TypeScript errors
2. Execute `node dist/index.js --test-write <test_output_directory>` to verify markdown file writing functionality works
3. Run `node dist/index.js --generate <test_directory> --output <test_output_directory>` with a small test repository to generate full documentation
4. Check that output directory contains expected files with correct naming structure
5. Verify at least one markdown file has a Mermaid diagram correctly formatted
6. Validate that all file references in the documentation structure have corresponding content in the output directory

### 8.4 Phase 4: Error Handling & Polish

- Implement comprehensive error handling
- Add progress reporting
- Add configuration options
- Create detailed usage documentation
- Optimize performance

**Verification Steps:**

1. Run `npm run build` to verify no TypeScript errors
2. Test with invalid API key to verify proper error message
3. Test with non-existent directory to verify helpful error message
4. Test with a repository containing binary files to verify they are handled gracefully
5. Run with a larger repository and verify progress reporting correctly shows completion percentage
6. Test configuration options by creating a config file and verifying it is properly used
7. Run a timing test comparing performance before and after optimization
8. Verify that usage documentation is generated and clear

## 9. Testing Strategy

### 9.1 Unit Tests

- Test file reading and parsing
- Test markdown generation
- Test command-line argument parsing

### 9.2 Integration Tests

- Test end-to-end with small sample repositories
- Verify API integration with mock responses

### 9.3 Performance Tests

- Test with repositories of varying sizes
- Measure execution time and resource usage

## 10. Future Enhancements

### 10.1 Potential Features

- Support for custom documentation templates
- Integration with git history for change documentation
- Web UI for configuration and viewing
- Incremental updates to documentation
- Support for additional LLM providers

### 10.2 Maintenance Considerations

- Version tracking for generated documentation
- Detection of significant code changes
- Documentation freshness indicators
