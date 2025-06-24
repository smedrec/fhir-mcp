import { getJSONFromURL } from './get-json-from-url';

const FHIR_METADATA = `${process.env.FHIR_BASE_URL}/metadata`;
export async function getResourceByType(type: string) {
  const capability = await getJSONFromURL(FHIR_METADATA);
  const rest = capability.rest || [];
  for (const restEntry of rest) {
    if (restEntry.resource) {
      const found = restEntry.resource.find((r: { type: string; }) => r.type === type);
      if (found) return found;
    }
  }
  return null;
}
