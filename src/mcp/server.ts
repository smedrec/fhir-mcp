#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { IMcpTool } from "./tools/IMcpTool.js";
import * as tools from "./tools/index.js";

const SERVER_INFO: Implementation = {
  name: "FHIR RESOURCES MCP",
  version: "0.2.0",
};

export const fhirMcpServer = new McpServer(SERVER_INFO);

for (const tool of Object.values<IMcpTool>(tools)) {
  tool.registerTool(fhirMcpServer);
}
