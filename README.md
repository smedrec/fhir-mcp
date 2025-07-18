# FHIR MCP Server

A Model Context Protocol (MCP) server designed to securely access, retrieve, and manage health data from an external FHIR (Fast Healthcare Interoperability Resources) compatible server. This server can be used with tools like StudioServerTransport.

## Features

- Provides MCP tools to interact with a FHIR server:
  - `fhir_resource_read`: Read a specific FHIR resource by type and ID.
  - `fhir_resource_search`: Search for FHIR resources based on FHIR search parameters.
  - `fhir_resource_create`: Create a new FHIR resource.
  - `fhir_resource_update`: Update an existing FHIR resource by type and ID.
  - `fhir_resource_delete`: Delete a FHIR resource by type and ID.
- Configurable FHIR server endpoint.
- Basic audit logging for FHIR operations.
- Designed for use with `@modelcontextprotocol/inspector` and StudioServerTransport.

## Prerequisites

- Node.js (version specified in `package.json` engines field, e.g., >=18.0.0)
- npm (comes with Node.js)
- Access to a FHIR R4 compatible server. A public test server like `http://hapi.fhir.org/baseR4` can be used for testing.

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

- **`SMART_CLIENT_ID`**: (Required) The OAuth 2.0 Client ID for your SMART on FHIR application.
  - Example: `export SMART_CLIENT_ID="your_client_id"`
- **`SMART_SCOPE`**: (Required) The OAuth 2.0 scopes your application requires.
  - Example: `export SMART_SCOPE="patient/*.read launch openid fhirUser"`
- **`SMART_ISS`**: (Required) The Issuer URL of the FHIR authorization server. This is often the base URL of the FHIR server. Must be HTTPS.
  - Example: `export SMART_ISS="https://your-fhir-server.com/fhir"`
- **`SMART_REDIRECT_URI`**: (Required) The callback URL for your application, registered with the FHIR authorization server. This MCP server will listen on this URI at the `/callback` path.
  - Example: `export SMART_REDIRECT_URI="http://localhost:3000/callback"` (Note: For production, this MUST be HTTPS)
- **`FHIR_BASE_URL`** (Optional): If the FHIR API base URL is different from the `SMART_ISS` URL. If not provided, `SMART_ISS` will be used as the base for FHIR API calls.
  - Example: `export FHIR_BASE_URL="https://api.your-fhir-server.com/fhir/R4"`
- **`DEBUG`**: (Optional) Set to `true` to enable debug logging.
  - Example: `export DEBUG="true"`

## Authentication Flow (SMART on FHIR)

This server implements the SMART App Launch Framework using OAuth 2.0 Authorization Code Grant with PKCE.

1.  **Initiate Launch (Standalone or EHR Launch)**:
    *   **Standalone Launch**: Navigate your browser to the `/authorize` endpoint of this MCP server (e.g., `http://localhost:3000/authorize`).
    *   **EHR Launch**: The EHR will redirect the user's browser to the `/init` endpoint of this MCP server (e.g., `http://localhost:3000/init?iss=<issuer_url>&launch=<launch_token>`).
2.  **Authorization**: The MCP server will redirect the user to the FHIR server's authorization page. The user authenticates and grants access.
3.  **Callback**: The FHIR server redirects the user back to the `SMART_REDIRECT_URI` (e.g., `http://localhost:3000/callback`) handled by this MCP server.
4.  **Token Exchange**: The MCP server exchanges the authorization code for an access token.
5.  **Session**: The access token is stored in a secure, HttpOnly cookie. Subsequent calls to the FHIR tools by the MCP client (e.g., MCP Inspector) will use this token.

The server exposes the following SMART-specific endpoints:
- `/init`: For EHR-initiated launches.
- `/authorize`: Initiates the OAuth2 flow (can be used for standalone launch).
- `/callback`: Handles the OAuth2 redirect from the authorization server.
- `/ready`: A simple endpoint that returns 200 OK if an active session (access_token cookie) exists, typically used by client applications to check readiness.

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

- **`fhir_resource_read`**:
  - Description: Reads a FHIR resource by ID.
  - Input:
    - `resourceType` (string): The FHIR resource type (e.g., `Patient`, `Observation`).
    - `id` (string): The ID of the resource.
  - Output: The FHIR resource, or an error if not found.

- **`fhir_resource_search`**:
  - Description: Search FHIR resources by FHIR standard parameters.
  - Input:
    - `resourceType` (string): The FHIR resource type.
    - `searchParams` (object): A key-value map of search parameters (e.g., `{"name": "John Doe", "_count": "10"}`).
  - Output: A FHIR Bundle containing the search results.

- **`fhir_resource_create`**:
  - Description: Create FHIR resources.
  - Input:
    - `resourceType` (string): The FHIR resource type.
    - `resource` (object): The FHIR resource content to create. The `resourceType` field within this object should match.
  - Output: The created FHIR resource, including server-assigned ID and metadata.

- **`ffhir_resource_update`**:
  - Description: Update FHIR resources.
  - Input:
    - `resourceType` (string): The FHIR resource type.
    - `id` (string): The ID of the resource to update.
    - `resource` (object): The FHIR resource content to update. Must include an `id` field matching the `id` parameter.
  - Output: The updated FHIR resource, including new metadata (e.g., version ID).

- **`fhir_resource_delete`**:
  - Description: Delete FHIR resources.
  - Input:
    - `resourceType` (string): The FHIR resource type.
    - `id` (string): The ID of the resource to delete.
  - Output: Confirmation of deletion (e.g., status code, OperationOutcome).

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

- **Code Structure**:
  - `src/index.ts`: Main entry point.
  - `src/mcp/server.ts`: MCP server setup and tool registration.
  - `src/mcp/tools/fhir-tools.ts`: Implementation of FHIR interaction tools.
  - `src/lib/audit.ts`: Basic audit logging.
  - `src/mcp/environment.ts`: Configuration for FHIR base URL.
- **Building**: `npm run build`
- **Linting/Formatting**: ESLint/Prettier for code consistency.

## License

MIT License - see LICENSE for details.
