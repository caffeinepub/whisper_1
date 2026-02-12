import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileMenu } from './UserProfileMenu';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCurrentPath } from '@/hooks/useCurrentPath';
import { resolveAssetUrl, joinBasePath } from '@/utils/assetUrl';
import { getLastUsedLocationId } from '@/utils/instanceScope';

export function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const currentPath = useCurrentPath();

  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    const fullPath = joinBasePath(path);
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setMobileMenuOpen(false);
  };

  const handleTasksNavigation = () => {
    const lastLocationId = getLastUsedLocationId();
    const tasksPath = lastLocationId ? `/tasks/${lastLocationId}` : '/tasks/default';
    handleNavigation(tasksPath);
  };

  const isActive = (path: string) => {
    const fullPath = joinBasePath(path);
    const basePath = import.meta.env.BASE_URL || '/';
    const normalizedBase = basePath.endsWith('/') && basePath !== '/' ? basePath.slice(0, -1) : basePath;
    
    // For home, check if we're at the base path
    if (path === '/') {
      return currentPath === normalizedBase || currentPath === normalizedBase + '/';
    }
    
    // For other paths, check if current path includes the target path
    return currentPath.includes(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={resolveAssetUrl('/whisper-logo-teal.svg')}
              alt="Whisper Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-white">Whisper</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('/')}
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-secondary' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/feed')}
              className={`text-sm font-medium transition-colors ${
                isActive('/feed') ? 'text-secondary' : 'text-slate-300 hover:text-white'
              }`}
            >
              Feed
            </button>
            <button
              onClick={handleTasksNavigation}
              className={`text-sm font-medium transition-colors ${
                isActive('/tasks') ? 'text-secondary' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => handleNavigation('/geography')}
              className={`text-sm font-medium transition-colors ${
                isActive('/geography') ? 'text-secondary' : 'text-slate-300 hover:text-white'
              }`}
            >
              Geography
            </button>
            {isAuthenticated && <UserProfileMenu onNavigate={handleNavigation} />}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-secondary transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('/')}
                className={`text-sm font-medium text-left transition-colors ${
                  isActive('/') ? 'text-secondary' : 'text-slate-300'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/feed')}
                className={`text-sm font-medium text-left transition-colors ${
                  isActive('/feed') ? 'text-secondary' : 'text-slate-300'
                }`}
              >
                Feed
              </button>
              <button
                onClick={handleTasksNavigation}
                className={`text-sm font-medium text-left transition-colors ${
                  isActive('/tasks') ? 'text-secondary' : 'text-slate-300'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => handleNavigation('/geography')}
                className={`text-sm font-medium text-left transition-colors ${
                  isActive('/geography') ? 'text-secondary' : 'text-slate-300'
                }`}
              >
                Geography
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => handleNavigation('/profile')}
                  className={`text-sm font-medium text-left transition-colors ${
                    isActive('/profile') ? 'text-secondary' : 'text-slate-300'
                  }`}
                >
                  Profile
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
