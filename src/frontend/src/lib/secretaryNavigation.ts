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

export function matchKeywordToOption(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  const keywordMap: Record<string, number> = {
    'report': 1,
    'issue': 1,
    'problem': 1,
    'pothole': 1,
    'complaint': 2,
    'police': 2,
    'misconduct': 2,
    'foia': 3,
    'information': 3,
    'request': 3,
    'campaign': 4,
    'petition': 4,
    'join': 4,
    'browse': 5,
    'issues': 5,
    'proposals': 5,
    'local': 5,
    'area': 5,
    'support': 6,
    'help': 6,
    'question': 6,
  };
  
  for (const [keyword, optionNumber] of Object.entries(keywordMap)) {
    if (lowerText.includes(keyword)) {
      return optionNumber;
    }
  }
  
  return null;
}
