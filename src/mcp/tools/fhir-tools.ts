import { logAuditEvent } from "../../lib/audit.js";
import axios from 'axios';
import { fhirServerBaseUrl } from '../../config.js';
import z from "zod";
//import { createSmartFhirClient } from "../../lib/client.js";
//import { authorize } from "../../lib/authorize.js";
//import { config } from "../../config.js";

// Create an axios instance for FHIR requests
const fhirClient = axios.create({
  baseURL: fhirServerBaseUrl,
  headers: {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
    //Authorization: `Bearer ${await authorize()}`,
  },
});

// TODO: This is a placeholder. Real authentication/authorization might be needed.
// Example: fhirClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.FHIR_ACCESS_TOKEN}`;

const defaultPrincipalId = "anonymous";
//const defaultRoles = ['anonymous']

export const fhirResourceReadTool = {
  name: "fhirResourceRead",
  description: "Reads a FHIR resource by ID.",
  inputSchema: {
    resourceType: z
      .string()
      .describe(
        "The FHIR resource type, ex: Patient, Organization, Practitioner"
      ),
    id: z.string().describe("The resource ID"),
  },
  handler: async (
    { resourceType, id }: { resourceType: string; id: string },
    extra: any
  ) => {
    const toolName = "fhirResourceRead";
    const resourceId = id;
    const principalId = defaultPrincipalId; // Or get from actual session/context

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

      const response = await fhirClient.get(`/${resourceType}/${resourceId}`);

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
      throw new Error(
        `Failed to read FHIR resource ${resourceType}/${resourceId}: ${error.message}`
      );
    }
  },
};

export const fhirResourceSearchTool = {
  name: "fhirResourceSearch",
  description: "Search FHIR resources by fhir standard parameters.",
  inputSchema: {
    resourceType: z
      .string()
      .describe(
        "The FHIR resource type, ex: Patient, Organization, Practitioner"
      ),
    searchParams: z
      .record(z.string())
      .describe(
        'A record of search parameters, e.g., {"name": "John Doe", "_count": "10"}'
      ),
  },
  handler: async (
    {
      resourceType,
      searchParams,
    }: { resourceType: string; searchParams: Record<string, string> },
    extra: any
  ) => {
    const toolName = "fhirResourceSearch"; // Corrected tool name
    const principalId = defaultPrincipalId; // Or get from actual session/context

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
        details: { searchParams, error: error.response?.data || error.message },
      });
      throw new Error(
        `Failed to search FHIR resources ${resourceType}: ${error.message}`
      );
    }
  },
};

export const fhirResourceCreateTool = {
  name: "fhirResourceCreate",
  description: "Create FHIR resources.",
  inputSchema: {
    resourceType: z
      .string()
      .describe(
        "The FHIR resource type, ex: Patient, Organization, Practitioner"
      ),
    resource: z.unknown(),
  },
  handler: async (
    { resourceType, resource }: { resourceType: string; resource: any },
    extra: any
  ) => {
    const toolName = "fhirResourceCreate";
    const principalId = defaultPrincipalId;

    if (resource.resourceType && resource.resourceType !== resourceType) {
      throw new Error(
        `Payload resourceType (${resource.resourceType}) does not match path resourceType (${resourceType})`
      );
    }
    // Ensure the resource being created has the correct resourceType if not already set
    if (!resource.resourceType) {
      resource.resourceType = resourceType;
    }

    try {
      logAuditEvent({
        principalId,
        action: toolName,
        resourceType,
        outcome: "success", // Assuming success
        //details: { resourceType, resource } // Be cautious about logging entire resource if sensitive
      });

      const response = await fhirClient.post(`/${resourceType}`, resource);
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
        details: { resourceType, error: error.response?.data || error.message },
      });
      throw new Error(
        `Failed to create FHIR resource ${resourceType}: ${error.message}`
      );
    }
  },
};

export const fhirResourceUpdateTool = {
  name: "fhirResourceUpdate",
  description: "Update FHIR resources.",
  inputSchema: {
    resourceType: z
      .string()
      .describe(
        "The FHIR resource type, ex: Patient, Organization, Practitioner"
      ),
    id: z.string().describe("The ID of the resource to update"),
    resource: z
      .unknown()
      .describe(
        "The FHIR resource content to update. Must contain an `id` matching the URL."
      ),
  },
  handler: async (
    {
      resourceType,
      id,
      resource,
    }: { resourceType: string; id: string; resource: any },
    extra: any
  ) => {
    const toolName = "fhirResourceUpdate";
    const principalId = defaultPrincipalId;

    if (!resource.id) {
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
    }

    try {
      logAuditEvent({
        principalId,
        action: toolName,
        resourceType,
        resourceId: id,
        outcome: "success", // Assuming success
        details: { resourceType, id, resource }, // Be cautious about logging entire resource
      });

      const response = await fhirClient.put(`/${resourceType}/${id}`, resource);
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
      throw new Error(
        `Failed to update FHIR resource ${resourceType}/${id}: ${error.message}`
      );
    }
  },
};

export const fhirResourceDeleteTool = {
  name: "fhirResourceDelete",
  description: "Delete FHIR resources.",
  inputSchema: {
    resourceType: z
      .string()
      .describe(
        "The FHIR resource type, ex: Patient, Organization, Practitioner"
      ),
    id: z.string().describe("The resource ID"),
  },
  handler: async (
    { resourceType, id }: { resourceType: string; id: string },
    extra: any
  ) => {
    const toolName = "fhirResourceDelete";
    const principalId = defaultPrincipalId;

    try {
      logAuditEvent({
        principalId,
        action: toolName,
        resourceType,
        resourceId: id,
        outcome: "success", // Assuming success
        details: { resourceType, id },
      });

      const response = await fhirClient.delete(`/${resourceType}/${id}`);
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
      throw new Error(
        `Failed to delete FHIR resource ${resourceType}/${id}: ${error.message}`
      );
    }
  },
};

export const fhirResourceTools = [
  fhirResourceReadTool,
  fhirResourceSearchTool,
  fhirResourceCreateTool,
  fhirResourceUpdateTool,
  fhirResourceDeleteTool,
];
