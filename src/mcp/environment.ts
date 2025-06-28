/**
 * Environment Configuration
 * 
 * This module handles loading and validating environment variables
 * required for connecting to the FHIR API.
 */

import dotenv from 'dotenv';
import findConfig from 'find-config';
import path from 'path';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { ErrorCode } from './errors/error-codes.js';

// Environment variable names
export const ENV_VARS = {
  SMART_PRIVATE_KEY: 'SMART_PRIVATE_KEY',
  SMART_CLIENT_ID: 'SMART_CLIENT_ID',
  SMART_SCOPE: 'SMART_SCOPE',
  SMART_ISS: 'SMART_ISS',
  SMART_TOKEN_URI: 'SMART_TOKEN_URI',
  FHIR_BASE_URL: 'FHIR_BASE_URL', // Fallback for ISS
  DEBUG: 'DEBUG',
};

// Interface for validated environment variables
export interface EnvConfig {
  smartPrivateKey: string;
  smartClientId: string;
  smartScope: string;
  smartIss: string;
  smartTokenUri: string;
  fhirBaseUrl?: string; // Made optional
  debug: boolean;
}

/**
 * Load environment variables from .env file if present
 */
export function loadEnvironmentVariables(): void {
  const {
    SMART_PRIVATE_KEY,
    SMART_CLIENT_ID,
    SMART_SCOPE,
    SMART_ISS,
    SMART_TOKEN_URI,
  } = process.env;

  if (
    !SMART_PRIVATE_KEY &&
    !SMART_CLIENT_ID &&
    !SMART_SCOPE &&
    !SMART_ISS &&
    !SMART_TOKEN_URI
  ) {
    const projectRoot = findConfig('package.json');
    if (projectRoot) {
      const envPath = path.resolve(path.dirname(projectRoot), '.env');
      dotenv.config({ path: envPath });
    }
  }
}

/**
 * Validate and retrieve required environment variables
 * 
 * @returns Validated environment configuration
 * @throws {McpError} If required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const smartPrivateKey = process.env[ENV_VARS.SMART_PRIVATE_KEY];
  const smartClientId = process.env[ENV_VARS.SMART_CLIENT_ID];
  const smartScope = process.env[ENV_VARS.SMART_SCOPE];
  const smartIss = process.env[ENV_VARS.SMART_ISS];
  const smartTokenUri = process.env[ENV_VARS.SMART_TOKEN_URI];
  const fhirBaseUrl = process.env[ENV_VARS.FHIR_BASE_URL];
  const debug = process.env[ENV_VARS.DEBUG]?.toLowerCase() === 'true';

  // Validate required core environment variables
  if (!smartPrivateKey) {
    throw new McpError(
      ErrorCode.InitializationError,
      `${ENV_VARS.SMART_PRIVATE_KEY} environment variable not set. ${ENV_VARS.SMART_PRIVATE_KEY} is required.`
    );
  }

  // Validate required core environment variables
  if (!smartClientId) {
    throw new McpError(
      ErrorCode.InitializationError,
      `${ENV_VARS.SMART_CLIENT_ID} environment variable not set. ${ENV_VARS.SMART_CLIENT_ID} is required.`
    );
  }

  if (!smartScope) {
    throw new McpError(
      ErrorCode.InitializationError,
      `${ENV_VARS.SMART_SCOPE} environment variable not set. ${ENV_VARS.SMART_SCOPE} is required.`
    );
  }

  if (!smartIss) {
    throw new McpError(
      ErrorCode.InitializationError,
      `${ENV_VARS.SMART_ISS} environment variable not set. ${ENV_VARS.SMART_ISS} is required.`
    );
  }

  if (!smartTokenUri) {
    throw new McpError(
      ErrorCode.InitializationError,
      `${ENV_VARS.SMART_TOKEN_URI} environment variable not set. ${ENV_VARS.SMART_TOKEN_URI} is required.`
    );
  }

  // FHIR_BASE_URL optional at startup.
  // Tools requiring them should perform checks at the point of use.

  // Validate URL format
  try {
    new URL(smartIss);
  } catch (error) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid URL format for ${ENV_VARS.SMART_ISS}: ${smartIss}`
    );
  }

  try {
    new URL(smartTokenUri);
  } catch (error) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid URL format for ${ENV_VARS.SMART_TOKEN_URI}: ${smartTokenUri}`
    );
  }

  return {
    smartPrivateKey,
    smartClientId,
    smartScope,
    smartIss,
    smartTokenUri,
    fhirBaseUrl: fhirBaseUrl || undefined, // Ensure undefined if empty
    debug,
  };
}