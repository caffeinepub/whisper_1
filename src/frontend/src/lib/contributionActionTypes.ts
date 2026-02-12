/**
 * Canonical contribution action type constants for issue-flow actions.
 * These must match the backend's ContributionActionType enum values.
 * Exported as a normalized list for UI filter options.
 */
export const CONTRIBUTION_ACTION_TYPES = {
  ISSUE_CREATED: 'IssueCreated',
  COMMENT_CREATED: 'CommentCreated',
  EVIDENCE_ADDED: 'EvidenceAdded',
} as const;

export type ContributionActionType = typeof CONTRIBUTION_ACTION_TYPES[keyof typeof CONTRIBUTION_ACTION_TYPES];

/**
 * Array of all known action types for use in UI filters and dropdowns.
 */
export const ALL_ACTION_TYPES = Object.values(CONTRIBUTION_ACTION_TYPES);
