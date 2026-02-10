export type NavigationIntent = {
  type: 'url' | 'section' | 'action';
  target: string;
  params?: Record<string, string>;
};

export function parseDeepLink(url: string): NavigationIntent | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    const hash = urlObj.hash.slice(1);
    const searchParams = new URLSearchParams(urlObj.search);
    
    if (hash) {
      return {
        type: 'section',
        target: hash,
      };
    }
    
    const action = searchParams.get('action');
    if (action) {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== 'action') {
          params[key] = value;
        }
      });
      
      return {
        type: 'action',
        target: action,
        params,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export function createDeepLink(intent: NavigationIntent): string {
  const url = new URL(window.location.origin);
  
  if (intent.type === 'section') {
    url.hash = intent.target;
  } else if (intent.type === 'action') {
    url.searchParams.set('action', intent.target);
    if (intent.params) {
      Object.entries(intent.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
  }
  
  return url.toString();
}

// Centralized Secretary option routing metadata
export type SecretaryOption = {
  number: number;
  label: string;
  description: string;
  keywords: string[];
  destinationId: string;
  confirmationMessage: string;
};

export const SECRETARY_OPTIONS: SecretaryOption[] = [
  {
    number: 1,
    label: 'Report an issue',
    description: 'Potholes, streetlights, etc.',
    keywords: ['report', 'issue', 'problem', 'pothole'],
    destinationId: 'create-instance',
    confirmationMessage: 'I\'ll help you report an issue. Taking you to the Create Instance form...',
  },
  {
    number: 2,
    label: 'File a complaint',
    description: 'Police misconduct, etc.',
    keywords: ['complaint', 'police', 'misconduct', 'file'],
    destinationId: 'complaint',
    confirmationMessage: 'I\'ll help you file a complaint. Taking you to the complaint form...',
  },
  {
    number: 3,
    label: 'Submit a FOIA request',
    description: 'Request public information',
    keywords: ['foia', 'information', 'request', 'freedom', 'public'],
    destinationId: 'foia',
    confirmationMessage: 'I\'ll help you submit a FOIA request. Taking you to the request form...',
  },
  {
    number: 4,
    label: 'Join a campaign',
    description: 'Support local initiatives',
    keywords: ['campaign', 'petition', 'join', 'support', 'initiative'],
    destinationId: 'create-instance',
    confirmationMessage: 'I\'ll help you join a campaign. Taking you to the Create Instance form...',
  },
  {
    number: 5,
    label: 'Browse local issues',
    description: 'See what others are working on',
    keywords: ['browse', 'issues', 'proposals', 'local', 'area', 'view'],
    destinationId: 'proposals',
    confirmationMessage: 'I\'ll show you local issues. Taking you to the proposals section...',
  },
  {
    number: 6,
    label: 'Get support',
    description: 'Help with the platform',
    keywords: ['support', 'help', 'question', 'assistance', 'how'],
    destinationId: 'support',
    confirmationMessage: 'I\'ll help you get support. Taking you to the support section...',
  },
];

export function matchKeywordToOption(text: string): SecretaryOption | null {
  const lowerText = text.toLowerCase();
  
  for (const option of SECRETARY_OPTIONS) {
    for (const keyword of option.keywords) {
      if (lowerText.includes(keyword)) {
        return option;
      }
    }
  }
  
  return null;
}

export function getOptionByNumber(optionNumber: number): SecretaryOption | null {
  return SECRETARY_OPTIONS.find(opt => opt.number === optionNumber) || null;
}
