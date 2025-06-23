#!/usr/bin/env node
import { FHIRMCPServer } from "./mcp/server";

const server = new FHIRMCPServer();
server.run().catch(console.error);
