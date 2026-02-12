import { lazy, Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { HomeHeader } from '@/components/common/HomeHeader';
import { SecretaryDiscoverabilityNudge } from '@/components/secretary/SecretaryDiscoverabilityNudge';
import { SecretaryWidgetPortal } from '@/components/secretary/SecretaryWidgetPortal';
import { ProposalsSection } from '@/components/proposals/ProposalsSection';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { uiCopy } from '@/lib/uiCopy';
import { resolveAssetUrl, joinBasePath } from '@/utils/assetUrl';
import { MessageCircle, Users, Shield, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NavigationRequest } from '@/secretary/brain/SecretaryBrain';

const GeographyPage = lazy(() => import('@/pages/GeographyPage'));
const AdminModerationPage = lazy(() => import('@/pages/admin/AdminModerationPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const TasksListPage = lazy(() => import('@/pages/tasks/TasksListPage'));
const TaskDetailPage = lazy(() => import('@/pages/tasks/TaskDetailPage'));
const TaskCreatePage = lazy(() => import('@/pages/tasks/TaskCreatePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

type PageType = 'home' | 'geography' | 'admin' | 'profile' | 'feed' | 'tasks-list' | 'task-detail' | 'task-create';

interface TasksRouteParams {
  locationId?: string;
  taskId?: string;
}

function AppContent() {
  const [secretaryOpen, setSecretaryOpen] = useState(false);
  const [secretaryInitialFlow, setSecretaryInitialFlow] = useState<'discovery' | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [tasksRouteParams, setTasksRouteParams] = useState<TasksRouteParams>({});
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const { register, unregister, navigate: navigateToDestination, findByKeyword } = useSecretaryNavigationRegistry();

  // Auto-open Secretary on initial page load (once per session)
  useEffect(() => {
    const hasAutoOpened = sessionStorage.getItem('secretary-auto-opened');
    if (!hasAutoOpened && currentPage === 'home') {
      setSecretaryOpen(true);
      sessionStorage.setItem('secretary-auto-opened', 'true');
    }
  }, [currentPage]);

  // Listen to popstate events to update currentPage
  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname;
      const basePath = import.meta.env.BASE_URL || '/';
      
      // Normalize basePath for comparison (handle both '/base' and '/base/')
      const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
      const relativePath = path.startsWith(normalizedBase) 
        ? path.slice(normalizedBase.length) 
        : path;
      
      // Parse tasks routes
      const tasksMatch = relativePath.match(/^\/tasks\/([^/]+)(?:\/new)?$/);
      const taskDetailMatch = relativePath.match(/^\/tasks\/([^/]+)\/(\d+)$/);
      
      if (taskDetailMatch) {
        setCurrentPage('task-detail');
        setTasksRouteParams({ locationId: taskDetailMatch[1], taskId: taskDetailMatch[2] });
      } else if (tasksMatch) {
        const isNew = relativePath.endsWith('/new');
        if (isNew) {
          setCurrentPage('task-create');
          setTasksRouteParams({ locationId: tasksMatch[1] });
        } else {
          setCurrentPage('tasks-list');
          setTasksRouteParams({ locationId: tasksMatch[1] });
        }
      } else if (relativePath.includes('geography')) {
        setCurrentPage('geography');
      } else if (relativePath.includes('admin')) {
        setCurrentPage('admin');
      } else if (relativePath.includes('profile')) {
        setCurrentPage('profile');
      } else if (relativePath.includes('feed')) {
        setCurrentPage('feed');
      } else {
        setCurrentPage('home');
      }
    };

    updatePage();
    window.addEventListener('popstate', updatePage);
    return () => window.removeEventListener('popstate', updatePage);
  }, []);

  useEffect(() => {
    register({
      id: 'proposals',
      label: uiCopy.proposals.title,
      keywords: ['proposals', 'view proposals', 'see proposals', 'instances', 'projects'],
      action: () => {
        const element = document.getElementById('proposals');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      },
    });

    register({
      id: 'create-instance',
      label: uiCopy.createInstance.title,
      keywords: ['create', 'new instance', 'start instance', 'propose', 'new proposal'],
      action: () => {
        const element = document.getElementById('get-started');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      },
    });

    register({
      id: 'report-issue',
      label: uiCopy.reportIssue.title,
      keywords: ['report', 'issue', 'problem', 'complaint', 'concern'],
      action: () => {
        setSecretaryOpen(true);
      },
    });

    register({
      id: 'staking',
      label: 'Staking',
      keywords: ['staking', 'stake', 'unstake', 'rewards', 'lock', 'locked', 'tokens'],
      action: () => {
        // Navigate to profile page
        const profilePath = joinBasePath('/profile');
        window.history.pushState({}, '', profilePath);
        setCurrentPage('profile');
        
        // Scroll to staking section after a short delay to ensure page is rendered
        setTimeout(() => {
          const stakingElement = document.getElementById('staking-section');
          if (stakingElement) {
            stakingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
    });

    register({
      id: 'governance',
      label: uiCopy.governance.title,
      keywords: ['governance', 'vote', 'voting', 'govern', 'policy', 'policies'],
      action: () => {
        // Navigate to profile page
        const profilePath = joinBasePath('/profile');
        window.history.pushState({}, '', profilePath);
        setCurrentPage('profile');
        
        // Scroll to governance section after a short delay to ensure page is rendered
        setTimeout(() => {
          const governanceElement = document.getElementById('governance-section');
          if (governanceElement) {
            governanceElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      },
    });

    register({
      id: 'feed',
      label: 'Feed',
      keywords: ['feed', 'posts', 'latest posts', 'community feed', 'social'],
      action: () => {
        const feedPath = joinBasePath('/feed');
        window.history.pushState({}, '', feedPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    });

    return () => {
      unregister('proposals');
      unregister('create-instance');
      unregister('report-issue');
      unregister('staking');
      unregister('governance');
      unregister('feed');
    };
  }, [register, unregister]);

  // Base-path-safe navigation handler for Secretary
  const handleSecretaryNavigation = (request: NavigationRequest) => {
    const success = navigateToDestination(request.destinationId);
    if (success && request.shouldClose) {
      // Close Secretary after successful navigation if requested
      setSecretaryOpen(false);
    }
  };

  // Base-path-safe keyword finder for Secretary
  const handleSecretaryKeywordFind = (text: string) => {
    const destination = findByKeyword(text);
    return destination ? { id: destination.id } : null;
  };

  const handleOpenSecretary = () => {
    setSecretaryInitialFlow(null);
    setSecretaryOpen(true);
  };

  const handleOpenSecretaryDiscovery = () => {
    setSecretaryInitialFlow('discovery');
    setSecretaryOpen(true);
  };

  const handleOpenSecretaryReportIssue = () => {
    setSecretaryOpen(true);
  };

  if (currentPage === 'geography') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <GeographyPage />
      </Suspense>
    );
  }

  if (currentPage === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <AdminModerationPage />
      </Suspense>
    );
  }

  if (currentPage === 'profile') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ProfilePage />
      </Suspense>
    );
  }

  if (currentPage === 'feed') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <FeedPage />
      </Suspense>
    );
  }

  if (currentPage === 'tasks-list' && tasksRouteParams.locationId) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <TasksListPage locationId={tasksRouteParams.locationId} />
      </Suspense>
    );
  }

  if (currentPage === 'task-detail' && tasksRouteParams.locationId && tasksRouteParams.taskId) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <TaskDetailPage locationId={tasksRouteParams.locationId} taskId={tasksRouteParams.taskId} />
      </Suspense>
    );
  }

  if (currentPage === 'task-create' && tasksRouteParams.locationId) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <TaskCreatePage locationId={tasksRouteParams.locationId} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      {/* Hero Section */}
      <section
        className="hero relative bg-cover bg-center flex items-center justify-center text-white pt-16"
        style={{
          backgroundImage: `url(${resolveAssetUrl('/assets/generated/second-best-hero-image.dim_2400x1350.jpg')})`,
        }}
      >
        <div className="container mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            {uiCopy.hero.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in-up opacity-90">
            {uiCopy.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <Button
              onClick={() => {
                const element = document.getElementById('get-started');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold px-8 w-full sm:w-auto"
            >
              {uiCopy.hero.primaryCta}
            </Button>
            <Button
              onClick={handleOpenSecretaryReportIssue}
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-semibold px-8 w-full sm:w-auto"
            >
              {uiCopy.hero.secondaryCta}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{uiCopy.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm hover-lift border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{uiCopy.features.feature1Title}</h3>
              <p className="text-muted-foreground">{uiCopy.features.feature1Description}</p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm hover-lift border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{uiCopy.features.feature2Title}</h3>
              <p className="text-muted-foreground">{uiCopy.features.feature2Description}</p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm hover-lift border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{uiCopy.features.feature3Title}</h3>
              <p className="text-muted-foreground">{uiCopy.features.feature3Description}</p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm hover-lift border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{uiCopy.features.feature4Title}</h3>
              <p className="text-muted-foreground">{uiCopy.features.feature4Description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secretary Nudge */}
      {!nudgeDismissed && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <SecretaryDiscoverabilityNudge 
              onOpen={handleOpenSecretary}
              onDismiss={() => setNudgeDismissed(true)}
            />
          </div>
        </section>
      )}

      {/* Your City on Whisper Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{uiCopy.createInstance.yourCityOnWhisper}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {uiCopy.createInstance.yourCityDescription}
          </p>
          <Button
            onClick={handleOpenSecretaryDiscovery}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8"
          >
            {uiCopy.createInstance.discoverYourCity}
          </Button>
        </div>
      </section>

      {/* Report Issue Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{uiCopy.reportIssue.sectionTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {uiCopy.reportIssue.sectionDescription}
          </p>
          <Button
            onClick={handleOpenSecretaryReportIssue}
            size="lg"
            className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold px-8"
          >
            {uiCopy.reportIssue.reportIssueCta}
          </Button>
        </div>
      </section>

      {/* Proposals Section */}
      <section id="proposals" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <ProposalsSection />
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{uiCopy.createInstance.getStartedTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {uiCopy.createInstance.getStartedDescription}
          </p>
          <Button
            onClick={handleOpenSecretary}
            size="lg"
            className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold px-8"
          >
            {uiCopy.createInstance.openSecretary}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {uiCopy.product.name}. {uiCopy.footer.allRightsReserved}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1">
            {uiCopy.footer.builtWith} <Heart className="h-4 w-4 text-red-500 inline" /> {uiCopy.footer.using}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname || 'whisper-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <SecretaryWidgetPortal
        open={secretaryOpen}
        onOpenChange={setSecretaryOpen}
        navigationHandler={handleSecretaryNavigation}
        findByKeyword={handleSecretaryKeywordFind}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
