import { logAuditEvent } from "../../lib/audit"

import z from "zod"

const defaultPrincipalId = 'anonymous'
const defaultRoles = ['anonymous']

export const fhirResourceReadTool = {
  name: 'fhirResourceRead',
  description: 'Reads a FHIR resource by ID.',
  inputSchema: z.object({
    resourceType: z.string().describe('The FHIR resource type, ex: Patient, Organization, Practitioner'),
    id: z.string().describe('The resource ID')
  }),
  async handler(params: { resourceType: string, id: string }) {
    const toolName = 'fhirResourceRead'
    const resourceType = params.resourceType
    const resourceId = params.id

    return

  },
}

export const fhirResourceSearchTool = {
  name: 'fhirResourceSearch',
  description: 'Search FHIR resources by fhir standard parameters.',
  inputSchema: z.object({
    resourceType: z.string().describe('The FHIR resource type, ex: Patient, Organization, Practitioner'),
    searchParams: z.array(
      z.object({
        param: z.string().describe('The search param ...'),
        value: z.string().describe('The value ...')
      })
    )
  }),
  async handler(params: { resourceType: string, searchParams: Record<string, string> }) {
    const toolName = 'fhirResourceRead'
    const resourceType = params.resourceType

    return

  },
}

export const fhirResourceCreateTool = {
  name: 'fhirResourceCreate',
  description: 'Create FHIR resources.',
  inputSchema: z.object({
    resourceType: z.string().describe('The FHIR resource type, ex: Patient, Organization, Practitioner'),
    resource: z.unknown()
  }),
  async handler(params: { resourceType: string, resource: any }) {
    const toolName = 'fhirResourceCreate'
    const resourceType = params.resourceType

    return

  },
}

export const fhirResourceUpdateTool = {
  name: 'fhirResourceUpdate',
  description: 'Update FHIR resources.',
  inputSchema: z.object({
    resourceType: z.string().describe('The FHIR resource type, ex: Patient, Organization, Practitioner'),
    resource: z.unknown()
  }),
  async handler(params: { resourceType: string, resource: any }) {
    const toolName = 'fhirResourceUpdate'
    const resourceType = params.resourceType

    return

  },
}

export const fhirResourceDeleteTool = {
  name: 'fhirResourceDelete',
  description: 'Delete FHIR resources.',
  inputSchema: z.object({
    resourceType: z.string().describe('The FHIR resource type, ex: Patient, Organization, Practitioner'),
    id: z.string().describe('The resource ID')
  }),
  async handler(params: { resourceType: string, id: string }) {
    const toolName = 'fhirResourceDelete'
    const resourceType = params.resourceType

    return

  },
}

export const fhirResourceTools = [
  fhirResourceReadTool,
  fhirResourceSearchTool,
  fhirResourceCreateTool,
  fhirResourceUpdateTool,
  fhirResourceDeleteTool
]