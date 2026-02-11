/**
 * Converts backend errors and exceptions into user-friendly English messages.
 * Extended with patterns for geography lookup failures, Secretary top-issues errors,
 * and contribution log authorization/fetch failures.
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

  // Geography lookup errors
  if (errorMessage.includes('No counties found') || errorMessage.includes('No places found')) {
    return 'No geographic data found for this location';
  }

  if (errorMessage.includes('No states found')) {
    return 'Geographic data is not yet available';
  }

  // Secretary top-issues errors
  if (errorMessage.includes('top issues') || errorMessage.includes('location issues')) {
    return 'Unable to load top issues for this location';
  }

  // Proposal errors
  if (errorMessage.includes('Instance name already exists')) {
    return 'This instance name is already taken';
  }

  if (errorMessage.includes('Proposal does not exist')) {
    return 'This proposal could not be found';
  }

  // Task errors
  if (errorMessage.includes('No tasks found')) {
    return 'No tasks found for this proposal';
  }

  if (errorMessage.includes('Task does not exist')) {
    return 'This task could not be found';
  }

  // Profile errors
  if (errorMessage.includes('profile')) {
    return 'Unable to load or save profile. Please try again.';
  }

  // Network/Actor errors
  if (errorMessage.includes('Actor not available') || errorMessage.includes('network')) {
    return 'Connection issue. Please check your network and try again.';
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
}
