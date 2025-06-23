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
    this.server = new McpServer(
      {
        name: "fhir-mcp-server",
        version: "0.1.0",
      },
    );

    this.setupToolHandlers();

    // Error handling
    /**this.server.onerror = (error: Error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });*/
  }

  private setupToolHandlers() {
    fhirResourceTools.map((tool) => {
      this.server.registerTool(tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema
        },
        tool.handler,
      )
    });

    // Add a dynamic greeting resource
    this.server.registerResource(
      "greeting",
      new ResourceTemplate("greeting://{name}", { list: undefined }),
      {
        title: "Greeting Resource", // Display name for UI
        description: "Dynamic greeting generator",
      },
      async (uri: URL) => {
        const name = uri.pathname.replace(/^\//, "");
        return {
          contents: [
            {
              uri: uri.href,
              text: `Hello, ${name}!`,
            },
          ],
        };
      }
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FHIR MCP server running on stdio");
  }
}

export { FHIRMCPServer }

