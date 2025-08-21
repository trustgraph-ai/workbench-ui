import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlowsApi } from "../trustgraph-socket";
import { FlowResponse } from "../messages";

describe("FlowsApi", () => {
  let mockApi: {
    makeRequest: ReturnType<typeof vi.fn>;
  };
  let flowsApi: FlowsApi;

  beforeEach(() => {
    mockApi = {
      makeRequest: vi.fn(),
    };
    flowsApi = new FlowsApi(mockApi);
  });

  describe("startFlow", () => {
    it("should call makeRequest with correct types and parameters", async () => {
      const mockResponse: FlowResponse = {
        flow: "started",
        description: "Flow started successfully",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.startFlow(
        "test-flow-id",
        "test-class",
        "Test description",
      );

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "start-flow",
          "flow-id": "test-flow-id",
          "class-name": "test-class",
          description: "Test description",
        },
        30000,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use FlowRequest and FlowResponse types", async () => {
      const mockResponse: FlowResponse = {};
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      await flowsApi.startFlow("id", "class", "desc");

      // Verify the call signature matches FlowRequest/FlowResponse types
      const callArgs = mockApi.makeRequest.mock.calls[0];
      const request = callArgs[1];

      // These properties should match FlowRequest interface
      expect(request).toHaveProperty("operation");
      expect(request).toHaveProperty("flow-id");
      expect(request).toHaveProperty("class-name");
      expect(request).toHaveProperty("description");
    });
  });

  describe("stopFlow", () => {
    it("should call makeRequest with correct types and parameters", async () => {
      const mockResponse: FlowResponse = {
        flow: "stopped",
        description: "Flow stopped successfully",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.stopFlow("test-flow-id");

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "stop-flow",
          "flow-id": "test-flow-id",
        },
        30000,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use FlowRequest and FlowResponse types", async () => {
      const mockResponse: FlowResponse = {};
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      await flowsApi.stopFlow("id");

      // Verify the call signature matches FlowRequest/FlowResponse types
      const callArgs = mockApi.makeRequest.mock.calls[0];
      const request = callArgs[1];

      // These properties should match FlowRequest interface
      expect(request).toHaveProperty("operation");
      expect(request).toHaveProperty("flow-id");
    });
  });

  describe("getFlows", () => {
    it("should return flow-ids array from response", async () => {
      const mockResponse: FlowResponse = {
        "flow-ids": ["flow1", "flow2", "flow3"],
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlows();

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "list-flows",
        },
        60000,
      );
      expect(result).toEqual(["flow1", "flow2", "flow3"]);
    });

    it("should return empty array when flow-ids is undefined", async () => {
      const mockResponse: FlowResponse = {};
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlows();

      expect(result).toEqual([]);
    });

    it("should handle response with flow-ids property correctly", async () => {
      // This test ensures we're accessing the hyphenated property name correctly
      const mockResponse = {
        "flow-ids": ["test-flow"],
        "other-property": "should-be-ignored",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlows();

      expect(result).toEqual(["test-flow"]);
    });
  });

  describe("getFlowClasses", () => {
    it("should return class-names array from response", async () => {
      const mockResponse: FlowResponse = {
        "class-names": ["class1", "class2"],
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlowClasses();

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "list-classes",
        },
        60000,
      );
      expect(result).toEqual(["class1", "class2"]);
    });

    it("should handle response with class-names property correctly", async () => {
      // This test ensures we're accessing the hyphenated property name correctly
      const mockResponse = {
        "class-names": ["test-class"],
        "other-property": "should-be-ignored",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlowClasses();

      expect(result).toEqual(["test-class"]);
    });
  });

  describe("getFlow", () => {
    it("should call makeRequest with correct parameters and parse JSON", async () => {
      const flowDefinition = { type: "flow", config: "test" };
      const mockResponse: FlowResponse = {
        flow: JSON.stringify(flowDefinition), // Must be valid JSON string
        description: "Test flow",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlow("test-flow-id");

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "get-flow",
          "flow-id": "test-flow-id",
        },
        60000,
      );
      expect(result).toEqual(flowDefinition); // Result should be parsed JSON
    });
  });

  describe("getFlowClass", () => {
    it("should call makeRequest with correct parameters and parse JSON", async () => {
      const classDefinition = { type: "class", name: "test-class" };
      const mockResponse: FlowResponse = {
        "class-definition": JSON.stringify(classDefinition), // Must be valid JSON string
        description: "Test class",
      };
      mockApi.makeRequest.mockResolvedValue(mockResponse);

      const result = await flowsApi.getFlowClass("test-class");

      expect(mockApi.makeRequest).toHaveBeenCalledWith(
        "flow",
        {
          operation: "get-class",
          "class-name": "test-class",
        },
        60000,
      );
      expect(result).toEqual(classDefinition); // Result should be parsed JSON
    });
  });
});
