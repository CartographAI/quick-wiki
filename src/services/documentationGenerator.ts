import fs from 'fs/promises';
import path from 'path';
import { DocStructure, DocPage } from '../models/types';
import { GeminiService } from './geminiService';
import { RepositoryScanner } from './repositoryScanner';

export class DocumentationGenerator {
  constructor(
    private outputDir: string,
    private geminiService: GeminiService,
    private repositoryScanner: RepositoryScanner
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
      throw new Error('Failed to create output directory: Unknown error');
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
    const relevantFiles = await this.repositoryScanner.readMultipleFiles(
      page.relevantFilePaths
    );

    // Generate page content using LLM
    return await this.geminiService.generatePageContent(page, relevantFiles);
  }

  private async writeDocPage(pageId: string, content: string): Promise<void> {
    const filePath = path.join(this.outputDir, `${pageId}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  private async generateIndexPage(docStructure: DocStructure): Promise<void> {
    const indexContent = `# Documentation Index

${this.generateTableOfContents(docStructure.pages)}
`;

    await fs.writeFile(
      path.join(this.outputDir, 'index.md'),
      indexContent,
      'utf-8'
    );
  }

  private generateTableOfContents(pages: DocPage[], parentId: string = ''): string {
    const topLevelPages = !parentId 
      ? pages.filter(p => !p.id.includes('-'))
      : pages.filter(p => {
          const idPrefix = p.id.split('_')[0];
          return idPrefix.startsWith(parentId) && idPrefix.includes('-');
        });

    if (topLevelPages.length === 0) return '';

    return topLevelPages
      .map(page => {
        const pageLink = `- [${page.title}](./${page.id}.md): ${page.description}\n`;
        
        // Get subpages if they exist
        if (page.subPages && page.subPages.length > 0) {
          const subpagesList = page.subPages
            .map(subpageId => {
              const subpage = pages.find(p => p.id === subpageId);
              if (!subpage) return '';
              return `  - [${subpage.title}](./${subpage.id}.md): ${subpage.description}`;
            })
            .join('\n');
          return `${pageLink}${subpagesList}`;
        }
        
        return pageLink;
      })
      .join('\n');
  }
}