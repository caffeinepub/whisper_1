/**
 * Normalizes errors into user-facing English messages.
 * Handles authorization, geography, proposal, task, contribution, WSP token operation, staking, complaint category, and post errors.
 */
export function getUserFacingError(error: any): string {
  if (!error) return 'An unexpected error occurred';

  // Handle string errors directly
  if (typeof error === 'string') {
    // Authorization errors
    if (error.includes('Unauthorized')) {
      if (error.includes('Only admins')) return 'Admin access required';
      if (error.includes('Only users')) return 'You must be logged in';
      return 'You do not have permission to perform this action';
    }

    // Geography errors
    if (error.includes('No counties found')) return 'No counties available for the selected state';
    if (error.includes('No places found')) return 'No cities available for the selected area';

    // Proposal errors
    if (error.includes('Instance name already exists')) return 'This instance name is already taken';
    if (error.includes('Proposal must contain valid')) {
      if (error.includes('state')) return 'Please select a valid state';
      if (error.includes('county')) return 'Please select a valid county';
      if (error.includes('census boundary')) return 'Census boundary information is missing';
      if (error.includes('population')) return 'Population data is required';
      if (error.includes('squareMeters')) return 'Area information is required';
    }

    // Task errors
    if (error.includes('Proposal does not exist')) return 'The proposal could not be found';
    if (error.includes('No tasks found')) return 'No tasks found for this proposal';
    if (error.includes('Task does not exist')) return 'The task could not be found';
    if (error.includes('Task not associated with provided locationId')) {
      return 'Task does not belong to this location';
    }
    if (error.includes('Task title cannot be empty')) return 'Task title is required';
    if (error.includes('Task description cannot be empty')) return 'Task description is required';
    if (error.includes('Task category cannot be empty')) return 'Task category is required';

    // Contribution event errors
    if (error.includes('invalid actionType') || error.includes('invalidActionType')) {
      return 'Invalid contribution action type';
    }
    if (error.includes('reference not found') || error.includes('referenceIdRequired')) {
      return 'Reference ID is required for this action';
    }
    if (error.includes('referenceIdEmpty')) {
      return 'Reference ID cannot be empty';
    }
    if (error.includes('duplicateContribution')) {
      return 'This contribution has already been recorded';
    }

    // WSP token operation errors
    if (error.includes('Invalid principal')) return 'Invalid principal format';
    if (error.includes('Invalid amount')) return 'Amount must be a positive number';
    if (error.includes('Insufficient balance')) return 'Insufficient token balance';
    if (error.includes('Only admins can mint')) return 'Only admins can mint tokens';
    if (error.includes('Only admins can burn')) return 'Only admins can burn tokens';

    // Staking errors
    if (error.includes('not yet implemented') || error.includes('not implemented')) {
      return 'Staking functionality is coming soon';
    }
    if (error.includes('Insufficient staked balance')) return 'Insufficient staked balance';
    if (error.includes('Cannot unstake locked')) return 'Cannot unstake locked tokens';
    if (error.includes('Staking period not complete')) return 'Staking period has not completed yet';

    // Complaint category errors
    if (error.includes('complaint categories') || error.includes('complaint category')) {
      return 'Unable to load complaint categories. Please try again.';
    }

    // Post errors
    if (error.includes('Post content cannot be empty')) return 'Post content cannot be empty';
    if (error.includes('Instance name cannot be empty')) return 'Instance name cannot be empty';
    if (error.includes('Post not found')) return 'Post not found';
    if (error.includes('Cannot update deleted post')) return 'Cannot update deleted post';
    if (error.includes('Post already deleted')) return 'Post already deleted';
    if (error.includes('Only post author or admin')) return 'Only the post author or an admin can perform this action';

    // Return the original error if no pattern matches
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return getUserFacingError(error.message);
  }

  // Handle objects with message property
  if (error.message) {
    return getUserFacingError(error.message);
  }

  return 'An unexpected error occurred';
}
