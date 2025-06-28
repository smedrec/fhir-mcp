/**
 * Error Handling Module
 * 
 * This module provides custom error classes and error handling utilities
 * for the n8n MCP Server.
 */

import { McpError as SdkMcpError } from '@modelcontextprotocol/sdk/types.js';
import { ErrorCode } from './error-codes.js';

// Re-export McpError from SDK
export { McpError } from '@modelcontextprotocol/sdk/types.js';
// Re-export ErrorCode enum
export { ErrorCode } from './error-codes.js';

/**
 * FHIR API Error class for handling errors from the FHIR API
 */
export class FHIRApiError extends SdkMcpError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    // Map HTTP status codes to appropriate MCP error codes
    let errorCode = ErrorCode.InternalError;
    
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        errorCode = ErrorCode.AuthenticationError;
      } else if (statusCode === 404) {
        errorCode = ErrorCode.NotFoundError;
      } else if (statusCode >= 400 && statusCode < 500) {
        errorCode = ErrorCode.InvalidRequest;
      }
    }
    
    super(errorCode, formatErrorMessage(message, statusCode, details));
  }
}

/**
 * Format an error message with status code and details
 */
function formatErrorMessage(message: string, statusCode?: number, details?: unknown): string {
  let formattedMessage = message;
  
  if (statusCode) {
    formattedMessage += ` (Status: ${statusCode})`;
  }
  
  if (details) {
    try {
      const detailsStr = typeof details === 'string' 
        ? details 
        : JSON.stringify(details, null, 2);
      formattedMessage += `\nDetails: ${detailsStr}`;
    } catch (error) {
      // Ignore JSON stringification errors
    }
  }
  
  return formattedMessage;
}

/**
 * Safely parse JSON response from n8n API
 * 
 * @param text Text to parse as JSON
 * @returns Parsed JSON object or null if parsing fails
 */
export function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

/**
 * Handle axios errors and convert them to N8nApiError
 * 
 * @param error Error object from axios
 * @param defaultMessage Default error message
 * @returns FHIRApiError with appropriate details
 */
export function handleAxiosError(error: any, defaultMessage = 'FHIR API request failed'): FHIRApiError {
  // Handle axios error responses
  if (error.response) {
    const statusCode = error.response.status;
    const responseData = error.response.data;
    
    let errorMessage = defaultMessage;
    if (responseData && responseData.message) {
      errorMessage = responseData.message;
    }
    
    return new FHIRApiError(errorMessage, statusCode, responseData);
  }
  
  // Handle request errors (e.g., network issues)
  if (error.request) {
    return new FHIRApiError(
      'Network error connecting to FHIR API', 
      undefined, 
      error.message
    );
  }
  
  // Handle other errors
  return new FHIRApiError(error.message || defaultMessage);
}

/**
 * Extract a readable error message from an error object
 * 
 * @param error Error object
 * @returns Readable error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}