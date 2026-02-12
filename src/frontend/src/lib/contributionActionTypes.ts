/**
 * Canonical contribution action type constants for issue-flow actions.
 * These must match the backend's ContributionActionType enum values.
 */
export const CONTRIBUTION_ACTION_TYPES = {
  ISSUE_CREATED: 'IssueCreated',
  COMMENT_CREATED: 'CommentCreated',
  EVIDENCE_ADDED: 'EvidenceAdded',
} as const;

export type ContributionActionType = typeof CONTRIBUTION_ACTION_TYPES[keyof typeof CONTRIBUTION_ACTION_TYPES];
