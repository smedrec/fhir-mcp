/**
 * Error Codes Module
 * 
 * This module defines error codes used throughout the application.
 * These codes are compatible with the MCP SDK error handling system.
 */

// Numeric error codes for McpError
export enum ErrorCode {
  InitializationError = 1000,
  AuthenticationError = 1001,
  NotFoundError = 1002,
  InvalidRequest = 1003,
  InternalError = 1004,
  NotImplemented = 1005,
}