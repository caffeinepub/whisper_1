import { useState } from 'react';

interface IssueDraft {
  description: string;
  photo: File | null;
}

interface SubmissionResult {
  success: boolean;
  message?: string;
}

/**
 * Frontend-only helper hook for Issue Creation submission.
 * Persists drafts to localStorage and provides explicit success/error feedback.
 * Backend issue creation is not yet implemented.
 */
export function useIssueDraftSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitDraft = async (draft: IssueDraft): Promise<SubmissionResult> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Persist draft to localStorage
      const timestamp = Date.now();
      const draftKey = `issue-draft-${timestamp}`;
      
      const draftData = {
        description: draft.description,
        hasPhoto: !!draft.photo,
        photoName: draft.photo?.name,
        timestamp,
      };

      localStorage.setItem(draftKey, JSON.stringify(draftData));

      // Get all drafts and keep only the last 10
      const allKeys = Object.keys(localStorage).filter((key) => key.startsWith('issue-draft-'));
      if (allKeys.length > 10) {
        const sortedKeys = allKeys.sort();
        const keysToRemove = sortedKeys.slice(0, allKeys.length - 10);
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }

      setSuccess(true);
      setIsSubmitting(false);

      return {
        success: true,
        message: 'Issue draft saved successfully. Full issue creation coming soon!',
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save issue draft. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  return {
    submitDraft,
    isSubmitting,
    error,
    success,
  };
}
