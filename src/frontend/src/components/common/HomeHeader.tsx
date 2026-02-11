import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { LoginButton } from './LoginButton';
import { UserProfileMenu } from './UserProfileMenu';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useCurrentPath } from '@/hooks/useCurrentPath';
import { uiCopy } from '@/lib/uiCopy';
import { resolveAssetUrl } from '@/utils/assetUrl';

export function HomeHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const currentPath = useCurrentPath();
  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    const basePath = import.meta.env.BASE_URL || '/';
    const fullPath = basePath.endsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`;
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    const basePath = import.meta.env.BASE_URL || '/';
    const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const normalizedCurrent = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
    const normalizedPath = path === '' ? normalizedBase : `${normalizedBase}/${path}`;
    return normalizedCurrent === normalizedPath;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={resolveAssetUrl('/whisper-logo-teal.svg')}
              alt="Whisper Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-white">
              {uiCopy.product.name}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('proposals')}
              className={`text-sm font-medium transition-colors ${
                isActive('proposals')
                  ? 'text-secondary'
                  : 'text-white hover:text-secondary'
              }`}
            >
              {uiCopy.navigation.proposals}
            </button>
            <button
              onClick={() => handleNavigation('create-instance')}
              className={`text-sm font-medium transition-colors ${
                isActive('create-instance')
                  ? 'text-secondary'
                  : 'text-white hover:text-secondary'
              }`}
            >
              {uiCopy.navigation.createInstance}
            </button>
            {isAdmin && (
              <button
                onClick={() => handleNavigation('admin')}
                className={`text-sm font-medium transition-colors ${
                  isActive('admin')
                    ? 'text-secondary'
                    : 'text-white hover:text-secondary'
                }`}
              >
                {uiCopy.navigation.admin}
              </button>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <UserProfileMenu onNavigate={handleNavigation} />
            ) : (
              <LoginButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('proposals')}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  isActive('proposals')
                    ? 'bg-secondary/10 text-secondary font-medium'
                    : 'text-white hover:bg-slate-800'
                }`}
              >
                {uiCopy.navigation.proposals}
              </button>
              <button
                onClick={() => handleNavigation('create-instance')}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  isActive('create-instance')
                    ? 'bg-secondary/10 text-secondary font-medium'
                    : 'text-white hover:bg-slate-800'
                }`}
              >
                {uiCopy.navigation.createInstance}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNavigation('admin')}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    isActive('admin')
                      ? 'bg-secondary/10 text-secondary font-medium'
                      : 'text-white hover:bg-slate-800'
                  }`}
                >
                  {uiCopy.navigation.admin}
                </button>
              )}
              <div className="px-4 pt-2 border-t border-slate-700">
                {isAuthenticated ? (
                  <UserProfileMenu onNavigate={handleNavigation} />
                ) : (
                  <LoginButton />
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
