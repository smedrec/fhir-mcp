#!/usr/bin/env node
declare class FHIRMCPServer {
    private server;
    constructor();
    private setupToolHandlers;
    run(): Promise<void>;
}
export { FHIRMCPServer };
