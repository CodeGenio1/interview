/**
 * Base class for any API Errors
 */
export class ApiError extends Error {
  /**
   * HTTP Status code
   */
  statusCode: number;

  /**
   * Error code, by default the message before translation (e.g. USER_NOT_FOUND)
   */
  code: string;

  /**
   * HTTP Challenge
   */
  challenge?: string;

  /**
   * API Error returned to client
   * @param message Error message (use code to be translated, e.g. USER_NOT_FOUND)
   * @param statusCode HTTP Status Code (e.g. 404, 403)
   * @param code Optional code for untranslated errors (e.g. message could be "API rate limit exceeded for X", code "API_RATE_LIMIT_EXCEEDED")
   */
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);

    this.name = 'ApiError';

    // Error content
    this.statusCode = statusCode;
    this.code = code || message;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
