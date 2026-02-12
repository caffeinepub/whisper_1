/**
 * Task intent completion action helpers.
 * Defines lightweight action helpers that the Secretary runtime can execute
 * after slot filling for task intents (create_task, find_tasks, update_task).
 */

import type { SlotBag } from './types';
import type { backendInterface, TaskStatus } from '@/backend';

/**
 * Execute create_task intent completion
 */
export async function executeCreateTask(
  slots: SlotBag,
  actor: backendInterface | null
): Promise<string> {
  if (!actor) {
    return 'I need to be connected to create a task. Please try again.';
  }

  const { task_title, task_description, task_category, task_location_id } = slots;

  if (!task_title || !task_description || !task_location_id) {
    return 'I\'m missing some required information to create the task.';
  }

  try {
    const taskId = await actor.createTask(
      task_title,
      task_description,
      task_category || 'General',
      task_location_id,
      null
    );
    return `Task created successfully! Task ID: ${taskId}. You can view it in the Tasks section.`;
  } catch (error: any) {
    console.error('Error creating task:', error);
    return `I encountered an error creating the task: ${error.message || 'Unknown error'}`;
  }
}

/**
 * Execute find_tasks intent completion
 */
export async function executeFindTasks(
  slots: SlotBag,
  actor: backendInterface | null
): Promise<string> {
  if (!actor) {
    return 'I need to be connected to find tasks. Please try again.';
  }

  const { task_location_id } = slots;

  if (!task_location_id) {
    return 'I need a location to find tasks.';
  }

  try {
    const tasks = await actor.listTasksByLocation(task_location_id);
    
    if (tasks.length === 0) {
      return `No tasks found for location ${task_location_id}.`;
    }

    // Show first 5 tasks with titles and statuses
    const taskSummaries = tasks.slice(0, 5).map((task, i) => {
      const statusLabel = task.status.toString().replace('_', ' ');
      return `${i + 1}. ${task.title} (${statusLabel})`;
    });

    const summary = taskSummaries.join('\n');
    const moreText = tasks.length > 5 ? `\n\n...and ${tasks.length - 5} more tasks.` : '';
    
    return `Here are the tasks for location ${task_location_id}:\n\n${summary}${moreText}\n\nYou can view all tasks in the Tasks section.`;
  } catch (error: any) {
    console.error('Error finding tasks:', error);
    return `I encountered an error finding tasks: ${error.message || 'Unknown error'}`;
  }
}

/**
 * Execute update_task intent completion
 */
export async function executeUpdateTask(
  slots: SlotBag,
  actor: backendInterface | null
): Promise<string> {
  if (!actor) {
    return 'I need to be connected to update a task. Please try again.';
  }

  const { task_id, task_location_id, task_status } = slots;

  if (!task_id || !task_location_id || !task_status) {
    return 'I\'m missing some required information to update the task.';
  }

  try {
    // First, fetch the task to get current details
    const task = await actor.getTask(BigInt(task_id), task_location_id);
    
    // Update the task with new status
    await actor.updateTask(
      BigInt(task_id),
      task.title,
      task.description,
      task.category,
      task_location_id,
      task_status
    );

    const statusLabel = task_status.toString().replace('_', ' ');
    return `Task ${task_id} updated successfully! Status is now: ${statusLabel}.`;
  } catch (error: any) {
    console.error('Error updating task:', error);
    return `I encountered an error updating the task: ${error.message || 'Unknown error'}`;
  }
}
