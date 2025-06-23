#!/usr/bin/env node
import { FHIRMCPServer } from "./mcp/server.js";

const server = new FHIRMCPServer();
server.run().catch(console.error);
