#!/usr/bin/env node
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fhirResourceTools } from "./tools/fhir-tools";

class FHIRMCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: "fhir-mcp-server",
      version: "0.1.0",
    });

    this.setupToolHandlers();

    // Error handling
    // this.server.onerror = (error: Error) => console.error("[MCP Error]", error); // Commented out due to TS error, needs SDK v1.13.0 check
    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down server...");
      await this.server.close();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down server...");
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    fhirResourceTools.forEach((tool) => {
      this.server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema,
        },
        async (args: any, extra: any) => {
          // Call the original handler and adapt the result to MCP SDK format
          const result = await tool.handler(args, extra);
          // Ensure each content item has the required structure
          return {
            ...result,
            content: (result.content || []).map((item: any) => ({
              ...item,
              type: item.type || "text",
              text: item.text || "",
              // Add other required properties or adapt as needed
            })),
          };
        }
      );
    });

    // Example resource removed
    // this.server.registerResource(...)
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FHIR MCP server running on stdio");
  }
}

export { FHIRMCPServer };
