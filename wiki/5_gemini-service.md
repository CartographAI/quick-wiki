# Gemini Service
The [GeminiService](/src/services/geminiService.ts) class is responsible for interacting with the Google Gemini API to generate documentation content. It handles tasks such as selecting relevant files, generating documentation structure, and creating the content for individual documentation pages.

## Initialization
The [GeminiService](/src/services/geminiService.ts) is initialized with an API key, which is passed to the GoogleGenAI constructor. The [initialize()](/src/services/geminiService.ts#L10) method tests the connection to the Gemini API.

```typescript
constructor(private apiKey: string) {
  this.ai = new GoogleGenAI({ apiKey: this.apiKey });
}

async initialize(): Promise<void> {
  try {
    // Simple test to verify model connection
    await this.generateResponse("Test connection");
    console.log("Gemini API client is ready");
  } catch (error) {
    //Error Handling
  }
}
```

## Generating Responses
The service provides two main methods for generating content:

*   [generateResponse()](/src/services/geminiService.ts#L22): For simple text generation based on a prompt and optional context.
*   [generateStructuredResponse()](/src/services/geminiService.ts#L36): For generating responses that conform to a specific JSON schema, which is useful for generating structured data like documentation outlines.

### Example: Generating a Simple Response

```typescript
async generateResponse(prompt: string, context?: string, options?: LLMRequestOptions): Promise<string> {
  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

  const response = await this.ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: fullPrompt,
  });

  return response.text || "";
}
```

### Example: Generating Structured Data

```typescript
async generateStructuredResponse<T>(
  prompt: string,
  responseSchema: any,
  context?: string,
  options?: LLMRequestOptions,
): Promise<T> {
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
}
```

## Documentation Generation Workflow
The [GeminiService](/src/services/geminiService.ts) plays a central role in the documentation generation workflow. It is responsible for:

1.  **Selecting Relevant Files:** [selectRelevantFiles()](/src/services/geminiService.ts#L68) chooses the most important files for documentation based on a file tree.
2.  **Generating Documentation Structure:** [generateDocStructure()](/src/services/geminiService.ts#L117) creates a documentation outline with pages, titles, descriptions, and relevant file paths.
3.  **Generating Page Content:** [generatePageContent()](/src/services/geminiService.ts#L186) generates the actual markdown content for each documentation page based on its description and relevant files.

## Data Models
The [GeminiService](/src/services/geminiService.ts) uses several data models defined in [src/models/types.ts](/src/models/types.ts) to structure requests and responses. Key data models include:

*   [DocStructure](/src/models/types.ts#L6): Represents the overall structure of the documentation, including a list of [DocPage](/src/models/types.ts#L1) objects.
*   [DocPage](/src/models/types.ts#L1): Represents a single documentation page, including its ID, title, description, and relevant file paths.
*   [FileContent](/src/models/types.ts#L28): Represents the content of a file, including its path and content.

## Error Handling
The service includes error handling for Gemini API calls. All methods wrap the API calls in try/catch blocks and throw custom errors with descriptive messages when failures occur.