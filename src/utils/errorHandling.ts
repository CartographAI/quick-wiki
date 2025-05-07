/**
 * Handles errors with more context about where they occurred
 */
export function handleError(error: unknown, context: string): never {
  if (error instanceof Error) {
    throw new Error(`${context}: ${error.message}`);
  } else {
    throw new Error(`${context}: Unknown error`);
  }
}

/**
 * Validates that required command line arguments are provided
 */
export function validateRequiredArgs(
  repositoryPath?: string,
  geminiApiKey?: string
): void {
  if (!repositoryPath) {
    throw new Error('Repository path is required');
  }

  if (!geminiApiKey) {
    throw new Error(
      'Gemini API key is required. Set GEMINI_API_KEY environment variable or provide --gemini-api-key flag'
    );
  }
}

/**
 * Implements exponential backoff for API calls
 * @param fn The function to retry
 * @param retries Maximum number of retries
 * @param initialDelayMs Initial delay in milliseconds
 * @returns The result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === retries) {
        // This was the last attempt, rethrow
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // This should never happen, but TypeScript requires it
  throw lastError;
}