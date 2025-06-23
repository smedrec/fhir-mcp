export const fhirServerBaseUrl = process.env.FHIR_BASE_URL || 'http://joseantcordeiro.hopto.org:8080/fhir'; // Default to a public test server
export const smartClientId = process.env.SMART_CLIENT_ID
export const smartScope = process.env.SMART_SCOPE
export const smartIss = process.env.SMART_ISS

if (!process.env.FHIR_SERVER_BASE_URL) {
  console.warn(`FHIR_SERVER_BASE_URL environment variable not set. Using default: ${fhirServerBaseUrl}`);
}

if (!process.env.SMART_CLIENT_ID) {
  console.error(`SMART_CLIENT_ID environment variable not set. SMART Client ID is required.`);
}

if (!process.env.SMART_SCOPE) {
  console.error(`SMART_SCOPE environment variable not set. SMART Scope is required.`);
}

if (!process.env.SMART_ISS) {
  console.error(`SMART_SCOPE environment variable not set. SMART ISS (FHIR Server URL) is required.`);
}

