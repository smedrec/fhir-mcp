import jwt from "jsonwebtoken";
import base64url from "base64-url";
import crypto from "crypto";

// The (last known) access token is stored in this global variable. When it

import { getEnvConfig } from "../mcp/environment.js";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

/**
 * Authorizes the app and resolves the promise with the access token response
 * @returns {Promise<Object>}
 */
export async function authorize(): Promise<TokenResponse> {
  const config = getEnvConfig();

  const jwtToken = {
    iss: config.smartIss,
    sub: config.smartClientId,
    aud: config.smartTokenUri,
    exp: Date.now() / 1000 + 300, // 5 min
    jti: crypto.randomBytes(32).toString("hex"),
  };

  // Prepare the request data
  const data = {
    scope: config.smartScope,
    grant_type: "client_credentials",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: jwt.sign(
      jwtToken,
      base64url.decode(config.smartPrivateKey),
      { algorithm: "ES384" }
    ),
  };

  // Use axios directly and set headers in the request
  const res = await axios.post<TokenResponse>(
    config.smartTokenUri,
    data,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return res.data;
}
