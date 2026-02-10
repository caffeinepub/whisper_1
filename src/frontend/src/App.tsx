import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, ArrowUpRight, Plus, FileText, MessageCircle, Shield, Users, TrendingUp } from 'lucide-react';
import { CreateInstancePlaceholderCard } from '@/components/create-instance/CreateInstancePlaceholderCard';
import { ProposalsSection } from '@/components/proposals/ProposalsSection';
import { SecretaryWidget } from '@/components/secretary/SecretaryWidget';
import { SecretaryDiscoverabilityNudge } from '@/components/secretary/SecretaryDiscoverabilityNudge';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { parseDeepLink } from '@/lib/secretaryNavigation';

function App() {
  const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
  const [showProposals, setShowProposals] = useState(false);
  const [isSecretaryOpen, setIsSecretaryOpen] = useState(false);
  const [hasSeenSecretaryNudge, setHasSeenSecretaryNudge] = useLocalStorageState(
    'whisper-secretary-nudge-dismissed',
    false
  );
  
  const createInstanceRef = useRef<HTMLDivElement>(null);
  const proposalsRef = useRef<HTMLDivElement>(null);
  
  const { register, navigate } = useSecretaryNavigationRegistry();
  
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'whisper-icp'
  );

  // Register navigation destinations
  useEffect(() => {
    register({
      id: 'create-instance',
      label: 'Create Instance',
      keywords: ['create', 'instance', 'new', 'start', 'installation'],
      action: () => {
        setIsCreateInstanceOpen(true);
        setTimeout(() => {
          createInstanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    });

    register({
      id: 'proposals',
      label: 'Browse Proposals',
      keywords: ['proposals', 'browse', 'issues', 'local', 'area', 'view'],
      action: () => {
        setShowProposals(true);
        setTimeout(() => {
          proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      },
    });

    register({
      id: 'secretary',
      label: 'Open Secretary',
      keywords: ['secretary', 'assistant', 'help', 'chat'],
      action: () => {
        setIsSecretaryOpen(true);
      },
    });
  }, [register]);

  // Handle deep links on mount
  useEffect(() => {
    const intent = parseDeepLink(window.location.href);
    if (intent) {
      if (intent.type === 'action') {
        navigate(intent.target);
      } else if (intent.type === 'section') {
        const element = document.getElementById(intent.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [navigate]);

  const handleSecretaryOptionSelect = (optionNumber: number) => {
    if (optionNumber === 5) {
      navigate('proposals');
    } else if (optionNumber === 1 || optionNumber === 4) {
      navigate('create-instance');
    }
  };

  const handleOpenSecretary = () => {
    setIsSecretaryOpen(true);
    setHasSeenSecretaryNudge(true);
  };

  const handleDismissNudge = () => {
    setHasSeenSecretaryNudge(true);
  };

  const showSecretaryNudge = !hasSeenSecretaryNudge && !isSecretaryOpen;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Dark Navy */}
      <header className="bg-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-accent" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Whisper
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Home</a>
              <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Features</a>
              <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">About</a>
              <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Contact</a>
            </nav>
            <Button
              onClick={() => setIsCreateInstanceOpen(true)}
              className="cta-primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Warm Community Image and Refined Overlay */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Hero Background Image with Warm Tones */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/generated/whisper-hero-community-real-warm-v3.dim_1600x900.png"
              alt="Diverse community members collaborating and sharing ideas"
              className="w-full h-full object-cover object-center brightness-105 contrast-105"
              style={{ objectPosition: '50% 40%' }}
            />
            {/* Warm/neutral overlay gradient with reduced opacity for better photo visibility */}
            <div className="hero-overlay"></div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white motion-safe:animate-fade-in-up motion-reduce:opacity-100" style={{ textShadow: '0 3px 10px rgba(0, 0, 0, 0.5), 0 6px 20px rgba(0, 0, 0, 0.4)' }}>
                Reclaiming Government of the People, by the People
              </h2>
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto motion-safe:animate-fade-in-up motion-safe:[animation-delay:150ms] motion-reduce:opacity-100 font-medium" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)' }}>
                A decentralized civic platform designed for citizens to identify, collaborate on, and solve issues — where contribution earns recognition and reward, transparency is guaranteed, and trust in local governance is rebuilt from the ground up.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 motion-safe:animate-fade-in-up motion-safe:[animation-delay:300ms] motion-reduce:opacity-100">
                <Button
                  size="lg"
                  onClick={() => setIsCreateInstanceOpen(true)}
                  className="cta-primary text-base px-8 py-6"
                >
                  Explore Whisper
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleOpenSecretary}
                  className="border-white/50 bg-white/15 text-white hover:bg-white/25 hover:text-white hover:border-white/70 rounded-xl px-8 py-6 text-base backdrop-blur-sm transition-all font-semibold shadow-lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Talk to Secretary
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Secretary Discoverability Nudge */}
            {showSecretaryNudge && (
              <SecretaryDiscoverabilityNudge
                onOpenSecretary={handleOpenSecretary}
                onDismiss={handleDismissNudge}
              />
            )}

            {/* Proposals Section */}
            {showProposals && (
              <div ref={proposalsRef} id="proposals">
                <ProposalsSection />
                <Separator className="my-8" />
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Create Instance Card - Prominent */}
              <div className="lg:col-span-2 space-y-6" ref={createInstanceRef} id="create-instance">
                {isCreateInstanceOpen ? (
                  <CreateInstancePlaceholderCard onClose={() => setIsCreateInstanceOpen(false)} />
                ) : (
                  <Card className="bg-card/80 backdrop-blur-sm border-accent/50 shadow-glow hover-lift">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2 text-accent">
                        <Plus className="h-6 w-6" />
                        Create Instance
                      </CardTitle>
                      <CardDescription className="text-base">
                        Start a new Whisper installation for your city, county, or state
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={() => setIsCreateInstanceOpen(true)}
                          className="cta-primary flex-1"
                        >
                          Create New Instance
                        </Button>
                      </div>
                      
                      {/* AI Secretary Bubble - Refined contrast */}
                      <div className="mt-6 p-4 rounded-xl bg-slate-700/90 border border-slate-600/50 relative shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white mb-1">AI Secretary</p>
                            <p className="text-base text-white/95 leading-relaxed">
                              "How can I assist with civic issues today?"
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Core Principles */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-border/50 hover-lift bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <Shield className="h-8 w-8 text-accent mb-2" />
                      <CardTitle className="text-lg">Equality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Merit-based influence through verifiable contributions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover-lift bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                      <CardTitle className="text-lg">Transparency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Immutable logs prevent manipulation
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover-lift bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <Users className="h-8 w-8 text-warning mb-2" />
                      <CardTitle className="text-lg">Accountability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Same standard for all stakeholders
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-4">
                <Card className="border-accent/30 bg-card/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={handleOpenSecretary}
                      className="cta-primary w-full justify-start"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                    <Button
                      onClick={() => setIsCreateInstanceOpen(true)}
                      className="cta-success w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Join Campaign
                    </Button>
                    <Button
                      onClick={() => setShowProposals(!showProposals)}
                      variant={showProposals ? "default" : "outline"}
                      className={showProposals 
                        ? "cta-primary w-full justify-start"
                        : "w-full rounded-xl justify-start border-accent/30 hover:bg-accent/10 shadow-sm hover:shadow-md transition-all font-medium"
                      }
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Local Rankings
                    </Button>
                  </CardContent>
                </Card>

                {/* Installation Hierarchy Preview */}
                <Card className="border-border/50 bg-muted/30 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Hierarchy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-accent flex-shrink-0" />
                        <span className="text-foreground">WhisperUSA</span>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">WhisperIowa</span>
                      </div>
                      <div className="ml-8 flex items-center gap-2">
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">ScottCounty-IA</span>
                      </div>
                      <div className="ml-12 flex items-center gap-2">
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">Davenport-IA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator className="my-12" />

            {/* Architecture Overview */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold">Architecture Foundation</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Built on the Internet Computer Protocol with comprehensive documentation and phased development plan
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 hover-lift bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Documentation
                    </CardTitle>
                    <CardDescription>
                      Comprehensive architecture and planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Architecture Overview</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phased Development Plan</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deployment Guide</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Style Guide</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 hover-lift bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-warning" />
                      Current Phase
                    </CardTitle>
                    <CardDescription>
                      Phase 4: Geography-driven instance creation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">U.S. Geography Data Model</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cascading Selector UI</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Proposal System</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Secretary Navigation</span>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Complete
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-accent" />
              <span>© {new Date().getFullYear()} Whisper. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <span className="text-destructive">♥</span>
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Secretary Widget */}
      <SecretaryWidget
        open={isSecretaryOpen}
        onOpenChange={setIsSecretaryOpen}
        onOptionSelect={handleSecretaryOptionSelect}
      />
    </div>
  );
}

export default App;
