#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { IMcpTool } from "./tools/IMcpTool.js";
import * as tools from "./tools/index.js";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { getEnvConfig } from "./environment.js";
import axios from "axios";

const SERVER_INFO: Implementation = {
  name: "FHIR RESOURCES MCP",
  version: "0.1.0",
};

export const fhirMcpServer = new McpServer(SERVER_INFO);

// Add cookie parser middleware
fhirMcpServer.app?.use(cookieParser());

// Load environment configuration
const envConfig = getEnvConfig();

// SMART on FHIR authorize endpoint
fhirMcpServer.app?.get("/authorize", async (req, res) => {
    const launchIss = req.cookies.launch_iss || envConfig.smartIss;
    const launchToken = req.cookies.launch_token;

    // Clear launch cookies
    res.clearCookie("launch_iss");
    res.clearCookie("launch_token");

  // Generate code_verifier and code_challenge
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Generate state
  const state = crypto.randomBytes(16).toString("hex");

  // Store code_verifier and state in HttpOnly, Secure cookies
  res.cookie("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600000, // 10 minutes
  });
  res.cookie("state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600000, // 10 minutes
  });

  // Construct authorization URL
  // A real implementation would fetch the .well-known/smart-configuration
  // from `launchIss` to discover the `authorization_endpoint`.
  // For this example, we'll construct it assuming it's {iss}/authorize.
  const authEndpoint = new URL(launchIss);
  authEndpoint.pathname = (authEndpoint.pathname.endsWith('/') ? authEndpoint.pathname : authEndpoint.pathname + '/') + 'authorize';

  authEndpoint.searchParams.set("response_type", "code");
  authEndpoint.searchParams.set("client_id", envConfig.smartClientId);
  authEndpoint.searchParams.set("redirect_uri", envConfig.smartRedirectUri);
  authEndpoint.searchParams.set("scope", envConfig.smartScope);
  authEndpoint.searchParams.set("state", state);
  authEndpoint.searchParams.set("code_challenge", codeChallenge);
  authEndpoint.searchParams.set("code_challenge_method", "S256");
  if (launchToken) {
    authEndpoint.searchParams.set("launch", launchToken);
  }

  // Redirect to authorization URL
  res.redirect(authEndpoint.toString());
});

// SMART on FHIR callback endpoint
fhirMcpServer.app?.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  const storedCodeVerifier = req.cookies.code_verifier;
  const storedState = req.cookies.state;

  if (state !== storedState) {
    return res.status(400).send("Invalid state parameter");
  }

  // Clear cookies
  res.clearCookie("code_verifier");
  res.clearCookie("state");

  try {
    // Exchange authorization code for access token
  // A real implementation would fetch the .well-known/smart-configuration
  // from the ISS used during /authorize (which could be envConfig.smartIss or launchIss)
  // to discover the `token_endpoint`.
  // For this example, we'll assume it's {iss}/token.
  // We need to know which ISS was used for the /authorize redirect.
  // Since we don't explicitly pass it to /callback, we'll use envConfig.smartIss
  // or rely on the FHIR server to handle it if it was a launch flow.
  // A more robust way is to store the ISS used in /authorize in a cookie and retrieve here.
  const tokenIss = envConfig.smartIss; // Or retrieve from a cookie if launchIss was different and needs to be used
  const tokenEndpoint = new URL(tokenIss);
  tokenEndpoint.pathname = (tokenEndpoint.pathname.endsWith('/') ? tokenEndpoint.pathname : tokenEndpoint.pathname + '/') + 'token';

    const tokenResponse = await axios.post(
      tokenEndpoint.toString(),
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: envConfig.smartRedirectUri,
        client_id: envConfig.smartClientId,
        code_verifier: storedCodeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Store access token in HttpOnly, Secure cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: tokenResponse.data.expires_in * 1000, // Convert seconds to milliseconds
    });

    // Redirect to a success page or the application's home page
    res.redirect("/");
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send("Error obtaining access token");
  }
});

// SMART on FHIR init endpoint
fhirMcpServer.app?.get("/init", async (req, res) => {
  const { iss, launch } = req.query;

  if (!iss) {
    return res.status(400).send("Missing iss parameter");
  }

  // Store iss and launch in session/cookie if needed for /authorize
  // For now, we'll pass them as query params to /authorize,
  // but a more robust solution might use server-side session storage.
  res.cookie("launch_iss", iss as string, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600000 });
  if (launch) {
    res.cookie("launch_token", launch as string, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600000 });
  }

  // Redirect to the /authorize endpoint
  // The /authorize endpoint will then use these values
  res.redirect("/authorize");
});

// SMART on FHIR ready endpoint
fhirMcpServer.app?.get("/ready", async (req, res) => {
  // Check for a valid access token (or other session indicator)
  if (req.cookies.access_token) {
    res.sendStatus(200); // OK
  } else {
    // If no access token, perhaps redirect to /authorize or send an error
    // Depending on the desired behavior if /ready is hit without a session
    res.status(401).send("Unauthorized: No active session.");
  }
});

for (const tool of Object.values<IMcpTool>(tools)) {
  tool.registerTool(fhirMcpServer);
}
