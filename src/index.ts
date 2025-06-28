#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fhirMcpServer } from "./mcp/server.js";

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

async function run() {
  const transport = new StdioServerTransport();
  await fhirMcpServer.connect(transport);
  console.error("FHIR MCP server running on stdio");
}

void run();
