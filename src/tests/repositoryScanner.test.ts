import { RepositoryScanner } from '../services/repositoryScanner';
import path from 'path';
import fs from 'fs/promises';

// Mock fs.promises module
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn().mockImplementation((command) => {
    if (command === 'tree --version') {
      return Buffer.from('tree v1.8.0');
    }
    
    if (command.includes('tree --gitignore -J')) {
      return Buffer.from(JSON.stringify([
        {
          type: 'directory',
          name: 'testRepo',
          contents: [
            {
              type: 'directory',
              name: 'src',
              path: 'src',
              isDirectory: true,
              children: [
                {
                  type: 'file',
                  name: 'index.ts',
                  path: 'src/index.ts',
                  isDirectory: false
                },
                {
                  type: 'file',
                  name: 'utils.ts',
                  path: 'src/utils.ts',
                  isDirectory: false
                }
              ]
            },
            {
              type: 'file',
              name: 'package.json',
              path: 'package.json',
              isDirectory: false
            }
          ]
        }
      ]));
    }
    
    throw new Error(`Unexpected command: ${command}`);
  })
}));

describe('RepositoryScanner', () => {
  let scanner: RepositoryScanner;
  
  beforeEach(() => {
    scanner = new RepositoryScanner('/test/repo/path');
    
    // Mock fs.stat and fs.readFile
    mockedFs.stat.mockResolvedValue({
      isFile: () => true,
      size: 1000
    } as any);
    
    mockedFs.readFile.mockResolvedValue('file content');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('getFileTree returns parsed tree structure', async () => {
    const fileTree = await scanner.getFileTree();
    
    expect(fileTree).toHaveLength(2);
    expect(fileTree[0].path).toBe('src');
    expect(fileTree[0].isDirectory).toBe(true);
    expect(fileTree[0].children).toHaveLength(2);
    expect(fileTree[1].path).toBe('package.json');
    expect(fileTree[1].isDirectory).toBe(false);
  });
  
  test('readFileContent reads file content', async () => {
    const content = await scanner.readFileContent('src/index.ts');
    
    expect(mockedFs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('src/index.ts'),
      'utf-8'
    );
    expect(content).toBe('file content');
  });
  
  test('readMultipleFiles reads multiple files', async () => {
    const files = await scanner.readMultipleFiles([
      'src/index.ts',
      'src/utils.ts'
    ]);
    
    expect(files).toHaveLength(2);
    expect(files[0].path).toBe('src/index.ts');
    expect(files[0].content).toBe('file content');
    expect(files[1].path).toBe('src/utils.ts');
    expect(files[1].content).toBe('file content');
    expect(mockedFs.readFile).toHaveBeenCalledTimes(2);
  });
  
  test('readFileContent skips large files', async () => {
    mockedFs.stat.mockResolvedValueOnce({
      isFile: () => true,
      size: 2 * 1024 * 1024 // 2MB
    } as any);
    
    const content = await scanner.readFileContent('large-file.bin');
    
    expect(content).toContain('[File skipped: Too large]');
    expect(mockedFs.readFile).not.toHaveBeenCalled();
  });
});