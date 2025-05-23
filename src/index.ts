#!/usr/bin/env node

import { Command } from "commander";
import path from "path";
import dotenv from "dotenv";
import { Orchestrator } from "./services/orchestrator";
import { validateRequiredArgs } from "./utils/errorHandling";
import { RepositoryScanner } from "./services/repositoryScanner";
import { GeminiService } from "./services/geminiService";

// Load environment variables
dotenv.config();

const program = new Command();

program.name("quickwiki-ai").description("An automated documentation generator for codebases").version("0.1.0");

program
  .argument("<repository-path>", "Path to the repository to document")
  .option("-o, --output <directory>", "Output directory for documentation (default: <repository-path>/wiki)")
  .option("-k, --gemini-api-key <key>", "Google Gemini API key")
  .action(async (repositoryPath, options) => {
    try {
      // Resolve absolute path
      const repoAbsolutePath = path.resolve(repositoryPath);

      // Set default output directory if not specified
      const outputDir = options.output ? path.resolve(options.output) : path.join(repoAbsolutePath, "wiki");

      // Use API key from command line or environment variable
      const geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;

      // Validate required arguments
      validateRequiredArgs(repoAbsolutePath, geminiApiKey);

      // Run the documentation generator
      const orchestrator = new Orchestrator(repoAbsolutePath, outputDir, geminiApiKey as string);

      await orchestrator.run();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    }
  });

// Test commands for development and debugging
program
  .command("test-scan <directory>")
  .description("Test repository scanner")
  .action(async (directory) => {
    try {
      const scanner = new RepositoryScanner(path.resolve(directory));
      const fileTree = await scanner.getFileTree();
      console.log(JSON.stringify(fileTree, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    }
  });

program
  .command("test-read <directory> <file>")
  .description("Test file reading")
  .action(async (directory, file) => {
    try {
      const scanner = new RepositoryScanner(path.resolve(directory));
      const filePath = path.join(directory, file);
      const content = await scanner.readFileContent(filePath);
      console.log(content);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    }
  });

program
  .command("test-gemini")
  .description("Test Gemini API connection")
  .action(async () => {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.error("GEMINI_API_KEY environment variable is not set");
        process.exit(1);
      }

      const gemini = new GeminiService(geminiApiKey);
      await gemini.initialize();

      const response = await gemini.generateResponse("What model are you?");
      console.log(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    }
  });

program.parse(process.argv);
