import type { Proposal } from '@/backend';
import { USHierarchyLevel } from '@/backend';

/**
 * Formats proposal geography metadata into a readable English string.
 * Returns a concise description of the geographic scope and location.
 */
export function formatProposalGeography(proposal: Proposal): string {
  const parts: string[] = [];

  // Add scope-specific formatting
  switch (proposal.geographyLevel) {
    case USHierarchyLevel.place:
      if (proposal.county) {
        parts.push(`Place: ${proposal.instanceName}`);
        parts.push(`County: ${proposal.county}`);
      }
      if (proposal.state) {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.county:
      if (proposal.county) {
        parts.push(`County: ${proposal.county}`);
      }
      if (proposal.state) {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.state:
      if (proposal.state) {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.country:
      parts.push('National');
      break;

    default:
      // Fallback for unknown levels
      if (proposal.state) {
        parts.push(`State: ${proposal.state}`);
      }
      if (proposal.county) {
        parts.push(`County: ${proposal.county}`);
      }
  }

  // Add population if available
  if (proposal.population2020 && proposal.population2020 !== 'empty') {
    parts.push(`Pop: ${proposal.population2020}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'Geography not specified';
}

/**
 * Returns a short label for the geography level.
 */
export function getGeographyLevelLabel(level: USHierarchyLevel): string {
  switch (level) {
    case USHierarchyLevel.place:
      return 'City/Town';
    case USHierarchyLevel.county:
      return 'County';
    case USHierarchyLevel.state:
      return 'State';
    case USHierarchyLevel.country:
      return 'National';
    default:
      return 'Unknown';
  }
}
