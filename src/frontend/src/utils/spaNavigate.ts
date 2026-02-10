/**
 * SPA navigation helper using pushState + popstate pattern
 * Consistent with HomeHeader navigation approach
 */
export function spaNavigate(path: string): void {
  const basePath = import.meta.env.BASE_URL || '/';
  const fullPath = basePath.endsWith('/') ? basePath + path.slice(1) : basePath + path;
  
  window.history.pushState({}, '', fullPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
