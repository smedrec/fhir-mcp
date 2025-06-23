export const fhirServerBaseUrl = process.env.FHIR_SERVER_BASE_URL || 'http://hapi.fhir.org/baseR4'; // Default to a public test server

if (!process.env.FHIR_SERVER_BASE_URL) {
  console.warn(`FHIR_SERVER_BASE_URL environment variable not set. Using default: ${fhirServerBaseUrl}`);
}
