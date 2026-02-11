/**
 * Converts backend errors and exceptions into user-friendly English messages.
 * Extended with patterns for geography lookup failures, Secretary top-issues errors,
 * contribution log authorization/fetch failures, and user-scoped log queries.
 */
export function userFacingError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Authorization errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only admins')) {
    return 'You do not have permission to perform this action';
  }

  // Contribution log errors
  if (errorMessage.includes('contribution logs') || errorMessage.includes('contribution history')) {
    return 'Unable to load contribution logs. Please try again.';
  }

  // User principal errors
  if (errorMessage.includes('User principal is required') || errorMessage.includes('Invalid principal')) {
    return 'Please enter a valid user principal ID';
  }

  // Geography lookup errors
  if (errorMessage.includes('No counties found') || errorMessage.includes('No places found')) {
    return 'No geographic data found for this location';
  }

  if (errorMessage.includes('No states found')) {
    return 'Geographic data is not yet available';
  }

  // Secretary top-issues errors
  if (errorMessage.includes('top issues') || errorMessage.includes('location issues')) {
    return 'Unable to load location issues. Please try again.';
  }

  // Proposal errors
  if (errorMessage.includes('Proposal does not exist')) {
    return 'This proposal could not be found';
  }

  if (errorMessage.includes('Instance name already exists')) {
    return 'This instance name is already taken';
  }

  // Task errors
  if (errorMessage.includes('Task does not exist')) {
    return 'This task could not be found';
  }

  if (errorMessage.includes('No tasks found')) {
    return 'No tasks available for this proposal';
  }

  // Actor/connection errors
  if (errorMessage.includes('Actor not available')) {
    return 'Connection to backend is not available. Please refresh and try again.';
  }

  // Generic fallback
  return errorMessage || 'An unexpected error occurred';
}
