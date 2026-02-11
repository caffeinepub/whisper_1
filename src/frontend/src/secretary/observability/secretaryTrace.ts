/**
 * Lightweight, frontend-only trace utility for recording internal events.
 * Provides in-memory ring buffer for debugging without external services.
 */

export interface TraceEvent {
  timestamp: number;
  type: 'intent-recognized' | 'slot-filled' | 'slot-repaired' | 'intent-completed' | 'flow-action';
  data: Record<string, any>;
}

const MAX_EVENTS = 100;
const events: TraceEvent[] = [];
let traceEnabled = false;

/**
 * Enable or disable tracing (dev flag)
 */
export function setTraceEnabled(enabled: boolean): void {
  traceEnabled = enabled;
  if (enabled) {
    console.log('[SecretaryTrace] Tracing enabled');
  }
}

/**
 * Check if tracing is enabled
 */
export function isTraceEnabled(): boolean {
  return traceEnabled;
}

/**
 * Record a trace event
 */
export function trace(type: TraceEvent['type'], data: Record<string, any>): void {
  const event: TraceEvent = {
    timestamp: Date.now(),
    type,
    data,
  };
  
  events.push(event);
  
  // Keep only last MAX_EVENTS
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  
  // Console output if enabled
  if (traceEnabled) {
    console.log(`[SecretaryTrace] ${type}:`, data);
  }
}

/**
 * Get all recorded events
 */
export function getTraceEvents(): TraceEvent[] {
  return [...events];
}

/**
 * Clear all recorded events
 */
export function clearTraceEvents(): void {
  events.length = 0;
}

/**
 * Get events of a specific type
 */
export function getTraceEventsByType(type: TraceEvent['type']): TraceEvent[] {
  return events.filter(e => e.type === type);
}

/**
 * Get recent events (last N)
 */
export function getRecentTraceEvents(count: number): TraceEvent[] {
  return events.slice(-count);
}
