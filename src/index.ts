#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fhirMcpServer } from "./mcp/server.js";

/**
 * Main function to start the FHIR MCP Server
 */
async function main() {
  try {
    console.error('Starting FHIR MCP Server...');

    // Error handling
    // fhirMcpServer.onerror = (error: Error) => console.error("[MCP Error]", error); // Commented out due to TS error, needs SDK v1.13.0 check
    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down server...");
      await fhirMcpServer.close();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down server...");
      await fhirMcpServer.close();
      process.exit(0);
    });

    // Connect to the server transport (stdio)
    const transport = new StdioServerTransport();
    await fhirMcpServer.connect(transport);

    console.error('FHIR MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start FHIR MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch(console.error);
