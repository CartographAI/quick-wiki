# Documentation Index

1. [Project Overview](./1_project-overview.md): Provides a high-level overview of the QuickWiki project, its purpose, features, and goals.
2. [Installation and Setup](./2_installation-setup.md): Details the installation and setup process for QuickWiki, including system requirements, dependencies, and configuration.
3. [Architecture](./3_architecture.md): Explores the technical architecture of QuickWiki, outlining the main components, services, and their interactions.
    3.1 [Data Flow](./3-1_data-flow.md): Describes the data flow through the QuickWiki system, from repository scanning to documentation generation.
    3.2 [Component Details](./3-2_component-details.md): Provides in-depth details about each component within QuickWiki, including their responsibilities, inputs, and outputs.
4. [Repository Scanner](./4_repository-scanner.md): Explains the role and usage of the RepositoryScanner service, which is responsible for scanning the repository structure and extracting file contents.
5. [Gemini Service](./5_gemini-service.md): Details the GeminiService, responsible for interacting with the Google Gemini API to generate documentation content.
6. [Documentation Generator](./6_documentation-generator.md): Covers the DocumentationGenerator service, which takes the output from the Gemini API and writes it to markdown files.
7. [Orchestrator](./7_orchestrator.md): Describes the orchestrator and its responsibilities.
8. [Configuration](./8_configuration.md): Describes the different configuration options, including command-line arguments and environment variables.
