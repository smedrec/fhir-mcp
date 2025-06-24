import { sign } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { decode } from "base64-url";
import { config } from "../config.js";

// The (last known) access token is stored in this global variable. When it
// expires the code should re-authenticate and update it.
let ACCESS_TOKEN: string | null;

/**
 * Authorizes the app and resolves the promise with the access token response
 * @returns {Promise<Object>}
 */
export async function authorize() {
  console.log(ACCESS_TOKEN === null ? "Re-authorizing..." : "Authorizing...");

  const jwtToken = {
    iss: config.service_url,
    sub: config.client_id,
    aud: config.token_url,
    exp: Date.now() / 1000 + 300, // 5 min
    jti: randomBytes(32).toString("hex"),
  };

  const smartAuth = axios.create({
    baseURL: config.token_url,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  try {
    const res = await smartAuth.post(``, {
      scope: "system/*.*",
      grant_type: "client_credentials",
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: sign(jwtToken, decode(config.private_key), {
        algorithm: "RS256",
      }),
    });
    const data = res.data as { access_token: string };
    ACCESS_TOKEN = data.access_token;
    return ACCESS_TOKEN;
  } catch (error: any) {
    throw new Error(`Failed to authorize FHIR resource ${error.message}`);
  }

  /**const res = await requestPromise({
    method: "POST",
    url: token_url,
    json: true,
    form: {
      scope: "system/*.*",
      grant_type: "client_credentials",
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: sign(
        jwtToken,
        decode(private_key),
        { algorithm: 'RS256' }
      )
    }
  });**/
}
