/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, next) {
  // Default status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Prisma known request errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const field = err.meta?.target?.[0] || 'field';
        statusCode = 409;
        message = `A record with that ${field} already exists.`;
        break;
      }
      case 'P2025': {
        // Record not found
        statusCode = 404;
        message = 'Record not found.';
        break;
      }
      case 'P2003': {
        // Foreign key constraint failed
        statusCode = 400;
        message = 'Related record not found.';
        break;
      }
      case 'P2014': {
        // Required relation violation
        statusCode = 400;
        message = 'Required relation violation.';
        break;
      }
      default:
        // Don't expose raw DB errors in production
        if (process.env.NODE_ENV === 'production') {
          message = 'A database error occurred.';
        }
        break;
    }
  }

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  const response = {
    success: false,
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} - ${err.message}`, err.stack || '');

  res.status(statusCode).json(response);
}
