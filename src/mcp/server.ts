#!/usr/bin/env node
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fhirResourceTools } from "./tools/fhir-tools.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";
//import { getResourceByType } from "../lib/get-resource-by-type.js";

class FHIRMCPServer {
  private server: McpServer;
  private SERVER_INFO: Implementation = { name: "FHIR RESOURCES MCP", version: "0.1.0" }

  constructor() {
    this.server = new McpServer(this.SERVER_INFO);

    // Example resource
    /**this.server.registerResource(
      "fhir-resource-definition",
      new ResourceTemplate("fhir://{resourceType}/definition", {
        list: undefined,
        complete: {
          // Provide intelligent completions based on previously resolved parameters
          definition: async (value, context) => {
            const resourceType = context?.arguments?.["resourceType"];
            if (typeof resourceType !== "string") {
              throw new Error("resourceType argument is required and must be a string");
            }
            return JSON.stringify(await getResourceByType(resourceType), null, 2);
          }
        }
      }),
      {
        title: "FHIR Resource Definitions",
        description: "Returns the json representation of the resource on the fhir server"
      },
      async (uri: URL, { definition: string }) => {
        // Safely extract arguments from extra if present
        //const args = extra?.arguments as Record<string, unknown> | undefined;
        //const definition = args?.definition;
        return {
          content: [{
            uri: uri.href,
            text: JSON.stringify(definition, null, 2),
            mimeType: "text/plain"
          }]
        };
      }
    );*/

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
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FHIR MCP server running on stdio");
  }
}

export { FHIRMCPServer };
