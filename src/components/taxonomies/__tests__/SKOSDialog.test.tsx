/**
 * Tests for SKOSDialog component
 * Tests SKOS import/export functionality, file handling, format conversion, and validation
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "../../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SKOSDialog } from "../SKOSDialog";
import { Taxonomy } from "../../../state/taxonomies";
import { useNotification } from "../../../state/notify";
import { serializeToSKOS, parseFromSKOS } from "../../../utils/skos";
import { validateTaxonomy } from "../../../utils/skos-validation";
import { exportTaxonomy } from "../../../utils/export-formats";

// Mock dependencies
vi.mock("../../../state/notify", () => ({
  useNotification: vi.fn(() => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  })),
}));

vi.mock("../../../utils/skos", () => ({
  serializeToSKOS: vi.fn(),
  parseFromSKOS: vi.fn(),
}));

vi.mock("../../../utils/skos-validation", () => ({
  validateTaxonomy: vi.fn(),
}));

vi.mock("../../../utils/export-formats", () => ({
  exportTaxonomy: vi.fn(),
  EXPORT_FORMATS: {
    "skos-rdf": {
      name: "SKOS RDF/XML",
      extension: "rdf",
      mimeType: "application/rdf+xml",
      description: "SKOS in RDF/XML format",
    },
    "skos-turtle": {
      name: "SKOS Turtle",
      extension: "ttl", 
      mimeType: "text/turtle",
      description: "SKOS in Turtle format",
    },
    "json": {
      name: "JSON",
      extension: "json",
      mimeType: "application/json", 
      description: "Native taxonomy JSON format",
    },
    "csv": {
      name: "CSV",
      extension: "csv",
      mimeType: "text/csv",
      description: "Flat CSV export",
    },
  },
}));

vi.mock("../ValidationResults", () => ({
  ValidationResults: ({ validation }: any) => (
    <div data-testid="validation-results">
      {validation ? (
        <div>
          <span>Errors: {validation.errors.length}</span>
          <span>Warnings: {validation.warnings.length}</span>
          <span>Valid: {validation.isValid ? "Yes" : "No"}</span>
        </div>
      ) : (
        <span>No validation</span>
      )}
    </div>
  ),
}));

vi.mock("../common/SelectField", () => ({
  __esModule: true,
  default: ({ label, items, value, onValueChange }: any) => (
    <div data-testid="format-select">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="format-select-input"
      >
        {items.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock global APIs
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);

// Check if clipboard already exists to avoid redefining
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    configurable: true,
  });
} else {
  navigator.clipboard.writeText = mockWriteText;
}

const mockFileReader = {
  readAsText: vi.fn(),
  result: null,
  onload: null as any,
};

global.FileReader = vi.fn(() => mockFileReader) as any;

// Mock data
const mockTaxonomy: Taxonomy = {
  metadata: {
    name: "Test Taxonomy",
    description: "A sample taxonomy for testing",
    version: "1.0",
    created: "2024-01-01T00:00:00Z",
    modified: "2024-01-02T00:00:00Z",
    creator: "Test User",
    namespace: "http://example.org/test/",
  },
  scheme: {
    uri: "http://example.org/test/scheme",
    prefLabel: "Test Taxonomy",
    hasTopConcept: ["concept-1"],
  },
  concepts: {
    "concept-1": {
      id: "concept-1",
      prefLabel: "Animals",
      definition: "Living organisms that feed on organic matter",
      narrower: [],
      related: [],
      topConcept: true,
    },
  },
};

const mockSKOSContent = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:skos="http://www.w3.org/2004/02/skos/core#">
  <skos:ConceptScheme rdf:about="http://example.org/test/scheme">
    <skos:prefLabel xml:lang="en">Test Taxonomy</skos:prefLabel>
  </skos:ConceptScheme>
</rdf:RDF>`;

const mockValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
  info: [],
};

const mockInvalidValidationResult = {
  isValid: false,
  errors: [
    { type: "error", code: "CONCEPT_NO_PREFLABEL", message: "Missing preferred label" },
  ],
  warnings: [],
  info: [],
};

describe("SKOSDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnImport = vi.fn();
  let mockNotify: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNotify = {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    };
    
    vi.mocked(useNotification).mockReturnValue(mockNotify);
    
    vi.mocked(serializeToSKOS).mockReturnValue(mockSKOSContent);
    vi.mocked(parseFromSKOS).mockResolvedValue(mockTaxonomy);
    vi.mocked(validateTaxonomy).mockReturnValue(mockValidationResult);
    vi.mocked(exportTaxonomy).mockReturnValue(JSON.stringify(mockTaxonomy, null, 2));
    
    // Reset clipboard mock
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Export Mode", () => {
    test("renders export dialog with correct title", () => {
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      expect(screen.getByText("Export Taxonomy")).toBeInTheDocument();
      expect(screen.getByText("Export Format")).toBeInTheDocument();
    });

    test("generates SKOS content on dialog open", () => {
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      expect(vi.mocked(serializeToSKOS)).toHaveBeenCalledWith(mockTaxonomy, "rdf");
      expect(screen.getByDisplayValue(mockSKOSContent)).toBeInTheDocument();
    });

    test("changes export format and regenerates content", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      const formatSelect = screen.getByTestId("format-select-input");
      await user.selectOptions(formatSelect, "skos-turtle");

      await waitFor(() => {
        expect(vi.mocked(serializeToSKOS)).toHaveBeenCalledWith(mockTaxonomy, "turtle");
      });
    });

    test("exports non-SKOS formats", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      const formatSelect = screen.getByTestId("format-select-input");
      await user.selectOptions(formatSelect, "json");

      await waitFor(() => {
        expect(vi.mocked(exportTaxonomy)).toHaveBeenCalledWith(mockTaxonomy, "json");
      });
    });

    test("validates SKOS content during export", () => {
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      expect(vi.mocked(validateTaxonomy)).toHaveBeenCalledWith(mockTaxonomy);
      expect(screen.getByRole("tab", { name: /Validation/ })).toBeInTheDocument();
    });

    test("copies content to clipboard", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      const copyButton = screen.getByLabelText("Copy");
      await user.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(mockSKOSContent);
      expect(mockNotify.success).toHaveBeenCalledWith("SKOS content copied to clipboard");
    });

    test("downloads exported content", async () => {
      const user = userEvent.setup();
      const mockCreateElement = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockClick = vi.fn();
      
      const mockAnchor = {
        href: "",
        download: "",
        click: mockClick,
      };
      
      const originalCreateElement = document.createElement;
      const originalAppendChild = document.body.appendChild;
      const originalRemoveChild = document.body.removeChild;
      
      document.createElement = mockCreateElement.mockReturnValue(mockAnchor);
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      const downloadButton = screen.getByText("Download");
      await user.click(downloadButton);

      expect(mockCreateElement).toHaveBeenCalledWith("a");
      expect(mockAnchor.download).toBe("Test-Taxonomy.rdf");
      expect(mockClick).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith("SKOS RDF/XML file downloaded");
      
      // Restore original methods
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    });

    test("handles export errors gracefully", () => {
      vi.mocked(serializeToSKOS).mockImplementation(() => {
        throw new Error("Export failed");
      });
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      expect(mockNotify.error).toHaveBeenCalledWith("Export failed: Export failed");
    });

    test("regenerates content when clicking regenerate", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      vi.mocked(serializeToSKOS).mockClear();
      
      const regenerateButton = screen.getByText("Regenerate");
      await user.click(regenerateButton);

      expect(vi.mocked(serializeToSKOS)).toHaveBeenCalledWith(mockTaxonomy, "rdf");
    });
  });

  describe("Import Mode", () => {
    test("renders import dialog with correct title", () => {
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      expect(screen.getByText("Import Taxonomy")).toBeInTheDocument();
      expect(screen.getByText("Import Format")).toBeInTheDocument();
      expect(screen.getByText("Import Source")).toBeInTheDocument();
      expect(screen.getByText("Taxonomy ID")).toBeInTheDocument();
    });

    test("filters import formats to only supported ones", () => {
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const formatSelect = screen.getByTestId("format-select-input");
      const options = formatSelect.querySelectorAll("option");
      
      // Should only show skos-rdf, skos-turtle, and json for import
      expect(options).toHaveLength(3);
      expect(Array.from(options).map(o => o.getAttribute("value")))
        .toEqual(["skos-rdf", "skos-turtle", "json"]);
    });

    test("validates required fields for import", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      expect(mockNotify.error).toHaveBeenCalledWith(
        "Please provide both content and taxonomy ID"
      );
    });

    test("imports SKOS RDF content successfully", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      // Fill in content and ID
      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      await user.type(contentTextarea, mockSKOSContent);
      await user.type(idTextarea, "test-taxonomy");

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      await waitFor(() => {
        expect(vi.mocked(parseFromSKOS)).toHaveBeenCalledWith(
          mockSKOSContent,
          "test-taxonomy",
          "rdf"
        );
        expect(mockOnImport).toHaveBeenCalledWith(mockTaxonomy, "test-taxonomy");
        expect(mockNotify.success).toHaveBeenCalledWith("Taxonomy imported successfully");
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    test("imports JSON content successfully", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      // Change format to JSON
      const formatSelect = screen.getByTestId("format-select-input");
      await user.selectOptions(formatSelect, "json");

      // Fill in content and ID
      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      const jsonContent = JSON.stringify(mockTaxonomy);
      await user.type(contentTextarea, jsonContent);
      await user.type(idTextarea, "test-taxonomy");

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalledWith(mockTaxonomy, "test-taxonomy");
      });
    });

    test("handles SKOS validation errors during import", async () => {
      const user = userEvent.setup();
      
      vi.mocked(validateTaxonomy).mockReturnValue(mockInvalidValidationResult);
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      await user.type(contentTextarea, mockSKOSContent);
      await user.type(idTextarea, "test-taxonomy");

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      await waitFor(() => {
        expect(mockNotify.error).toHaveBeenCalledWith(
          "Import validation failed with 1 errors"
        );
        expect(mockOnImport).not.toHaveBeenCalled();
      });
    });

    test("handles file upload", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const file = new File([mockSKOSContent], "test.rdf", { type: "application/rdf+xml" });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      // Trigger file selection
      await user.upload(fileInput, file);

      // Simulate FileReader onload
      mockFileReader.result = mockSKOSContent;
      mockFileReader.onload({ target: { result: mockSKOSContent } });

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockSKOSContent)).toBeInTheDocument();
        expect(screen.getByDisplayValue("test")).toBeInTheDocument(); // ID from filename
      });
    });

    test("auto-detects format from file extension", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const files = [
        { name: "test.ttl", expectedFormat: "skos-turtle" },
        { name: "test.rdf", expectedFormat: "skos-rdf" },
        { name: "test.xml", expectedFormat: "skos-rdf" },
        { name: "test.json", expectedFormat: "json" },
      ];

      for (const { name, expectedFormat } of files) {
        const file = new File(["content"], name);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        
        await user.upload(fileInput, file);
        mockFileReader.result = "content";
        mockFileReader.onload({ target: { result: "content" } });

        const formatSelect = screen.getByTestId("format-select-input");
        expect(formatSelect).toHaveValue(expectedFormat);
      }
    });

    test("handles import errors gracefully", async () => {
      const user = userEvent.setup();
      
      vi.mocked(parseFromSKOS).mockRejectedValue(new Error("Parse failed"));
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      await user.type(contentTextarea, mockSKOSContent);
      await user.type(idTextarea, "test-taxonomy");

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      await waitFor(() => {
        expect(mockNotify.error).toHaveBeenCalledWith("Import failed: Parse failed");
      });
    });

    test("disables import for unsupported formats", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      // Manually set format to an unsupported one (this would not normally be possible in UI)
      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      await user.type(contentTextarea, "some content");
      await user.type(idTextarea, "test-taxonomy");

      // Mock unsupported format
      const component = screen.getByTestId("format-select-input").parentElement?.parentElement;
      if (component) {
        // This simulates what would happen if somehow CSV was selected for import
        fireEvent.change(screen.getByTestId("format-select-input"), { target: { value: "csv" } });
      }
    });

    test("shows processing state during import", async () => {
      const user = userEvent.setup();
      
      // Make parse operation slow
      vi.mocked(parseFromSKOS).mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockTaxonomy), 100)
      ));
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      const contentTextarea = screen.getByPlaceholderText(/Paste.*content here/);
      const idTextarea = screen.getByPlaceholderText(/Enter unique taxonomy ID/);
      
      await user.type(contentTextarea, mockSKOSContent);
      await user.type(idTextarea, "test-taxonomy");

      const importButton = screen.getByText("Import Taxonomy");
      await user.click(importButton);

      // Button should be disabled and show loading state
      expect(importButton).toBeDisabled();

      await waitFor(() => {
        expect(mockOnImport).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe("Common functionality", () => {
    test("closes dialog when cancel/close is clicked", async () => {
      const user = userEvent.setup();
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test("resets state when dialog opens", () => {
      const { rerender } = render(
        <SKOSDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      rerender(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="import"
          onImport={mockOnImport}
        />
      );

      // State should be reset - empty content and ID fields
      expect(screen.getByPlaceholderText(/Paste.*content here/)).toHaveValue("");
      expect(screen.getByPlaceholderText(/Enter unique taxonomy ID/)).toHaveValue("");
    });

    test("shows validation results tab when validation is available", () => {
      vi.mocked(validateTaxonomy).mockReturnValue(mockInvalidValidationResult);
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      expect(screen.getByRole("tab", { name: /Validation/ })).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // Error count badge
    });

    test("switches between content and validation tabs", async () => {
      const user = userEvent.setup();
      vi.mocked(validateTaxonomy).mockReturnValue(mockValidationResult);
      
      render(
        <SKOSDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          taxonomy={mockTaxonomy}
          mode="export"
        />
      );

      // Switch to validation tab
      const validationTab = screen.getByRole("tab", { name: /Validation/ });
      await user.click(validationTab);

      expect(screen.getByTestId("validation-results")).toBeInTheDocument();
    });
  });
});