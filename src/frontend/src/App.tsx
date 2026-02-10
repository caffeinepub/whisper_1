import { lazy, Suspense, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { HomeHeader } from '@/components/common/HomeHeader';
import { SecretaryDiscoverabilityNudge } from '@/components/secretary/SecretaryDiscoverabilityNudge';
import { SecretaryWidgetPortal } from '@/components/secretary/SecretaryWidgetPortal';
import { ProposalsSection } from '@/components/proposals/ProposalsSection';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { uiCopy } from '@/lib/uiCopy';
import { resolveAssetUrl } from '@/utils/assetUrl';
import { MessageCircle, Users, Shield, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GeographyPage = lazy(() => import('@/pages/GeographyPage'));
const AdminModerationPage = lazy(() => import('@/pages/admin/AdminModerationPage'));
const ProfileViewPage = lazy(() => import('@/pages/profile/ProfileViewPage'));
const ProfileEditPage = lazy(() => import('@/pages/profile/ProfileEditPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [secretaryOpen, setSecretaryOpen] = useState(false);
  const [secretaryInitialFlow, setSecretaryInitialFlow] = useState<'discovery' | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'geography' | 'admin' | 'profile' | 'profile-edit'>('home');
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const { register, unregister } = useSecretaryNavigationRegistry();

  // Listen to popstate events to update currentPage
  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname;
      const basePath = import.meta.env.BASE_URL || '/';
      const relativePath = path.startsWith(basePath) ? path.slice(basePath.length) : path;
      
      if (relativePath.includes('profile/edit')) {
        setCurrentPage('profile-edit');
      } else if (relativePath.includes('profile')) {
        setCurrentPage('profile');
      } else if (relativePath.includes('geography')) {
        setCurrentPage('geography');
      } else if (relativePath.includes('admin')) {
        setCurrentPage('admin');
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

    return () => {
      unregister('proposals');
      unregister('create-instance');
      unregister('report-issue');
    };
  }, [register, unregister]);

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
        <ProfileViewPage />
      </Suspense>
    );
  }

  if (currentPage === 'profile-edit') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ProfileEditPage />
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
        initialFlow={secretaryInitialFlow}
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
