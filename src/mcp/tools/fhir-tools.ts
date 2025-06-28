import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { logAuditEvent } from "../../lib/audit.js";
import axios from "axios";
import z from "zod";
import { IMcpTool } from "./IMcpTool.js";
import { getEnvConfig } from "../environment.js"; // Added
//import { createSmartFhirClient } from "../../lib/client.js";
//import { authorize } from "../../lib/authorize.js";

// Create an axios instance for FHIR requests
const fhirClient = axios.create({
  // baseURL will be set dynamically based on envConfig.smartIss or envConfig.fhirBaseUrl
  headers: {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
  },
});

const defaultPrincipalId = "anonymous";
//const defaultRoles = ['anonymous']

// Function to get the base URL for FHIR requests
function getFhirBaseUrl() {
  const env = getEnvConfig();
  return env.fhirBaseUrl || env.smartIss;
}

// Update baseURL before each request, as it might depend on runtime config
fhirClient.interceptors.request.use(config => {
  config.baseURL = getFhirBaseUrl();
  return config;
});


function createTextResponse(
  text: string,
  options: { isError: boolean } = { isError: false }
): { content: { type: "text"; text: string }[]; isError?: boolean } {
  return {
    content: [{ type: "text", text }],
    isError: options.isError,
  };
}

class fhirResourceReadTool implements IMcpTool {
  registerTool(server: McpServer) {
    server.tool(
      "fhir_resource_read",
      "Reads a FHIR resource by ID.",
      {
        resourceType: z
          .string()
          .optional()
          .describe(
            "The FHIR resource type, ex: Patient, Organization, Practitioner, etc."
          ),
        id: z.string().optional().describe("The resource ID"),
      },
      async ({ resourceType, id }, extra) => {
        const toolName = "fhir_resource_read";
        const resourceId = id;
        const principalId = extra?.principal?.id || defaultPrincipalId;
        const accessToken = extra?.req?.cookies?.access_token;

        if (!accessToken) {
          return createTextResponse("Unauthorized: Missing access token.", {
            isError: true,
          });
        }

        try {
          // Log the attempt
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId,
            outcome: "success", // Assuming success until an error occurs
            //details: { params }
          });

          const response = await fhirClient.get(
            `/${resourceType}/${resourceId}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          // Log successful outcome
          // logAuditEvent - already logged attempt, could update with outcome or log separately

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error(
            `[${toolName}] Error reading ${resourceType}/${resourceId}:`,
            error.response?.data || error.message
          );
          // Log failure outcome
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId,
            outcome: "failure",
            details: { error: error.response?.data || error.message },
          });
          // Propagate the error or return a structured error response
          return createTextResponse(
            `[${toolName}] Error reading ${resourceType}/${resourceId}:`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const fhirResourceReadToolInstance = new fhirResourceReadTool();

class fhirResourceSearchTool implements IMcpTool {
  registerTool(server: McpServer) {
    server.tool(
      "fhir_resource_search",
      "Search FHIR resources by fhir standard parameters.",
      {
        resourceType: z
          .string()
          .optional()
          .describe(
            "The FHIR resource type, ex: Patient, Organization, Practitioner, etc."
          ),
        searchParams: z
          .record(z.string())
          .describe(
            'A record of search parameters, e.g., {"name": "John Doe", "_count": "10"}'
          ),
      },
      async ({ resourceType, searchParams }, extra) => {
        const toolName = "fhirResourceSearch"; // Corrected tool name
        const principalId = extra?.principal?.id || defaultPrincipalId;
        const accessToken = extra?.req?.cookies?.access_token;

        if (!accessToken) {
          return createTextResponse("Unauthorized: Missing access token.", {
            isError: true,
          });
        }

        try {
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            outcome: "success", // Assuming success
            details: { searchParams },
          });

          const response = await fhirClient.get(`/${resourceType}`, {
            params: searchParams,
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        } catch (error: any) {
          console.error(
            `[${toolName}] Error searching ${resourceType} with params ${JSON.stringify(searchParams)}:`,
            error.response?.data || error.message
          );
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            outcome: "failure",
            details: {
              searchParams,
              error: error.response?.data || error.message,
            },
          });
          return createTextResponse(
            `Failed to search FHIR resources ${resourceType}: ${error.message}`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const fhirResourceSearchToolInstance = new fhirResourceSearchTool();

class fhirResourceCreateTool implements IMcpTool {
  registerTool(server: McpServer) {
    server.tool(
      "fhir_resource_create",
      "Create FHIR resources.",
      {
        resourceType: z
          .string()
          .describe(
            "The FHIR resource type, ex: Patient, Organization, Practitioner, etc."
          ),
        resource: z.unknown(),
      },
      async ({ resourceType, resource }, extra) => {
        const toolName = "fhir_resource_create";
        const principalId = extra?.principal?.id || defaultPrincipalId;
        const accessToken = extra?.req?.cookies?.access_token;

        if (!accessToken) {
          return createTextResponse("Unauthorized: Missing access token.", {
            isError: true,
          });
        }

        /**if (resource.resourceType && resource.resourceType !== resourceType) {
          throw new Error(
            `Payload resourceType (${resource.resourceType}) does not match path resourceType (${resourceType})`
          );
        }
        // Ensure the resource being created has the correct resourceType if not already set
        if (!resource.resourceType) {
          resource.resourceType = resourceType;
        }*/

        try {
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            outcome: "success", // Assuming success
            //details: { resourceType, resource } // Be cautious about logging entire resource if sensitive
          });

          const response = await fhirClient.post(
            `/${resourceType}`,
            resource,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          // Return the created resource, often includes server-assigned ID and metadata
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        } catch (error: any) {
          console.error(
            `[${toolName}] Error creating ${resourceType}:`,
            error.response?.data || error.message
          );
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            outcome: "failure",
            details: {
              resourceType,
              error: error.response?.data || error.message,
            },
          });
          return createTextResponse(
            `Failed to create FHIR resource ${resourceType}: ${error.message}`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const fhirResourceCreateToolInstance = new fhirResourceCreateTool();

class fhirResourceUpdateTool implements IMcpTool {
  registerTool(server: McpServer) {
    server.tool(
      "fhir_resource_update",
      "Update FHIR resources.",
      {
        resourceType: z
          .string()
          .describe(
            "The FHIR resource type, ex: Patient, Organization, Practitioner, etc."
          ),
        id: z.string().describe("The ID of the resource to update"),
        resource: z.unknown(),
      },
      async ({ resourceType, id, resource }, extra) => {
        const toolName = "fhir_resource_update";
        const principalId = extra?.principal?.id || defaultPrincipalId;
        const accessToken = extra?.req?.cookies?.access_token;

        if (!accessToken) {
          return createTextResponse("Unauthorized: Missing access token.", {
            isError: true,
          });
        }

        /**if (!resource.id) {
          throw new Error(
            `Resource payload for update must include an 'id' field.`
          );
        }
        if (resource.id !== id) {
          throw new Error(
            `Resource payload ID (${resource.id}) does not match ID in path (${id}).`
          );
        }
        if (resource.resourceType && resource.resourceType !== resourceType) {
          throw new Error(
            `Payload resourceType (${resource.resourceType}) does not match path resourceType (${resourceType})`
          );
        }
        // Ensure the resource being updated has the correct resourceType if not already set
        if (!resource.resourceType) {
          resource.resourceType = resourceType;
        }*/

        try {
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId: id,
            outcome: "success", // Assuming success
            details: { resourceType, id, resource }, // Be cautious about logging entire resource
          });

          const response = await fhirClient.put(
            `/${resourceType}/${id}`,
            resource,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          // Return the updated resource, often includes server-assigned version ID and metadata
          return {
            content: [
              { type: "text", text: JSON.stringify(response.data, null, 2) },
            ],
          };
        } catch (error: any) {
          console.error(
            `[${toolName}] Error updating ${resourceType}/${id}:`,
            error.response?.data || error.message
          );
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId: id,
            outcome: "failure",
            details: {
              resourceType,
              id,
              error: error.response?.data || error.message,
            },
          });
          return createTextResponse(
            `Failed to update FHIR resource ${resourceType}/${id}: ${error.message}`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const fhirResourceUpdateToolInstance = new fhirResourceUpdateTool();

class fhirResourceDeleteTool implements IMcpTool {
  registerTool(server: McpServer) {
    server.tool(
      "fhir_resource_delete",
      "Delete FHIR resources.",
      {
        resourceType: z
          .string()
          .describe(
            "The FHIR resource type, ex: Patient, Organization, Practitioner, etc."
          ),
        id: z.string().describe("The ID of the resource to update"),
      },
      async ({ resourceType, id }, extra) => {
        const toolName = "fhir_resource_delete";
        const principalId = extra?.principal?.id || defaultPrincipalId;
        const accessToken = extra?.req?.cookies?.access_token;

        if (!accessToken) {
          return createTextResponse("Unauthorized: Missing access token.", {
            isError: true,
          });
        }

        try {
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId: id,
            outcome: "success", // Assuming success
            details: { resourceType, id },
          });

          const response = await fhirClient.delete(
            `/${resourceType}/${id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          // Typically returns OperationOutcome or status code 204 (No Content)
          // For simplicity, we can return the status or a success message.
          // response.data might be an OperationOutcome
          // Return structure should be consistent with other tools
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data, // Could be an OperationOutcome
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          console.error(
            `[${toolName}] Error deleting ${resourceType}/${id}:`,
            error.response?.data || error.message
          );
          logAuditEvent({
            principalId,
            action: toolName,
            resourceType,
            resourceId: id,
            outcome: "failure",
            details: {
              resourceType,
              id,
              error: error.response?.data || error.message,
            },
          });
          return createTextResponse(
            `Failed to delete FHIR resource ${resourceType}/${id}: ${error.message}`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const fhirResourceDeleteToolInstance = new fhirResourceDeleteTool();
