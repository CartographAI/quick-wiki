import path from "path";
import { RepositoryScanner } from "./repositoryScanner";
import { GeminiService } from "./geminiService";
import { DocumentationGenerator } from "./documentationGenerator";

export class Orchestrator {
  constructor(
    private repositoryPath: string,
    private outputDir: string,
    private geminiApiKey: string,
  ) {}

  async run(): Promise<void> {
    console.log(`Starting documentation generation for: ${this.repositoryPath}`);
    console.log(`Output directory: ${this.outputDir}`);

    try {
      // Initialize services
      console.log("Initializing services...");
      const scanner = new RepositoryScanner(this.repositoryPath);
      const gemini = new GeminiService(this.geminiApiKey);
      await gemini.initialize();
      const docGenerator = new DocumentationGenerator(this.outputDir, gemini, scanner);

      // 1. Get file tree
      console.log("Scanning repository structure...");
      const fileTree = await scanner.getFileTree();
      // Extract the summary line from the tree output (e.g. "6 directories, 16 files")
      const summaryLine = fileTree
        .split("\n")
        .filter((line) => line.includes("directories") && line.includes("files"))
        .pop();
      console.log(`Repository scan complete: ${summaryLine || "Structure obtained"}`);

      // 2. Get initial file selection
      console.log("Selecting initial relevant files...");
      const initialFiles = await gemini.selectRelevantFiles(fileTree);
      console.log(`Selected ${initialFiles.length} initial files`);
      console.debug("Initial file selection paths:", initialFiles);

      // 3. Read initial files
      console.log("Reading initial file contents...");
      const initialFileContents = await scanner.readMultipleFiles(initialFiles);

      // 4. Get secondary file selection
      console.log("Selecting additional relevant files...");
      const additionalFiles = await gemini.selectRelevantFiles(fileTree, 50, initialFileContents);
      console.log(`Selected ${additionalFiles.length} additional files`);
      console.debug("Secondary file selection paths:", additionalFiles);

      // 5. Read additional files
      console.log("Reading additional file contents...");
      const additionalFileContents = await scanner.readMultipleFiles(additionalFiles);

      // 6. Generate doc structure
      console.log("Generating documentation structure...");
      const allFileContents = [...initialFileContents, ...additionalFileContents];
      const docStructure = await gemini.generateDocStructure(allFileContents);
      console.log(`Created structure with ${docStructure.pages.length} pages`);
      console.debug("Generated doc structure:", JSON.stringify(docStructure, null, 2));

      // 7. Generate all doc pages
      console.log("Generating documentation pages...");
      await docGenerator.generateAllDocs(docStructure);

      console.log(`Documentation generated successfully at ${this.outputDir}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        throw error;
      }
      console.error("An unknown error occurred");
      throw new Error("An unknown error occurred");
    }
  }
}
