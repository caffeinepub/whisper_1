import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { useCurrentPath } from '@/hooks/useCurrentPath';
import { UserProfileMenu } from './UserProfileMenu';
import { uiCopy } from '@/lib/uiCopy';
import { resolveAssetUrl } from '@/utils/assetUrl';

export function HomeHeader() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isAuthenticated } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoRetried, setLogoRetried] = useState(false);
  const currentPath = useCurrentPath();

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const navigateToPage = (path: string) => {
    const basePath = import.meta.env.BASE_URL || '/';
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const fullPath = `${normalizedBase}${path.startsWith('/') ? path.slice(1) : path}`;
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setMobileMenuOpen(false);
  };

  // Retry logo loading once on error
  const handleLogoError = () => {
    if (!logoRetried) {
      setLogoRetried(true);
      setLogoError(false);
      setTimeout(() => {
        if (!logoError) {
          setLogoError(false);
        }
      }, 100);
    } else {
      setLogoError(true);
    }
  };

  // Show admin link when authenticated and admin check resolves to true
  const showAdminLink = isAuthenticated && isAdmin === true;

  // Check if a path is active
  const isActivePath = (path: string): boolean => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {!logoError ? (
              <img
                src={resolveAssetUrl('/whisper-logo-teal.svg')}
                alt={uiCopy.product.name}
                className="h-8 w-8"
                onError={handleLogoError}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
            )}
            <span className="text-xl font-bold text-white">{uiCopy.product.name}</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigateToPage('/geography')}
              className={`text-sm font-medium transition-colors ${
                isActivePath('/geography')
                  ? 'text-secondary'
                  : 'text-white hover:text-secondary'
              }`}
            >
              {uiCopy.geography.title}
            </button>

            {showAdminLink && (
              <button
                onClick={() => navigateToPage('/admin/moderation')}
                className={`text-sm font-medium transition-colors ${
                  isActivePath('/admin')
                    ? 'text-secondary'
                    : 'text-white hover:text-secondary'
                }`}
              >
                {uiCopy.admin.title}
              </button>
            )}

            {isAuthenticated ? (
              <UserProfileMenu onNavigate={navigateToPage} />
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="sm"
                className="bg-accent hover:bg-accent-hover text-accent-foreground"
              >
                {isLoggingIn ? uiCopy.auth.loggingIn : uiCopy.hero.getStartedCta}
              </Button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-secondary">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col gap-4 mt-8">
                <button
                  onClick={() => navigateToPage('/geography')}
                  className={`text-left text-base font-medium transition-colors py-2 ${
                    isActivePath('/geography')
                      ? 'text-secondary'
                      : 'text-white hover:text-secondary'
                  }`}
                >
                  {uiCopy.geography.title}
                </button>

                {showAdminLink && (
                  <button
                    onClick={() => navigateToPage('/admin/moderation')}
                    className={`text-left text-base font-medium transition-colors py-2 ${
                      isActivePath('/admin')
                        ? 'text-secondary'
                        : 'text-white hover:text-secondary'
                    }`}
                  >
                    {uiCopy.admin.title}
                  </button>
                )}

                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigateToPage('/profile')}
                      className={`text-left text-base font-medium transition-colors py-2 ${
                        isActivePath('/profile')
                          ? 'text-secondary'
                          : 'text-white hover:text-secondary'
                      }`}
                    >
                      {uiCopy.profile.title}
                    </button>
                    <UserProfileMenu onNavigate={navigateToPage} />
                  </>
                ) : (
                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="bg-accent hover:bg-accent-hover text-accent-foreground w-full"
                  >
                    {isLoggingIn ? uiCopy.auth.loggingIn : uiCopy.hero.getStartedCta}
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
