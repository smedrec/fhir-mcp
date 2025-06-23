export const fhirServerBaseUrl = process.env.FHIR_SERVER_BASE_URL || 'http://joseantcordeiro.hopto.org:8080/fhir'; // Default to a public test server

if (!process.env.FHIR_SERVER_BASE_URL) {
  console.warn(`FHIR_SERVER_BASE_URL environment variable not set. Using default: ${fhirServerBaseUrl}`);
}
