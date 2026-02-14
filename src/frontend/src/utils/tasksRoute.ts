/**
 * Base-path-aware helper to parse Tasks routes from the current URL.
 * Extracts locationId, taskId, and detects create mode for use by TasksListPage/TaskDetailPage/TaskCreatePage.
 */

export interface TasksRouteParams {
  locationId?: string;
  taskId?: string;
  isCreateMode?: boolean;
}

/**
 * Parse the current URL to extract tasks route parameters.
 * Handles base path configuration from import.meta.env.BASE_URL.
 */
export function parseTasksRoute(): TasksRouteParams {
  const path = window.location.pathname;
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Normalize basePath for comparison (handle both '/base' and '/base/')
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const relativePath = path.startsWith(normalizedBase) 
    ? path.slice(normalizedBase.length) 
    : path;
  
  // Match /tasks/:locationId
  const tasksListMatch = relativePath.match(/^\/tasks\/([^/]+)$/);
  if (tasksListMatch) {
    return {
      locationId: tasksListMatch[1],
      isCreateMode: false,
    };
  }
  
  // Match /tasks/:locationId/new
  const tasksCreateMatch = relativePath.match(/^\/tasks\/([^/]+)\/new$/);
  if (tasksCreateMatch) {
    return {
      locationId: tasksCreateMatch[1],
      isCreateMode: true,
    };
  }
  
  // Match /tasks/:locationId/:taskId
  const taskDetailMatch = relativePath.match(/^\/tasks\/([^/]+)\/(\d+)$/);
  if (taskDetailMatch) {
    return {
      locationId: taskDetailMatch[1],
      taskId: taskDetailMatch[2],
      isCreateMode: false,
    };
  }
  
  return {};
}
