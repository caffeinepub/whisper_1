/**
 * Utility function that normalizes errors into user-facing English messages.
 * Extended with moderation-specific error patterns and runtime error handling.
 */

interface ErrorResult {
  userMessage: string;
  originalError: any;
}

export function getUserFacingError(error: any): ErrorResult {
  const originalError = error;
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      userMessage: error,
      originalError,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Authorization errors
    if (message.includes('Unauthorized') || message.includes('Only admins')) {
      return {
        userMessage: 'You do not have permission to perform this action.',
        originalError,
      };
    }

    // Moderation-specific errors
    if (message.includes('approve') || message.includes('Approve')) {
      return {
        userMessage: 'Failed to approve. The item may have already been processed.',
        originalError,
      };
    }

    if (message.includes('reject') || message.includes('Reject')) {
      return {
        userMessage: 'Failed to reject. The item may have already been processed.',
        originalError,
      };
    }

    if (message.includes('hide') || message.includes('Hide')) {
      return {
        userMessage: 'Failed to hide. Please try again.',
        originalError,
      };
    }

    if (message.includes('delete') || message.includes('Delete')) {
      return {
        userMessage: 'Failed to delete. Please try again.',
        originalError,
      };
    }

    // Instance name errors
    if (message.includes('already exists') || message.includes('already taken')) {
      return {
        userMessage: 'This instance name is already taken. Please choose a different name.',
        originalError,
      };
    }

    // Geography validation errors
    if (message.includes('valid state') || message.includes('State is required')) {
      return {
        userMessage: 'Please select a valid state.',
        originalError,
      };
    }

    if (message.includes('valid county') || message.includes('County is required')) {
      return {
        userMessage: 'Please select a valid county.',
        originalError,
      };
    }

    // Draft editor / runtime errors
    if (message.includes('disallowed origin') || message.includes('SecurityError')) {
      return {
        userMessage: 'A security error occurred. Please refresh the page and try again.',
        originalError,
      };
    }

    // Network/connection errors
    if (message.includes('Actor not available') || message.includes('Backend connection')) {
      return {
        userMessage: 'Unable to connect to the backend. Please check your connection and try again.',
        originalError,
      };
    }

    // Generic backend errors
    if (message.includes('trap') || message.includes('Canister')) {
      return {
        userMessage: 'An unexpected error occurred. Please try again.',
        originalError,
      };
    }

    // Return the original message if it's already user-friendly
    return {
      userMessage: message,
      originalError,
    };
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return getUserFacingError(error.message);
  }

  // Fallback for unknown error types
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    originalError,
  };
}
