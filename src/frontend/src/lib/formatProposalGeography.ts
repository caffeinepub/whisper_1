import type { Proposal } from '@/backend';
import { USHierarchyLevel } from '@/backend';

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

/**
 * Formats population2020 as a human-readable population value.
 * Returns null if population is not available or is 'empty'.
 */
export function formatPopulation(population2020: string): string | null {
  if (!population2020 || population2020 === 'empty') {
    return null;
  }
  
  // Parse the population number
  const num = parseInt(population2020, 10);
  if (isNaN(num)) {
    return null;
  }
  
  // Format with commas
  return num.toLocaleString();
}

/**
 * Returns discrete labeled geography parts for display.
 * Only returns parts that are truly available in the proposal.
 */
export function getGeographyParts(proposal: Proposal): Array<{ label: string; value: string }> {
  const parts: Array<{ label: string; value: string }> = [];
  
  // Add state if available and not empty
  if (proposal.state && proposal.state !== 'empty') {
    parts.push({ label: 'State', value: proposal.state });
  }
  
  // Add county if available and not empty
  if (proposal.county && proposal.county !== 'empty') {
    parts.push({ label: 'County', value: proposal.county });
  }
  
  // For place level, we don't have a separate place field in the backend
  // The instanceName is used as the place name for place-level proposals
  // But we should not label it as "Place" since it's already the title
  
  return parts;
}

/**
 * Returns structured geography data for display in cards and dialogs.
 */
export function formatProposalGeography(proposal: Proposal): {
  levelLabel: string;
  state: string;
  county: string;
  population: string;
} {
  const levelLabel = getGeographyLevelLabel(proposal.geographyLevel);
  const state = proposal.state && proposal.state !== 'empty' ? proposal.state : 'N/A';
  const county = proposal.county && proposal.county !== 'empty' ? proposal.county : 'N/A';
  const population = formatPopulation(proposal.population2020) || 'N/A';

  return {
    levelLabel,
    state,
    county,
    population,
  };
}

/**
 * Formats proposal geography metadata into a readable English string.
 * Returns a concise description of the geographic scope and location.
 */
export function formatProposalGeographyString(proposal: Proposal): string {
  const parts: string[] = [];

  // Add scope-specific formatting
  switch (proposal.geographyLevel) {
    case USHierarchyLevel.place:
      if (proposal.county && proposal.county !== 'empty') {
        parts.push(`County: ${proposal.county}`);
      }
      if (proposal.state && proposal.state !== 'empty') {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.county:
      if (proposal.county && proposal.county !== 'empty') {
        parts.push(`County: ${proposal.county}`);
      }
      if (proposal.state && proposal.state !== 'empty') {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.state:
      if (proposal.state && proposal.state !== 'empty') {
        parts.push(`State: ${proposal.state}`);
      }
      break;

    case USHierarchyLevel.country:
      parts.push('National');
      break;

    default:
      // Fallback for unknown levels
      if (proposal.state && proposal.state !== 'empty') {
        parts.push(`State: ${proposal.state}`);
      }
      if (proposal.county && proposal.county !== 'empty') {
        parts.push(`County: ${proposal.county}`);
      }
  }

  // Add population if available
  const population = formatPopulation(proposal.population2020);
  if (population) {
    parts.push(`Pop: ${population}`);
  }

  return parts.length > 0 ? parts.join(' • ') : 'Geography not specified';
}
