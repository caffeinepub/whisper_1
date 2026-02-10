import { lazy, Suspense, useEffect, useState } from 'react';
import { LoadingIndicator } from './components/common/LoadingIndicator';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

const AdminModerationPage = lazy(() => import('./pages/admin/AdminModerationPage'));
const AdminDeletionRequestsPage = lazy(() => import('./pages/admin/AdminDeletionRequestsPage'));
const ProfileViewPage = lazy(() => import('./pages/profile/ProfileViewPage'));
const ProfileEditPage = lazy(() => import('./pages/profile/ProfileEditPage'));
const GeographyPage = lazy(() => import('./pages/GeographyPage'));

type PageKey = 'home' | 'admin' | 'admin-deletion-requests' | 'profile' | 'profile-edit' | 'geography';

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/deletion-requests') {
        setCurrentPage('admin-deletion-requests');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/profile/edit') {
        setCurrentPage('profile-edit');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/geography') {
        setCurrentPage('geography');
      } else {
        setCurrentPage('home');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminModerationPage />;
      case 'admin-deletion-requests':
        return <AdminDeletionRequestsPage />;
      case 'profile':
        return <ProfileViewPage />;
      case 'profile-edit':
        return <ProfileEditPage />;
      case 'geography':
        return <GeographyPage />;
      case 'home':
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center max-w-4xl px-4">
              {/* PERMANENT HERO TEXT – DO NOT CHANGE IN FUTURE BUILDS */}
              {/* This is the official mission statement and must remain exactly as written */}
              <h1 className="text-4xl font-bold mb-4">Of the People, By the People — Realized</h1>
              <p className="text-muted-foreground">
                Whisper is the decentralized platform where citizens report issues, collaborate openly, and resolve them together — rewarding real effort, guaranteeing transparency, and rebuilding trust in local governance from the ground up.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <AppErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingIndicator />
          </div>
        }
      >
        {renderPage()}
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
