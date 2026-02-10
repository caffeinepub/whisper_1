// Event-based navigation signaling for Secretary-to-project flow

export interface SecretaryProjectNavigationPayload {
  proposalName: string;
  category?: string;
}

export const SECRETARY_PROJECT_NAVIGATION_EVENT = 'secretary:navigate-to-project';

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
