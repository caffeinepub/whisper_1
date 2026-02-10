import { USHierarchyLevel, type USState, type USCounty, type USPlace } from '@/backend';

export interface SecretaryMessageContext {
  state: USState | null;
  county: USCounty | null;
  place: USPlace | null;
  instanceExists: boolean;
  topIssues?: string[];
}

export interface SecretaryMessage {
  greeting: string;
  geographyLabel: string;
  instanceStatus: string;
  topIssuesPreview?: string;
  recommendedAction: 'view' | 'create';
  actionLabel: string;
}

/**
 * Composes a friendly Secretary message that combines geography data,
 * instance existence, and top issues into a cohesive assistant response.
 */
export function composeSecretaryMessage(context: SecretaryMessageContext): SecretaryMessage {
  const { state, county, place, instanceExists, topIssues = [] } = context;

  // Build geography label
  let geographyLabel = '';
  if (place && state) {
    geographyLabel = `${place.shortName}, ${state.shortName}`;
  } else if (county && state) {
    geographyLabel = `${county.shortName}, ${state.shortName}`;
  } else if (state) {
    geographyLabel = state.longName;
  } else {
    geographyLabel = 'your selected location';
  }

  // Build instance status message
  let instanceStatus = '';
  let recommendedAction: 'view' | 'create' = 'view';
  let actionLabel = '';

  if (instanceExists) {
    instanceStatus = `Great news! A Whisper instance already exists for ${geographyLabel}.`;
    recommendedAction = 'view';
    actionLabel = 'View Existing Instance';
  } else {
    // Founding member message
    if (place) {
      instanceStatus = `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating one!`;
    } else if (county) {
      instanceStatus = `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating one!`;
    } else {
      instanceStatus = `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating one!`;
    }
    recommendedAction = 'create';
    actionLabel = 'Create Instance';
  }

  // Build top issues preview
  let topIssuesPreview: string | undefined;
  if (topIssues.length > 0) {
    const issuesList = topIssues.slice(0, 3).join(', ');
    topIssuesPreview = `Common issues in this area include: ${issuesList}${topIssues.length > 3 ? ', and more' : ''}.`;
  }

  return {
    greeting: `I found information about ${geographyLabel}.`,
    geographyLabel,
    instanceStatus,
    topIssuesPreview,
    recommendedAction,
    actionLabel,
  };
}

/**
 * Returns a friendly founding-member message based on geography level.
 */
export function getFoundingMemberMessage(
  level: USHierarchyLevel,
  geographyLabel: string
): string {
  switch (level) {
    case USHierarchyLevel.place:
      return `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating the first instance for your city!`;
    case USHierarchyLevel.county:
      return `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating the first instance for your county!`;
    case USHierarchyLevel.state:
      return `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member by creating the first instance for your state!`;
    default:
      return `${geographyLabel} doesn't have a Whisper instance yet. You can be a founding member!`;
  }
}

/**
 * Returns a friendly instance-found message.
 */
export function getInstanceFoundMessage(geographyLabel: string): string {
  return `Great news! A Whisper instance already exists for ${geographyLabel}. You can view it and participate in ongoing discussions.`;
}
