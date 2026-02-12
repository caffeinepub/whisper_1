/**
 * Centralized Secretary navigation utilities with option metadata,
 * keyword matching, and deep-link parsing/creation for consistent routing.
 */

export interface SecretaryOption {
  id: string;
  label: string;
  keywords: string[];
  confirmationMessage?: string;
}

/**
 * All available Secretary navigation options with their metadata.
 */
export const secretaryOptions: SecretaryOption[] = [
  {
    id: 'create-instance',
    label: 'Create Instance',
    keywords: ['create', 'instance', 'proposal', 'new', 'start', 'begin', 'setup'],
    confirmationMessage: "I'll help you create a new instance.",
  },
  {
    id: 'your-city-discovery',
    label: 'Your City on Whisper?',
    keywords: ['city', 'town', 'my city', 'find', 'discover', 'is my city', 'location', 'where', 'place'],
    confirmationMessage: "Let me help you find your city on Whisper.",
  },
  {
    id: 'proposals',
    label: 'View Proposals',
    keywords: ['proposals', 'view', 'list', 'browse', 'see', 'show', 'instances'],
    confirmationMessage: "I'll show you all proposals.",
  },
  {
    id: 'report-issue',
    label: 'Report an Issue',
    keywords: ['report', 'issue', 'problem', 'bug', 'complaint', 'concern'],
    confirmationMessage: "I'll help you report an issue.",
  },
  {
    id: 'complaint',
    label: 'File a Complaint',
    keywords: ['complaint', 'file', 'formal', 'grievance'],
    confirmationMessage: "I'll help you file a complaint.",
  },
  {
    id: 'foia',
    label: 'FOIA Request',
    keywords: ['foia', 'freedom', 'information', 'records', 'request', 'public records'],
    confirmationMessage: "I'll help you with a FOIA request.",
  },
  {
    id: 'support',
    label: 'Get Support',
    keywords: ['support', 'help', 'contact', 'assistance', 'question'],
    confirmationMessage: "I'll connect you with support.",
  },
  {
    id: 'governance',
    label: 'Governance',
    keywords: ['governance', 'vote', 'voting', 'govern', 'policy', 'policies'],
    confirmationMessage: "I'll take you to governance proposals.",
  },
];

/**
 * Finds a Secretary option by matching keywords in user input.
 * Returns the first match found, or null if no match.
 */
export function findOptionByKeyword(input: string): SecretaryOption | null {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const option of secretaryOptions) {
    for (const keyword of option.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        return option;
      }
    }
  }
  
  return null;
}

/**
 * Deep link format: #secretary:destination-id or #secretary:destination-id:identifier
 */
export function createDeepLink(destinationId: string, identifier?: string): string {
  if (identifier) {
    return `#secretary:${destinationId}:${identifier}`;
  }
  return `#secretary:${destinationId}`;
}

/**
 * Parses a deep link hash and returns the destination info with optional identifier.
 */
export function parseDeepLink(hash: string): { type: 'section'; id: string; identifier?: string } | null {
  if (!hash || !hash.startsWith('#secretary:')) {
    return null;
  }
  
  const parts = hash.slice('#secretary:'.length).split(':');
  const id = parts[0];
  const identifier = parts[1];
  
  return { type: 'section', id, identifier };
}
