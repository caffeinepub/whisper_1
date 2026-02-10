/**
 * Local storage helper for profile fields not yet supported by backend
 * These fields are stored client-side until backend support is added
 */

interface ProfileLocalState {
  bio: string;
  username: string;
  role: string;
  location: string;
  joinDate: string;
  externalLinks: string[];
  achievements: string[];
  recentActivity: string[];
  stats: {
    issuesReported: number;
    projectsParticipated: number;
    resolutionsHelped: number;
    wspEarned: number;
  };
}

const LOCAL_STORAGE_KEY = 'whisper_profile_local_state';

const defaultState: ProfileLocalState = {
  bio: '',
  username: '',
  role: '',
  location: '',
  joinDate: '',
  externalLinks: [],
  achievements: [],
  recentActivity: [],
  stats: {
    issuesReported: 0,
    projectsParticipated: 0,
    resolutionsHelped: 0,
    wspEarned: 0,
  },
};

export function getProfileLocalState(): ProfileLocalState {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load profile local state:', error);
  }
  return defaultState;
}

export function saveProfileLocalState(partial: Partial<ProfileLocalState>): void {
  try {
    const current = getProfileLocalState();
    const updated = { ...current, ...partial };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save profile local state:', error);
  }
}

export function clearProfileLocalState(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear profile local state:', error);
  }
}
