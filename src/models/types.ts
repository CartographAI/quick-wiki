export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface DocPage {
  id: string; // e.g., "1_project-overview"
  title: string;
  description: string;
  relevantFilePaths: string[];
  subPages: string[] | null; // References to child page IDs
}

export interface DocStructure {
  pages: DocPage[];
}

export interface CommandLineArgs {
  repositoryPath: string;
  outputDir?: string; // Defaults to `${repositoryPath}/cartograph_docs`
  geminiApiKey?: string; // Uses process.env.GEMINI_API_KEY if not provided
}

export interface FileContent {
  path: string;
  content: string;
}
