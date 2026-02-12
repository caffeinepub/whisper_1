/**
 * Task slot parsing helpers.
 * Small, deterministic parsing helpers for filling task slots from free text.
 */

import type { TaskStatus } from '@/backend';
import type { SlotBag } from './types';

/**
 * Extract a numeric task ID from text
 */
export function parseTaskId(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // Look for patterns like "task 123", "task #123", "id 123", "#123"
  const patterns = [
    /task\s*#?(\d+)/i,
    /id\s*#?(\d+)/i,
    /#(\d+)/,
    /^(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Parse task status from text
 */
export function parseTaskStatus(text: string): TaskStatus | null {
  const normalized = text.toLowerCase().trim();
  
  if (normalized.includes('open') || normalized.includes('new')) {
    return 'open' as TaskStatus;
  }
  if (normalized.includes('in progress') || normalized.includes('in_progress') || normalized.includes('working')) {
    return 'in_progress' as TaskStatus;
  }
  if (normalized.includes('blocked') || normalized.includes('stuck')) {
    return 'blocked' as TaskStatus;
  }
  if (normalized.includes('resolved') || normalized.includes('done') || normalized.includes('completed') || normalized.includes('closed')) {
    return 'resolved' as TaskStatus;
  }
  
  return null;
}

/**
 * Derive location ID from geography slots
 */
export function deriveLocationId(state: any, county: any, place: any): string | null {
  if (place?.hierarchicalId) return place.hierarchicalId;
  if (county?.hierarchicalId) return county.hierarchicalId;
  if (state?.hierarchicalId) return state.hierarchicalId;
  return null;
}

/**
 * Parse location identifier from text (hierarchical ID pattern)
 */
export function parseLocationId(text: string): string | null {
  // Look for hierarchical ID patterns like "US-CA", "US-CA-037", etc.
  const pattern = /US-[A-Z]{2}(-\d{3})?(-\d{5})?/i;
  const match = text.match(pattern);
  return match ? match[0] : null;
}

/**
 * Parse task title from text
 * Improved to extract likely title from natural language
 */
export function parseTaskTitleFromText(text: string, slots: SlotBag): string | null {
  const normalized = text.trim();
  
  // If this is the first message and it's not a command, use it as title
  if (!slots.task_location_id && normalized.length > 0 && normalized.length < 150) {
    // Remove common command words
    const withoutCommands = normalized
      .replace(/^(create|make|add|new)\s+(a\s+)?task\s+(about|for|to)?\s*/i, '')
      .trim();
    
    if (withoutCommands.length > 0 && withoutCommands.length < 150) {
      return withoutCommands;
    }
  }
  
  // If we're being asked for title specifically, use the response
  if (normalized.length > 0 && normalized.length < 150) {
    return normalized;
  }
  
  return null;
}

/**
 * Parse task description from text
 * Improved to extract likely description from natural language
 */
export function parseTaskDescriptionFromText(text: string, slots: SlotBag): string | null {
  const normalized = text.trim();
  
  // If title is already filled and this is a longer text, use as description
  if (slots.task_title && normalized.length > 10) {
    return normalized;
  }
  
  // If this looks like a description (longer text, multiple sentences)
  if (normalized.length > 20) {
    return normalized;
  }
  
  return null;
}

/**
 * Parse task category from text
 * Improved to extract likely category from natural language
 */
export function parseTaskCategoryFromText(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // Common category keywords
  const categoryMap: Record<string, string> = {
    'maintenance': 'Maintenance',
    'repair': 'Repair',
    'safety': 'Safety',
    'infrastructure': 'Infrastructure',
    'community': 'Community',
    'environment': 'Environment',
    'transportation': 'Transportation',
    'utilities': 'Utilities',
    'parks': 'Parks',
    'roads': 'Roads',
    'water': 'Water',
    'sewer': 'Sewer',
    'lighting': 'Lighting',
    'traffic': 'Traffic',
    'zoning': 'Zoning',
    'permits': 'Permits',
    'health': 'Health',
    'emergency': 'Emergency',
  };
  
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }
  
  // If it's a short single word/phrase, use it as category
  if (normalized.length > 0 && normalized.length < 30 && !normalized.includes(' ')) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  return null;
}
