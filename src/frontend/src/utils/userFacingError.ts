/**
 * Normalizes unknown thrown values into safe user-facing English messages
 * while preserving the original error for console logging.
 */
export function getUserFacingError(error: unknown): { userMessage: string; originalError: unknown } {
  // Log the original error for debugging
  console.error('Error occurred:', error);

  let userMessage = 'An unexpected error occurred. Please try again.';

  if (error instanceof Error) {
    // Map known error patterns to user-friendly messages
    if (error.message.includes('name already exists') || error.message.includes('already taken')) {
      userMessage = 'This name is already taken. Please choose a different name.';
    } else if (error.message.includes('availability') || error.message.includes('verify')) {
      userMessage = 'Could not check availability. Please try again.';
    } else if (error.message.includes('Backend connection') || error.message.includes('not available')) {
      userMessage = 'Connection error. Please check your network and try again.';
    } else if (error.message.includes('Unauthorized')) {
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.message.includes('submit') || error.message.includes('Submission')) {
      userMessage = 'Submission failed. Please try again.';
    } else if (error.message.includes('Only admins can')) {
      userMessage = 'Admin access required. You do not have permission to perform this action.';
    } else if (error.message.includes('approve') || error.message.includes('reject')) {
      userMessage = 'Failed to update proposal status. Please try again.';
    } else if (error.message.includes('hide')) {
      userMessage = 'Failed to hide item. Please try again.';
    } else if (error.message.includes('delete')) {
      userMessage = 'Failed to delete item. Please try again.';
    }
  } else if (typeof error === 'string') {
    // Handle string errors
    if (error.includes('name already exists') || error.includes('already taken')) {
      userMessage = 'This name is already taken. Please choose a different name.';
    } else if (error.includes('Unauthorized') || error.includes('Only admins')) {
      userMessage = 'You do not have permission to perform this action.';
    }
  }

  return { userMessage, originalError: error };
}
