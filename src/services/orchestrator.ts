import path from 'path';
import { RepositoryScanner } from './repositoryScanner';
import { GeminiService } from './geminiService';
import { DocumentationGenerator } from './documentationGenerator';

export class Orchestrator {
  constructor(
    private repositoryPath: string,
    private outputDir: string,
    private geminiApiKey: string
  ) {}

  async run(): Promise<void> {
    console.log(`Starting documentation generation for: ${this.repositoryPath}`);
    console.log(`Output directory: ${this.outputDir}`);

    try {
      // Initialize services
      console.log('Initializing services...');
      const scanner = new RepositoryScanner(this.repositoryPath);
      const gemini = new GeminiService(this.geminiApiKey);
      await gemini.initialize();
      const docGenerator = new DocumentationGenerator(
        this.outputDir,
        gemini,
        scanner
      );

      // 1. Get file tree
      console.log('Scanning repository structure...');
      const fileTree = await scanner.getFileTree();
      console.log(`Found ${this.countFiles(fileTree)} files in repository`);

      // 2. Get initial file selection
      console.log('Selecting initial relevant files...');
      const initialFiles = await gemini.selectRelevantFiles(fileTree);
      console.log(`Selected ${initialFiles.length} initial files`);

      // 3. Read initial files
      console.log('Reading initial file contents...');
      const initialFileContents = await scanner.readMultipleFiles(initialFiles);

      // 4. Get secondary file selection
      console.log('Selecting additional relevant files...');
      const additionalFiles = await gemini.selectRelevantFiles(
        fileTree,
        50,
        initialFileContents
      );
      console.log(`Selected ${additionalFiles.length} additional files`);

      // 5. Read additional files
      console.log('Reading additional file contents...');
      const additionalFileContents = await scanner.readMultipleFiles(
        additionalFiles
      );

      // 6. Generate doc structure
      console.log('Generating documentation structure...');
      const allFileContents = [...initialFileContents, ...additionalFileContents];
      const docStructure = await gemini.generateDocStructure(allFileContents);
      console.log(`Created structure with ${docStructure.pages.length} pages`);

      // 7. Generate all doc pages
      console.log('Generating documentation pages...');
      await docGenerator.generateAllDocs(docStructure);

      console.log(`Documentation generated successfully at ${this.outputDir}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        throw error;
      }
      console.error('An unknown error occurred');
      throw new Error('An unknown error occurred');
    }
  }

  private countFiles(fileTree: any[]): number {
    let count = 0;
    
    const countNodesRecursively = (nodes: any[]) => {
      if (!nodes) return;
      
      for (const node of nodes) {
        if (!node.isDirectory) {
          count++;
        }
        
        if (node.children && node.children.length > 0) {
          countNodesRecursively(node.children);
        }
      }
    };
    
    countNodesRecursively(fileTree);
    return count;
  }
}