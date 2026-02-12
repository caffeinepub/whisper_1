import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfileMenu } from './UserProfileMenu';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCurrentPath } from '@/hooks/useCurrentPath';
import { resolveAssetUrl, joinBasePath } from '@/utils/assetUrl';

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
              className={`text-white hover:text-secondary transition-colors ${
                isActive('/') ? 'text-secondary' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/geography')}
              className={`text-white hover:text-secondary transition-colors ${
                isActive('/geography') ? 'text-secondary' : ''
              }`}
            >
              Geography
            </button>
            {isAuthenticated && (
              <button
                onClick={() => handleNavigation('/admin')}
                className={`text-white hover:text-secondary transition-colors ${
                  isActive('/admin') ? 'text-secondary' : ''
                }`}
              >
                Admin
              </button>
            )}
            {isAuthenticated ? (
              <UserProfileMenu onNavigate={handleNavigation} />
            ) : (
              <Button
                onClick={() => handleNavigation('/profile')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Login
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
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
                className={`text-white hover:text-secondary transition-colors text-left ${
                  isActive('/') ? 'text-secondary' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/geography')}
                className={`text-white hover:text-secondary transition-colors text-left ${
                  isActive('/geography') ? 'text-secondary' : ''
                }`}
              >
                Geography
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => handleNavigation('/admin')}
                  className={`text-white hover:text-secondary transition-colors text-left ${
                    isActive('/admin') ? 'text-secondary' : ''
                  }`}
                >
                  Admin
                </button>
              )}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className={`text-white hover:text-secondary transition-colors text-left ${
                      isActive('/profile') ? 'text-secondary' : ''
                    }`}
                  >
                    Profile
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => handleNavigation('/profile')}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
