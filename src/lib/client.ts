import FHIR from "fhirclient"; // Added fhirclient import
import axios from "axios";
import FhirClient from "fhirclient/lib/FhirClient";

import { fhirclient } from "fhirclient/lib/types"; // Import types

// Exporting for testing purposes
export interface SmartFhirClientEnvOptions {
  SMART_CLIENT_ID?: string;
  SMART_SCOPE?: string;
  SMART_ISS?: string;
  SMART_REDIRECT_URI?: string;
  SMART_LAUNCH_TOKEN?: string;
  FHIR_BASE_URL?: string; // Fallback for ISS
  [key: string]: string | undefined; // Allow other env vars
}

export interface SmartFhirClientOptions {
  clientId?: string;
  scope?: string;
  iss?: string;
  redirectUri?: string;
  launch?: string | boolean;
  env?: SmartFhirClientEnvOptions; // Process env object
  // For manually passing code and state if needed by ready()
  code?: string; // Authorization code from callback
  state?: string; // State from callback
  expectedState?: string; // State originally generated and stored by caller
  pkceCodeVerifier?: string; // PKCE code verifier stored by caller
  // Any other options fhirclient.authorize or fhirclient.ready might need
  [key: string]: any;
}

// Helper function to generate a random string for PKCE code_verifier and state
// Exported for testing
export function generateRandomString(bytesLength = 32): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(bytesLength));
  // Convert byte array to Base64 URL encoded string
  // btoa is not available in workers directly, need a different approach for base64
  let result = "";
  for (const byte of randomBytes) {
    result += String.fromCharCode(byte);
  }
  return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Helper function to generate PKCE code_challenge from code_verifier
// Exported for testing
export async function generatePkceChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  // Convert ArrayBuffer to Base64 URL encoded string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = String.fromCharCode.apply(null, hashArray);
  return btoa(hashString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Reads config from the env object
const getSmartConfigFromEnv = (): Omit<
  SmartFhirClientOptions,
  "env" | "expectedState" | "pkceCodeVerifier"
> => {
  const config: Omit<
    SmartFhirClientOptions,
    "env" | "expectedState" | "pkceCodeVerifier"
  > = {};
  if (process.env.SMART_CLIENT_ID)
    config.clientId = process.env.SMART_CLIENT_ID;
  if (process.env.SMART_SCOPE) config.scope = process.env.SMART_SCOPE;
  if (process.env.SMART_ISS) {
    if (!process.env.SMART_ISS.startsWith("https://")) {
      console.warn(
        "SMART_ISS from environment variables is not HTTPS. Production environments require HTTPS."
      );
      // Depending on strictness, you might throw an error here in production.
    }
    config.iss = process.env.SMART_ISS;
  }
  if (process.env.SMART_REDIRECT_URI) {
    if (!process.env.SMART_REDIRECT_URI.startsWith("https://")) {
      console.warn(
        "SMART_REDIRECT_URI from environment variables is not HTTPS. Production environments require HTTPS."
      );
      // Depending on strictness, you might throw an error here in production.
    }
    config.redirectUri = process.env.SMART_REDIRECT_URI;
  }
  if (process.env.SMART_LAUNCH_TOKEN)
    config.launch = process.env.SMART_LAUNCH_TOKEN;

  if (!config.iss && process.env.FHIR_BASE_URL) {
    if (!process.env.FHIR_BASE_URL.startsWith("https://")) {
      console.warn(
        "FHIR_BASE_URL (used as ISS fallback) from environment variables is not HTTPS. Production environments require HTTPS."
      );
      // Depending on strictness, you might throw an error here in production.
    }
    config.iss = process.env.FHIR_BASE_URL;
  }
  return config;
};

export const createSmartFhirClient = async (
  options: SmartFhirClientOptions
): Promise<Axios.AxiosInstance> => {
  // The caller is responsible for securely managing pkceCodeVerifier and expectedState
  // e.g. retrieving them from an HttpOnly, Secure cookie or secure server-side session.
  if (!options.pkceCodeVerifier) {
    throw new Error(
      "PKCE code_verifier must be provided in options for FHIR.oauth2.ready(). This should have been stored securely by the calling application."
    );
  }
  if (!options.expectedState) {
    throw new Error(
      "Expected state must be provided in options for FHIR.oauth2.ready(). This should have been stored securely by the calling application."
    );
  }

  const envConfig = getSmartConfigFromEnv();
  const mergedConfig: SmartFhirClientOptions = {
    ...envConfig,
    ...options,
    pkceCode: options.pkceCodeVerifier, // fhirclient uses 'pkceCode' for the verifier
  };

  if (!mergedConfig.clientId) throw new Error("SMART Client ID is required.");
  if (!mergedConfig.scope) throw new Error("SMART Scope is required.");
  if (!mergedConfig.iss) {
    throw new Error("SMART ISS (FHIR Server URL) is required.");
  } else if (!mergedConfig.iss.startsWith("https://")) {
    // Stricter check for ISS at point of use
    throw new Error("SMART ISS (FHIR Server URL) must be HTTPS.");
  }

  const requestUrl = new URL(options.request.url);
  mergedConfig.code = requestUrl.searchParams.get("code") || undefined;
  const receivedState = requestUrl.searchParams.get("state") || undefined;

  if (receivedState !== mergedConfig.expectedState) {
    throw new Error(
      `Invalid state parameter received. Expected ${mergedConfig.expectedState} but got ${receivedState}. CSRF attack suspected.`
    );
  }
  mergedConfig.state = receivedState; // Pass received state to ready() for some validation checks it might do

  // Ensure redirectUri in config matches the current request's base URL for ready()
  // This is critical for PKCE validation and token exchange by fhirclient.
  // It ensures the redirect_uri used for token exchange matches the one the code was delivered to.
  // The original redirect_uri used in authorizeSmartClient must be pre-registered.
  const currentRedirectUri = `${requestUrl.origin}${requestUrl.pathname}`;
  if (!currentRedirectUri.startsWith("https://")) {
    // Stricter check for redirect URI at point of use for the callback
    throw new Error("Redirect URI for token exchange must be HTTPS.");
  }
  mergedConfig.redirectUri = currentRedirectUri;

  if (!mergedConfig.code) {
    throw new Error(
      "Authorization code not found in request URL. Cannot proceed with FHIR.oauth2.ready()."
    );
  }

  // FIXME - this type is not fount
  let smartClient: any;
  try {
    // `fhirclient` will use `mergedConfig.iss` to fetch server metadata.
    // It needs `mergedConfig.code`, `mergedConfig.state`, `mergedConfig.redirectUri`,
    // `mergedConfig.clientId`, and `mergedConfig.pkceCode` (the verifier) for token exchange.
    smartClient = await FHIR.oauth2.ready(mergedConfig);
  } catch (error: any) {
    let errorMessage = "Unknown error during FHIR.oauth2.ready()";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    const errorDetails = error?.response?.data
      ? { data: error.response.data }
      : error?.message
        ? {}
        : { rawError: error };

    console.error(
      "FHIR.oauth2.ready() failed:",
      errorMessage,
      errorDetails,
      error?.stack || "(no stack trace)"
    );
    throw new Error(
      `SMART on FHIR authentication failed during ready(): ${errorMessage}`
    );
  }

  const baseUrl = smartClient.state.serverUrl;
  if (!baseUrl) {
    throw new Error(
      "Could not determine FHIR server URL from SMART client state after ready()."
    );
  }

  const accessToken = smartClient.state.tokenResponse?.access_token;
  if (!accessToken) {
    console.warn(
      "No access token available from SMART client state despite successful ready(). Review token response for details.",
      smartClient.state.tokenResponse ?? "(no tokenResponse in state)"
    );
    throw new Error(
      "Failed to obtain access token from SMART client after ready()."
    );
  }

  // Create an axios instance for FHIR requests
  const fhirClient = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // The calling application is responsible for securely handling this access token.
  // For browser-based interactions (even if proxied via a worker),
  // if the token needs to be persisted, an HttpOnly, Secure, SameSite cookie is recommended.
  // If only used for immediate server-to-server calls from the worker, it might not need client-side persistence.
  return fhirClient;
};

export const authorizeSmartClient = async (
  options: SmartFhirClientOptions
): Promise<{
  authorizeUrl: string;
  codeVerifier: string;
  stateValue: string;
}> => {
  const envConfig = getSmartConfigFromEnv(); // options.env is for explicit env passing, otherwise process.env is used by getSmartConfigFromEnv
  const mergedConfig = { ...envConfig, ...options };

  const { clientId, scope, iss, redirectUri, launch } = mergedConfig;

  if (!clientId) throw new Error("SMART Client ID is required for authorize.");
  if (!scope) throw new Error("SMART Scope is required for authorize.");
  if (!iss) {
    throw new Error("SMART ISS (FHIR Server URL) is required for authorize.");
  } else if (!iss.startsWith("https://")) {
    throw new Error("SMART ISS (FHIR Server URL) must be HTTPS for authorize.");
  }
  if (!redirectUri) {
    throw new Error("SMART Redirect URI is required for authorize.");
  } else if (!redirectUri.startsWith("https://")) {
    throw new Error("SMART Redirect URI must be HTTPS for authorize.");
  }

  // The caller is responsible for securely storing codeVerifier and stateValue,
  // typically in an HttpOnly, Secure, SameSite cookie or equivalent secure server-side session storage.
  const codeVerifier = generateRandomString(32);
  const codeChallenge = await generatePkceChallenge(codeVerifier);
  const stateValue = generateRandomString(16);

  let authorizationEndpoint: string;
  try {
    // Use fhirclient utility to get SMART configuration, which includes the authorization_endpoint
    const smartConfig = await FHIR.oauth2.utils.getWellKnownSMARTConfig(iss); // iss already validated for HTTPS
    if (!smartConfig.authorization_endpoint) {
      throw new Error(
        "Authorization endpoint not found in SMART configuration."
      );
    }
    authorizationEndpoint = smartConfig.authorization_endpoint;
    if (!authorizationEndpoint.startsWith("https://")) {
      console.error(
        `Authorization endpoint ${authorizationEndpoint} from ${iss} is not HTTPS. This is a security risk.`
      );
      throw new Error("Discovered authorization endpoint must be HTTPS.");
    }
  } catch (error: any) {
    let errorMessage = `Failed to fetch or validate SMART configuration from ${iss}`;
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    } else if (typeof error === "string") {
      errorMessage = `${errorMessage}: ${error}`;
    }
    console.error(errorMessage, error?.stack || "(no stack trace)");
    throw new Error(errorMessage);
  }

  const authUrl = new URL(authorizationEndpoint);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", stateValue);
  authUrl.searchParams.set("aud", iss); // Audience is typically the ISS
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  if (launch) {
    // If launch is a boolean true, it's often an indicator for EHR launch,
    // but for standalone, it's usually an opaque string.
    // The spec is a bit flexible here. If it's just 'true', it might not be added to the URL.
    // If it's a string, it's added.
    if (typeof launch === "string" && launch !== "true") {
      // "true" as string might be from env var
      authUrl.searchParams.set("launch", launch);
    }
  }

  return {
    authorizeUrl: authUrl.toString(),
    codeVerifier,
    stateValue,
  };
};
