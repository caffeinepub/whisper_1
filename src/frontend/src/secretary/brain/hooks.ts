/**
 * Utilities for composing brain hooks/listeners.
 * Allows future upgrades to attach analytics/debug logging without changing the widget.
 */

import type { FlowEventListener, FlowEvent } from '../flow/types';

/**
 * Create a multi-cast event listener that forwards events to multiple listeners
 */
export function createMulticastListener(
  listeners: FlowEventListener[]
): FlowEventListener {
  return (event: FlowEvent) => {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in flow event listener:', error);
      }
    });
  };
}

/**
 * Create a no-op listener (useful as default)
 */
export function createNoOpListener(): FlowEventListener {
  return () => {
    // Do nothing
  };
}

/**
 * Create a console logging listener for debugging
 */
export function createConsoleLogger(): FlowEventListener {
  return (event: FlowEvent) => {
    console.log('[Secretary Flow Event]', event);
  };
}

/**
 * Create a listener that filters events by type
 */
export function createFilteredListener(
  types: FlowEvent['type'][],
  listener: FlowEventListener
): FlowEventListener {
  return (event: FlowEvent) => {
    if (types.includes(event.type)) {
      listener(event);
    }
  };
}

/**
 * Compose multiple listeners into one
 */
export function composeListeners(
  ...listeners: FlowEventListener[]
): FlowEventListener {
  return createMulticastListener(listeners);
}
