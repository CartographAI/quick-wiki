import { DocumentationGenerator } from "../services/documentationGenerator";
import { DocStructure } from "../models/types";

describe("DocumentationGenerator.generateIndexPage", () => {
  let generator: DocumentationGenerator;

  beforeEach(() => {
    // The constructor params are not used for generateIndexPage
    generator = new DocumentationGenerator("", {} as any, {} as any);
  });

  it("generates a basic index page with two top-level pages", () => {
    const docStructure: DocStructure = {
      pages: [
        {
          id: "1_intro",
          title: "Introduction",
          description: "Project intro.",
          relevantFilePaths: [],
          subPages: null,
        },
        {
          id: "2_setup",
          title: "Setup",
          description: "How to set up.",
          relevantFilePaths: [],
          subPages: null,
        },
      ],
    };
    const result = generator.generateIndexPage(docStructure);
    expect(result).toContain("1. [Introduction](./1_intro.md): Project intro.");
    expect(result).toContain("2. [Setup](./2_setup.md): How to set up.");
    expect(result).toMatch(/^# Documentation Index/);
  });

  it("generates an index page with top-level and subpages", () => {
    const docStructure: DocStructure = {
      pages: [
        {
          id: "1_main",
          title: "Main",
          description: "Main section.",
          relevantFilePaths: [],
          subPages: ["1-1_sub1", "1-2_sub2"],
        },
        {
          id: "1-1_sub1",
          title: "Subpage One",
          description: "First subpage.",
          relevantFilePaths: [],
          subPages: null,
        },
        {
          id: "1-2_sub2",
          title: "Subpage Two",
          description: "Second subpage.",
          relevantFilePaths: [],
          subPages: null,
        },
        {
          id: "2_other",
          title: "Other",
          description: "Other section.",
          relevantFilePaths: [],
          subPages: null,
        },
      ],
    };
    const result = generator.generateIndexPage(docStructure);
    expect(result).toContain("1. [Main](./1_main.md): Main section.");
    expect(result).toContain("    1.1 [Subpage One](./1-1_sub1.md): First subpage.");
    expect(result).toContain("    1.2 [Subpage Two](./1-2_sub2.md): Second subpage.");
    expect(result).toContain("2. [Other](./2_other.md): Other section.");
    expect(result).toMatch(/^# Documentation Index/);
  });
});
