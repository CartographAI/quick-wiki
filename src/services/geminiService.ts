import { GoogleGenAI, Type } from "@google/genai";
import { LLMRequestOptions, DocStructure, FileContent, DocPage } from "../models/types";

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

  async generateResponse(prompt: string, context?: string, options?: LLMRequestOptions): Promise<string> {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: fullPrompt,
      });

      return response.text || "";
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate response: ${error.message}`);
      }
      throw new Error("Failed to generate response: Unknown error");
    }
  }

  async generateStructuredResponse<T>(
    prompt: string,
    responseSchema: any,
    context?: string,
    options?: LLMRequestOptions,
  ): Promise<T> {
    try {
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const text = response.text || "{}";
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate structured response: ${error.message}`);
      }
      throw new Error("Failed to generate structured response: Unknown error");
    }
  }

  async selectRelevantFiles(
    fileTree: string,
    count: number = 50,
    initialFileContents?: FileContent[],
  ): Promise<string[]> {
    try {
      let prompt = `
You are analyzing a codebase to generate documentation. Given the following file tree structure, select the ${count} most important files that would help you understand the overall architecture, main components, and key functionality of this project. Choose files that provide the most insight into how the system works.

File Tree:
${fileTree}

Select files that:
1. Describe the project architecture
2. Contain core business logic
3. Define key interfaces, types, or data models
4. Show the main entry points and application flow
5. Configure the system
`;

      if (initialFileContents) {
        const initialContentSummary = initialFileContents
          .map((file) => `${file.path}: ${file.content.substring(0, 200)}...`)
          .join("\n\n");

        prompt = `
Based on my review of the initial files, I now have some understanding of the project. To complete my understanding, please suggest up to ${count} additional files that would fill in important gaps in my knowledge of the system. Focus on files that:

1. Implement core business logic not covered in the initial files
2. Show important workflows or processes
3. Demonstrate how different components interact
4. Contain configuration that explains system behavior
5. Provide context on deployment or infrastructure

I've already reviewed these files:
${initialFileContents.map((file) => file.path).join("\n")}

The content of these files indicates:
${initialContentSummary}

File Tree:
${fileTree}
`;
      }

      // Define schema for an array of strings
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "A file path from the repository",
        },
      };

      return await this.generateStructuredResponse<string[]>(prompt, responseSchema);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to select relevant files: ${error.message}`);
      }
      throw new Error("Failed to select relevant files: Unknown error");
    }
  }

  async generateDocStructure(fileContents: FileContent[]): Promise<DocStructure> {
    try {
      const fileContentsSummary = fileContents
        .map((file) => `File: ${file.path}\nContent: ${file.content.substring(0, 300)}...`)
        .join("\n\n");

      const prompt = `
Based on your analysis of this codebase, create a documentation structure that will comprehensively explain this system to new developers.

I've examined the following files to understand the system:

${fileContentsSummary}

The documentation should follow this format:
1. Top-level pages with numbered prefixes (e.g., "1_project-overview", "2_architecture")
2. Optionally, one level of sub-pages (e.g., "1-1_system-design", "1-2_workflows")
3. No deeper nesting is allowed

Start with high-level overview pages, then cover installation/setup, technical architecture, and specific features, user/data flows or implementation patterns. Cover general topics first, then dive into specific details. The total number of pages should range from 5 for a small codebase to 20 for a large codebase.

For each page, provide:
1. A numerical ID (e.g., "1", "1-1", "2")
2. A kebab-case title (e.g., "project-overview")
3. A brief description of what the page will contain
4. A COMPREHENSIVE list of relevant file paths that should be referenced when generating this page

IMPORTANT: For each page, include ALL files that might be relevant to that topic under "relevantFilePaths". The page content generator will ONLY have access to the files you list in "relevantFilePaths". Always include high-level files such as README.md, package.json, etc, as context for the page content generator.
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
                  description:
                    "All file paths relevant to this page. Err strongly on the side of including more files rather than fewer.",
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
      throw new Error("Failed to generate doc structure: Unknown error");
    }
  }

  async generatePageContent(pageInfo: DocPage, relevantFiles: FileContent[]): Promise<string> {
    try {
      const fileContentsStr = relevantFiles
        .map((file) => `File: ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\``)
        .join("\n\n");

      const prompt = `
You are generating concise, focused documentation for a specific aspect of a codebase. Based on the provided files, create markdown documentation for the page titled "${pageInfo.title}" with description "${pageInfo.description}".

IMPORTANT FORMAT RULES - FOLLOW THESE PRECISELY:
- Your raw markdown content will be directly saved as a documentation page
- BEGIN with "# " (H1 heading) - NO preamble, NO backticks, NO explanations
- DO NOT wrap your output in \`\`\`markdown or any code block markers
- NO explanatory text before the H1 heading
- After the H1 heading, include a brief, informative introductory paragraph
- The intro paragraph should directly describe what the component does, NOT meta-text like "This document explains..."
- Keep the entire document between 100-250 lines maximum
- Keep the document focused and avoid unnecessary verbosity

Structure Guidelines:
1. Use H2 and H3 subheadings to organize content logically
2. Include small, focused code examples (no more than 10-15 lines each)
3. Create Mermaid diagrams when useful for visualizing architecture, workflows, data models, or component relationships
4. Use tables when they make information more scannable

Content Guidelines:
1. DO NOT quote large chunks of code from the repository
2. ALWAYS include links when referring to files, classes, or functions:
   - Example for file links: [fileName](/path/to/file.ts)
   - Example for function links: [functionName()](/path/to/file.ts#L42)
   - Example: The [ShoppingCart](/src/services/shoppingCart.ts) class uses the [createProduct](/src/crud/products.js#L25) function
   - Every mention of a class, function, or file MUST include a link
3. Focus on high-level understanding, architecture, and relationships
4. Explain design decisions and patterns, not just implementations
5. For code examples, include only the most important snippets that illustrate key concepts

Here are the relevant files for this page:

${fileContentsStr}

CRITICAL: Your direct markdown content will be used "as is" without modification. Examples of correct and incorrect format:

INCORRECT (has preamble before H1):
I will create documentation for the Repository Scanner module...
# Repository Scanner

INCORRECT (wrapped in code block):
\`\`\`markdown
# Repository Scanner
\`\`\`

INCORRECT (meta-description):
# Repository Scanner
This document explains the role and functionality of the Repository Scanner...

CORRECT (starts immediately with H1, has specific description of functionality):
# Repository Scanner
The [RepositoryScanner](/src/services/repositoryScanner.ts) class is responsible for scanning repository file structure and reading file contents. It provides methods to get a tree representation of files, read content of individual files, and efficiently read multiple files.

CORRECT (for non-code pages, gives factual summary not meta-description):
# Installation and Setup
This document provides instructions on how to install, configure and use QuickWiki, as well as steps for troubleshooting and local development setup.
`;

      // Define schema for direct markdown output
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          rawMarkdownContent: {
            type: Type.STRING,
            description:
              "The direct markdown content starting with '# ' (H1 heading) without any code block markers or preamble. This content will be used as-is without modification.",
          },
        },
        required: ["rawMarkdownContent"],
      };

      const response = await this.generateStructuredResponse<{ rawMarkdownContent: string }>(prompt, responseSchema);
      return response.rawMarkdownContent;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate page content: ${error.message}`);
      }
      throw new Error("Failed to generate page content: Unknown error");
    }
  }
}
