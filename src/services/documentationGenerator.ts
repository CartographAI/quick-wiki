import fs from "fs/promises";
import path from "path";
import { DocStructure, DocPage } from "../models/types";
import { GeminiService } from "./geminiService";
import { RepositoryScanner } from "./repositoryScanner";

export class DocumentationGenerator {
  constructor(
    private outputDir: string,
    private geminiService: GeminiService,
    private repositoryScanner: RepositoryScanner,
  ) {}

  async generateAllDocs(docStructure: DocStructure): Promise<void> {
    // Create output directory if it doesn't exist
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      console.log(`Created output directory: ${this.outputDir}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create output directory: ${error.message}`);
      }
      throw new Error("Failed to create output directory: Unknown error");
    }

    // Generate documentation for each page
    const totalPages = docStructure.pages.length;
    console.log(`Generating ${totalPages} documentation pages...`);

    for (let i = 0; i < totalPages; i++) {
      const page = docStructure.pages[i];
      console.log(`[${i + 1}/${totalPages}] Generating: ${page.id} - ${page.title}`);

      try {
        const markdown = await this.generatePageMarkdown(page);
        await this.writeDocPage(page.id, markdown);
        console.log(`✓ Generated: ${page.id}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`✗ Failed to generate page ${page.id}: ${error.message}`);
        } else {
          console.error(`✗ Failed to generate page ${page.id}: Unknown error`);
        }
      }
    }

    // Create an index.md file that links to all the documentation pages
    await this.generateIndexPage(docStructure);
    console.log(`Documentation generated successfully at ${this.outputDir}`);
  }

  private async generatePageMarkdown(page: DocPage): Promise<string> {
    // Get relevant file contents
    const relevantFiles = await this.repositoryScanner.readMultipleFiles(page.relevantFilePaths);

    // Generate page content using LLM
    return await this.geminiService.generatePageContent(page, relevantFiles);
  }

  private async writeDocPage(pageId: string, content: string): Promise<void> {
    const filePath = path.join(this.outputDir, `${pageId}.md`);
    await fs.writeFile(filePath, content, "utf-8");
  }

  // Returns the index page content as a string, for easy testing
  public generateIndexPage(docStructure: DocStructure): string {
    const pages = docStructure.pages;
    let toc = "";
    let topLevelIndex = 1;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      // Top-level page: id does not have a dash after the leading number
      if (!/\d-\d/.test(page.id)) {
        toc += `${topLevelIndex}. [${page.title}](./${page.id}.md): ${page.description}\n`;
        // Handle subpages if any
        if (Array.isArray(page.subPages) && page.subPages.length > 0) {
          let subIndex = 1;
          for (const subPageId of page.subPages) {
            const subPage = pages.find((p) => p.id === subPageId);
            if (subPage) {
              toc += `    ${topLevelIndex}.${subIndex} [${subPage.title}](./${subPage.id}.md): ${subPage.description}\n`;
              subIndex++;
            }
          }
        }
        topLevelIndex++;
      }
    }
    const indexContent = `# Documentation Index\n\n${toc.trimEnd()}\n`;
    return indexContent;
  }
}
