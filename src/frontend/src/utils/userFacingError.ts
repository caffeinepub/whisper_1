/**
 * Converts backend errors and exceptions into user-friendly English messages.
 * Extended to cover Secretary issues/geography lookup failures.
 */
export function userFacingError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : String(error);

  const lowerMessage = errorMessage.toLowerCase();

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }

  // Admin-specific errors
  if (lowerMessage.includes('only admins can')) {
    return 'This action requires administrator privileges.';
  }

  // Moderation-specific errors
  if (lowerMessage.includes('approve') || lowerMessage.includes('reject')) {
    return 'Failed to update proposal status. Please try again.';
  }

  if (lowerMessage.includes('hide')) {
    return 'Failed to hide proposal. Please try again.';
  }

  if (lowerMessage.includes('delete')) {
    return 'Failed to delete proposal. Please try again.';
  }

  // Proposal errors
  if (lowerMessage.includes('instance name already exists')) {
    return 'This instance name is already taken. Please choose a different name.';
  }

  if (lowerMessage.includes('proposal does not exist')) {
    return 'The requested proposal could not be found.';
  }

  // Geography lookup errors
  if (lowerMessage.includes('no counties found') || lowerMessage.includes('no places found')) {
    return 'No locations found for your selection. Please try a different area.';
  }

  if (lowerMessage.includes('state not found') || lowerMessage.includes('county not found') || lowerMessage.includes('city not found')) {
    return 'The requested location could not be found. Please try again.';
  }

  // Secretary top issues errors
  if (lowerMessage.includes('top issues') || lowerMessage.includes('common issues')) {
    return 'Unable to retrieve common issues at this time. Please try again later.';
  }

  // Task errors
  if (lowerMessage.includes('task') && lowerMessage.includes('not found')) {
    return 'The requested task could not be found.';
  }

  if (lowerMessage.includes('no tasks found')) {
    return 'No tasks found for this proposal.';
  }

  // Profile errors
  if (lowerMessage.includes('profile')) {
    return 'Failed to save profile. Please try again.';
  }

  // Network/actor errors
  if (lowerMessage.includes('actor not available') || lowerMessage.includes('not ready')) {
    return 'The system is not ready yet. Please wait a moment and try again.';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic validation
  if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
    return 'Invalid input. Please check your information and try again.';
  }

  // Default fallback
  return 'An error occurred. Please try again.';
}
