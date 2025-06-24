# FHIR MCP Server

A Model Context Protocol (MCP) server designed to securely access, retrieve, and manage health data from an external FHIR (Fast Healthcare Interoperability Resources) compatible server. This server can be used with tools like StudioServerTransport.

## Features

*   Provides MCP tools to interact with a FHIR server:
    *   `fhirResourceRead`: Read a specific FHIR resource by type and ID.
    *   `fhirResourceSearch`: Search for FHIR resources based on FHIR search parameters.
    *   `fhirResourceCreate`: Create a new FHIR resource.
    *   `fhirResourceUpdate`: Update an existing FHIR resource by type and ID.
    *   `fhirResourceDelete`: Delete a FHIR resource by type and ID.
*   Configurable FHIR server endpoint.
*   Basic audit logging for FHIR operations.
*   Designed for use with `@modelcontextprotocol/inspector` and StudioServerTransport.

## Prerequisites

*   Node.js (version specified in `package.json` engines field, e.g., >=18.0.0)
*   npm (comes with Node.js)
*   Access to a FHIR R4 compatible server. A public test server like `http://hapi.fhir.org/baseR4` can be used for testing.

## Installation

1.  **Clone the repository (if you have it as a project):**
    ```bash
    git clone <repository_url>
    cd fhir-mcp-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the server:**
    ```bash
    npm run build
    ```

## Configuration

The server is configured using environment variables:

*   `FHIR_SERVER_BASE_URL`: The base URL of the FHIR server.
    *   Defaults to `http://hapi.fhir.org/baseR4` if not set.
    *   Example: `export FHIR_SERVER_BASE_URL="https://your-fhir-server.com/fhir"`
*   `FHIR_ACCESS_TOKEN` (Optional): If your FHIR server requires Bearer token authentication.
    *   You will need to uncomment and potentially adjust the Authorization header logic in `src/mcp/tools/fhir-tools.ts` to use this token.
    *   Example: `export FHIR_ACCESS_TOKEN="your_very_secure_token"`

## Usage

### Running with MCP Inspector

The MCP Inspector is a useful tool for testing and interacting with MCP servers.

1.  **Ensure the server is built:**
    ```bash
    npm run build
    ```
2.  **Set environment variables (see Configuration).**
3.  **Start the server with the inspector:**
    ```bash
    npm run inspector
    ```
    This will typically open a web browser interface where you can select and execute the available FHIR tools.

### Running as a standalone server (e.g., for StudioServerTransport)

1.  **Ensure the server is built.**
2.  **Set environment variables.**
3.  **Run the server:**
    ```bash
    npm start
    ```
    Or directly:
    ```bash
    node build/index.js
    ```
    The server will listen on stdin/stdout for MCP messages.

### Available Tools

Once connected to the server (e.g., via MCP Inspector), the following tools will be available:

*   **`fhirResourceRead`**:
    *   Description: Reads a FHIR resource by ID.
    *   Input:
        *   `resourceType` (string): The FHIR resource type (e.g., `Patient`, `Observation`).
        *   `id` (string): The ID of the resource.
    *   Output: The FHIR resource, or an error if not found.

*   **`fhirResourceSearch`**:
    *   Description: Search FHIR resources by FHIR standard parameters.
    *   Input:
        *   `resourceType` (string): The FHIR resource type.
        *   `searchParams` (object): A key-value map of search parameters (e.g., `{"name": "John Doe", "_count": "10"}`).
    *   Output: A FHIR Bundle containing the search results.

*   **`fhirResourceCreate`**:
    *   Description: Create FHIR resources.
    *   Input:
        *   `resourceType` (string): The FHIR resource type.
        *   `resource` (object): The FHIR resource content to create. The `resourceType` field within this object should match.
    *   Output: The created FHIR resource, including server-assigned ID and metadata.

*   **`fhirResourceUpdate`**:
    *   Description: Update FHIR resources.
    *   Input:
        *   `resourceType` (string): The FHIR resource type.
        *   `id` (string): The ID of the resource to update.
        *   `resource` (object): The FHIR resource content to update. Must include an `id` field matching the `id` parameter.
    *   Output: The updated FHIR resource, including new metadata (e.g., version ID).

*   **`fhirResourceDelete`**:
    *   Description: Delete FHIR resources.
    *   Input:
        *   `resourceType` (string): The FHIR resource type.
        *   `id` (string): The ID of the resource to delete.
    *   Output: Confirmation of deletion (e.g., status code, OperationOutcome).

## Publishing to NPM (For Developers)

1.  **Update `package.json`**: Ensure `version`, `author`, `repository`, etc., are correct. (Placeholders for `author` and `repository` should be updated).
2.  **Login to NPM**:
    ```bash
    npm login
    ```
3.  **Publish**:
    ```bash
    npm publish
    ```
    The `prepublishOnly` script will automatically run `npm run build` before publishing.

## Development

*   **Code Structure**:
    *   `src/index.ts`: Main entry point.
    *   `src/mcp/server.ts`: MCP server setup and tool registration.
    *   `src/mcp/tools/fhir-tools.ts`: Implementation of FHIR interaction tools.
    *   `src/lib/audit.ts`: Basic audit logging.
    *   `src/config.ts`: Configuration for FHIR base URL.
*   **Building**: `npm run build`
*   **Linting/Formatting**: ESLint/Prettier for code consistency.

## License

MIT License - see LICENSE for details.