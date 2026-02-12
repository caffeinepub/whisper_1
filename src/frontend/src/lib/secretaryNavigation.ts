export interface SecretaryNavigationOption {
  id: string;
  label: string;
  keywords: string[];
}

export const secretaryNavigationOptions: SecretaryNavigationOption[] = [
  {
    id: 'proposals',
    label: 'Proposals',
    keywords: ['proposals', 'view proposals', 'see proposals', 'instances', 'projects'],
  },
  {
    id: 'create-instance',
    label: 'Create Instance',
    keywords: ['create', 'new instance', 'start instance', 'propose', 'new proposal'],
  },
  {
    id: 'report-issue',
    label: 'Report Issue',
    keywords: ['report', 'issue', 'problem', 'complaint', 'concern'],
  },
  {
    id: 'staking',
    label: 'Staking',
    keywords: ['staking', 'stake', 'unstake', 'rewards', 'lock', 'locked', 'tokens'],
  },
  {
    id: 'governance',
    label: 'Governance',
    keywords: ['governance', 'vote', 'voting', 'govern', 'policy', 'policies'],
  },
  {
    id: 'feed',
    label: 'Feed',
    keywords: ['feed', 'posts', 'latest posts', 'community feed', 'social'],
  },
];

export function findNavigationOptionByKeyword(text: string): SecretaryNavigationOption | null {
  const lowerText = text.toLowerCase();
  
  for (const option of secretaryNavigationOptions) {
    if (option.keywords.some(keyword => lowerText.includes(keyword))) {
      return option;
    }
  }
  
  return null;
}

export function parseDeepLink(text: string): { destinationId: string; identifier?: string } | null {
  const proposalMatch = text.match(/proposal[:\s]+([a-zA-Z0-9_-]+)/i);
  if (proposalMatch) {
    return {
      destinationId: 'proposals',
      identifier: proposalMatch[1],
    };
  }
  
  return null;
}

export function createDeepLink(destinationId: string, identifier?: string): string {
  if (identifier) {
    return `${destinationId}:${identifier}`;
  }
  return destinationId;
}
