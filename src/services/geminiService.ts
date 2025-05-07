import { GoogleGenAI, Type } from '@google/genai';
import { FileTreeNode, LLMRequestOptions, DocStructure, FileContent, DocPage } from '../models/types';

export class GeminiService {
  private ai: GoogleGenAI;
  
  constructor(private apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async initialize(): Promise<void> {
    try {
      // Simple test to verify model connection
      await this.generateResponse("Test connection");
      console.log("Gemini API client is ready");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize Gemini: ${error.message}`);
      }
      throw new Error("Failed to initialize Gemini: Unknown error");
    }
  }

  async generateResponse(
    prompt: string,
    context?: string,
    options?: LLMRequestOptions
  ): Promise<string> {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt
      });

      return response.text || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate response: ${error.message}`);
      }
      throw new Error('Failed to generate response: Unknown error');
    }
  }
  
  async generateStructuredResponse<T>(
    prompt: string, 
    responseSchema: any,
    context?: string,
    options?: LLMRequestOptions
  ): Promise<T> {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      const text = response.text || "{}";
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate structured response: ${error.message}`);
      }
      throw new Error('Failed to generate structured response: Unknown error');
    }
  }

  async selectRelevantFiles(
    fileTree: FileTreeNode[],
    count: number = 50,
    initialFileContents?: FileContent[]
  ): Promise<string[]> {
    try {
      const fileTreeStr = JSON.stringify(fileTree, null, 2);
      
      let prompt = `
You are analyzing a codebase to generate documentation. Given the following file tree structure, select the ${count} most important files that would help you understand the overall architecture, main components, and key functionality of this project. Choose files that provide the most insight into how the system works.

File Tree:
${fileTreeStr}

Select files that:
1. Describe the project architecture
2. Contain core business logic
3. Define key interfaces, types, or data models
4. Show the main entry points and application flow
5. Configure the system
`;

      if (initialFileContents) {
        const initialContentSummary = initialFileContents
          .map(file => `${file.path}: ${file.content.substring(0, 200)}...`)
          .join('\n\n');
        
        prompt = `
Based on my review of the initial files, I now have some understanding of the project. To complete my understanding, please suggest up to ${count} additional files that would fill in important gaps in my knowledge of the system. Focus on files that:

1. Implement core business logic not covered in the initial files
2. Show important workflows or processes
3. Demonstrate how different components interact
4. Contain configuration that explains system behavior
5. Provide context on deployment or infrastructure

I've already reviewed these files:
${initialFileContents.map(file => file.path).join('\n')}

The content of these files indicates:
${initialContentSummary}

File Tree:
${fileTreeStr}
`;
      }

      // Define schema for an array of strings
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: 'A file path from the repository',
        },
      };

      return await this.generateStructuredResponse<string[]>(prompt, responseSchema);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to select relevant files: ${error.message}`);
      }
      throw new Error('Failed to select relevant files: Unknown error');
    }
  }

  async generateDocStructure(fileContents: FileContent[]): Promise<DocStructure> {
    try {
      const fileContentsSummary = fileContents
        .map(file => `File: ${file.path}\nContent: ${file.content.substring(0, 300)}...`)
        .join('\n\n');

      const prompt = `
Based on your analysis of this codebase, create a documentation structure that will comprehensively explain this system to new developers.

I've examined the following files to understand the system:

${fileContentsSummary}

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

IMPORTANT: For each page, include ALL files that might be relevant to that topic. The page content generator will ONLY have access to the files you list in "relevantFilePaths". Err strongly on the side of including more files rather than fewer.
`;

      // Define the schema for DocStructure
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Numerical ID with kebab-case title (e.g., "1_project-overview")',
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

      return await this.generateStructuredResponse<DocStructure>(prompt, responseSchema);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate doc structure: ${error.message}`);
      }
      throw new Error('Failed to generate doc structure: Unknown error');
    }
  }

  async generatePageContent(
    pageInfo: DocPage,
    relevantFiles: FileContent[]
  ): Promise<string> {
    try {
      const fileContentsStr = relevantFiles
        .map(file => `File: ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n');

      const prompt = `
You are generating comprehensive documentation for a specific aspect of a codebase. Based on the provided files, create detailed markdown documentation for the page titled "${pageInfo.title}" with description "${pageInfo.description}".

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

${fileContentsStr}

Write comprehensive, clear, and insightful documentation that would be valuable to a developer new to this codebase. Be sure to include Mermaid diagrams where they would help visualize relationships or processes. Your response should be complete markdown that can be directly saved as a documentation page.
`;

      return await this.generateResponse(prompt);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate page content: ${error.message}`);
      }
      throw new Error('Failed to generate page content: Unknown error');
    }
  }
}