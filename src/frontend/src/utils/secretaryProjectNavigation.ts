// Event-based navigation signaling for Secretary-to-project flow

export interface SecretaryProjectNavigationPayload {
  proposalName: string;
  category?: string;
  origin?: 'standard' | 'chat';
}

export const SECRETARY_PROJECT_NAVIGATION_EVENT = 'secretary:navigate-to-project';

/**
 * Signal project navigation with optional origin flag to mark Secretary-triggered actions.
 * The origin flag is used downstream to show 'chat' toast variants when applicable.
 */
export function signalProjectNavigation(payload: SecretaryProjectNavigationPayload) {
  const event = new CustomEvent<SecretaryProjectNavigationPayload>(
    SECRETARY_PROJECT_NAVIGATION_EVENT,
    { detail: payload }
  );
  window.dispatchEvent(event);
}

export function listenForProjectNavigation(
  handler: (payload: SecretaryProjectNavigationPayload) => void
): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<SecretaryProjectNavigationPayload>;
    handler(customEvent.detail);
  };

  window.addEventListener(SECRETARY_PROJECT_NAVIGATION_EVENT, listener);

  // Return cleanup function
  return () => {
    window.removeEventListener(SECRETARY_PROJECT_NAVIGATION_EVENT, listener);
  };
}
