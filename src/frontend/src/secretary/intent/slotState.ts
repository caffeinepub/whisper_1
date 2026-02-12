/**
 * Pure slot-state utilities for independent reset/repair and future reuse.
 * Provides getSlot, setSlot, clearSlot, clearDependentSlots, isSlotFilled.
 * Extended with task-related slot support.
 */

import type { SlotBag, SecretarySlot } from './types';
import type { USState, USCounty, USPlace } from '@/backend';

/**
 * Get a slot value from the slot bag
 */
export function getSlot<K extends SecretarySlot>(
  slots: SlotBag,
  slotName: K
): SlotBag[K] {
  return slots[slotName];
}

/**
 * Set a slot value in the slot bag
 */
export function setSlot<K extends SecretarySlot>(
  slots: SlotBag,
  slotName: K,
  value: SlotBag[K]
): void {
  slots[slotName] = value;
}

/**
 * Clear a single slot
 */
export function clearSlot(slots: SlotBag, slotName: SecretarySlot): void {
  switch (slotName) {
    case 'state':
      slots.state = null;
      break;
    case 'county':
      slots.county = null;
      break;
    case 'place':
      slots.place = null;
      break;
    case 'issue_description':
      slots.issue_description = '';
      break;
    case 'issue_category':
      slots.issue_category = '';
      break;
    case 'task_title':
      slots.task_title = '';
      break;
    case 'task_description':
      slots.task_description = '';
      break;
    case 'task_category':
      slots.task_category = '';
      break;
    case 'task_location_id':
      slots.task_location_id = '';
      break;
    case 'task_id':
      slots.task_id = '';
      break;
    case 'task_status':
      slots.task_status = null;
      break;
  }
}

/**
 * Clear dependent slots when a higher-level slot changes
 * (e.g., changing state clears county and place)
 */
export function clearDependentSlots(slots: SlotBag, changedSlot: SecretarySlot): void {
  switch (changedSlot) {
    case 'state':
      // Changing state clears county and place
      slots.county = null;
      slots.place = null;
      break;
    case 'county':
      // Changing county clears place
      slots.place = null;
      break;
    case 'task_location_id':
      // Changing location clears task-specific identifiers
      slots.task_id = '';
      break;
    // Other slots don't have dependents
  }
}

/**
 * Check if a slot is filled
 */
export function isSlotFilled(slots: SlotBag, slotName: SecretarySlot): boolean {
  const value = slots[slotName];
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  return value !== null;
}

/**
 * Create an empty slot bag
 */
export function createEmptySlotBag(): SlotBag {
  return {
    state: null,
    county: null,
    place: null,
    issue_description: '',
    issue_category: '',
    task_title: '',
    task_description: '',
    task_category: '',
    task_location_id: '',
    task_id: '',
    task_status: null,
  };
}
