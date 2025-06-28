// Adjust SDK imports - Assuming types might be directly under sdk or specific submodules
// If these are still wrong, we might need the exact SDK structure/version.
import {
    AuthInfo,
} from "@modelcontextprotocol/sdk/server/auth/types.js";

import {
    OAuthClientInformationFull,
    OAuthClientMetadata,
    OAuthTokenRevocationRequest,
    OAuthTokens
} from "@modelcontextprotocol/sdk/shared/auth.js";

import {
    OAuthServerProvider,
} from '@modelcontextprotocol/sdk/server/auth/provider.js';

// --- Constants ---
const AuthGrantType = { // Define if not imported
    AuthorizationCode: 'authorization_code',
    // Add other grant types if needed
};
const PKCE_METHOD_S256 = 'S256';

// --- Internal State Management ---

// Temporary store for MCP authorization requests before user picks DB/connects EHR
export interface AuthzRequestState {
    authzRequestId: string;
    mcpClientId: string;
    mcpRedirectUri: string;
    mcpCodeChallenge?: string;
    mcpCodeChallengeMethod?: string;
    mcpState?: string;
    mcpScope?: string;
    createdAt: number;
}
const authzRequests = new Map<string, AuthzRequestState>(); // Renamed from pickerSessions
const AUTHZ_REQUEST_EXPIRY_MS = 5 * 60 * 1000; // Renamed from PICKER_SESSION_EXPIRY_MS

// --- OAuth Provider Implementation ---

// Remove explicit implementation, rely on structural typing via the getter
class MyOAuthClientStore /* implements OAuthClientStore */ {
    async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
        let client = registeredMcpClients.get(clientId);
        if (client) { console.log(`[AUTH Client Store] Found client: ${clientId}`); }
        else { console.warn(`[AUTH Client Store] Client not found: ${clientId}`); }
        return client;
    }

    async addClient(clientInfo: OAuthClientInformationFull): Promise<void> {
        if (!clientInfo.client_id || !clientInfo.client_name || !clientInfo.redirect_uris || clientInfo.redirect_uris.length === 0) {
            throw new InvalidRequestError("Client info missing required fields (client_id, client_name, redirect_uris)");
        }
        if (registeredMcpClients.has(clientInfo.client_id)) {
            console.warn(`[AUTH Client Store] Attempted to register duplicate client ID: ${clientInfo.client_id}`);
            throw new InvalidRequestError(`Client ID ${clientInfo.client_id} is already registered.`);
        }
        if (!clientInfo.grant_types || clientInfo.grant_types.length === 0) {
            clientInfo.grant_types = [AuthGrantType.AuthorizationCode];
        }
        console.log(`[AUTH Client Store] Registering client: ${clientInfo.client_id} (${clientInfo.client_name})`);
        registeredMcpClients.set(clientInfo.client_id, clientInfo);
    }

    async removeClient(clientId: string): Promise<void> {
        if (registeredMcpClients.has(clientId)) {
            console.log(`[AUTH Client Store] Removing client: ${clientId}`);
            registeredMcpClients.delete(clientId);
        } else {
             console.warn(`[AUTH Client Store] Attempted to remove non-existent client: ${clientId}`);
        }
    }
}