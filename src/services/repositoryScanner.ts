import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { FileTreeNode, FileContent } from '../models/types';

export class RepositoryScanner {
  constructor(private repositoryPath: string) {}

  async getFileTree(): Promise<FileTreeNode[]> {
    try {
      // Check if tree command is available
      try {
        execSync('tree --version', { stdio: 'ignore' });
      } catch (error) {
        throw new Error('The "tree" command is not available. Please install it to continue.');
      }

      // Execute tree command with gitignore support
      const treeOutput = execSync(`tree --gitignore -J "${this.repositoryPath}"`, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer to handle large repos
      }).toString();

      const treeData = JSON.parse(treeOutput);
      if (!Array.isArray(treeData) || treeData.length === 0) {
        throw new Error('Unable to parse repository structure');
      }

      // The tree command returns a nested structure, we need to extract the actual file tree
      const rootDir = treeData[0];
      return rootDir.contents || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to scan repository: ${error.message}`);
      }
      throw new Error('Failed to scan repository: Unknown error');
    }
  }

  async readFileContent(filePath: string): Promise<string> {
    try {
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.repositoryPath, filePath);
      
      const stats = await fs.stat(fullPath);
      
      // Skip binary files and large files
      if (!stats.isFile() || stats.size > 1024 * 1024) { // Skip files > 1MB
        return `[File skipped: ${stats.isFile() ? 'Too large' : 'Not a file'}]`;
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      if (error instanceof Error) {
        return `[Error reading file: ${error.message}]`;
      }
      return '[Error reading file: Unknown error]';
    }
  }

  async readMultipleFiles(paths: string[]): Promise<FileContent[]> {
    const fileReads = paths.map(async (filePath) => {
      const content = await this.readFileContent(filePath);
      return { path: filePath, content };
    });
    
    return Promise.all(fileReads);
  }
}