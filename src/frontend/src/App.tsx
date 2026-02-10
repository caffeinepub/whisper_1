import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ArrowUpRight, Plus, FileText, MessageCircle, Shield, Users, TrendingUp, Heart, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { CreateInstancePlaceholderCard } from '@/components/create-instance/CreateInstancePlaceholderCard';
import { ProposalsSection } from '@/components/proposals/ProposalsSection';
import { SecretaryWidgetPortal } from '@/components/secretary/SecretaryWidgetPortal';
import { SecretaryDiscoverabilityNudge } from '@/components/secretary/SecretaryDiscoverabilityNudge';
import { IconBubble } from '@/components/common/IconBubble';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { usePreloadedImage } from '@/hooks/usePreloadedImage';
import { parseDeepLink } from '@/lib/secretaryNavigation';

function App() {
  const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
  const [showProposals, setShowProposals] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [showFOIA, setShowFOIA] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isSecretaryOpen, setIsSecretaryOpen] = useState(false);
  const [instanceNameInput, setInstanceNameInput] = useState('');
  const [showSecretaryNudge, setShowSecretaryNudge] = useLocalStorageState('whisper-secretary-nudge-dismissed', true);
  const [proposalToOpen, setProposalToOpen] = useState<string | null>(null);
  
  const createInstanceRef = useRef<HTMLDivElement>(null);
  const proposalsRef = useRef<HTMLDivElement>(null);
  const complaintRef = useRef<HTMLDivElement>(null);
  const foiaRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  
  const { register, navigate } = useSecretaryNavigationRegistry();
  
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'whisper-icp'
  );

  // Preload hero image with graceful fallback
  const heroImageSrc = 'https://storage.basecamp.com/bc4-production-activestorage/mwq1mdibz06qks90zdp0a029rnt5?response-content-disposition=inline%3B%20filename%3D%221-a%20second%20best%20hero%20image.jpg%22%3B%20filename%2A%3DUTF-8%27%271-a%2520second%2520best%2520hero%2520image.jpg&response-content-type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=PSFBSAZROHOHENDNACPGDOPOONMFHLBHNMKOEBGFNK%2F20260210%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260210T042856Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=15d679d2bc5a687e8aa935235f8610a85ac00ee395a9c4736db993b144122a97';
  const { isReady: heroImageReady, hasError: heroImageError } = usePreloadedImage(heroImageSrc);

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
      id: 'complaint',
      label: 'File a Complaint',
      keywords: ['complaint', 'police', 'misconduct', 'file'],
      action: () => {
        setShowComplaint(true);
        setTimeout(() => {
          complaintRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    });

    register({
      id: 'foia',
      label: 'Submit a FOIA Request',
      keywords: ['foia', 'information', 'request', 'freedom', 'public'],
      action: () => {
        setShowFOIA(true);
        setTimeout(() => {
          foiaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
    });

    register({
      id: 'support',
      label: 'Get Support',
      keywords: ['support', 'help', 'question', 'assistance', 'how'],
      action: () => {
        setShowSupport(true);
        setTimeout(() => {
          supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    // Map option numbers to navigation actions
    if (optionNumber === 1) {
      // Report an issue → Create Instance
      navigate('create-instance');
    } else if (optionNumber === 2) {
      // File a complaint → Complaint section
      navigate('complaint');
    } else if (optionNumber === 3) {
      // Submit a FOIA request → FOIA section
      navigate('foia');
    } else if (optionNumber === 4) {
      // Join a campaign → Create Instance
      navigate('create-instance');
    } else if (optionNumber === 5) {
      // Browse local issues → Proposals
      navigate('proposals');
    } else if (optionNumber === 6) {
      // Get support → Support section
      navigate('support');
    }
  };

  const handleOpenSecretary = () => {
    setIsSecretaryOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateInstanceOpen(true);
    setTimeout(() => {
      createInstanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDismissNudge = () => {
    setShowSecretaryNudge(false);
  };

  const handleCloseCreateInstance = () => {
    setIsCreateInstanceOpen(false);
  };

  const handleProposalSubmitted = (instanceName: string) => {
    // Close the create instance form
    setIsCreateInstanceOpen(false);
    
    // Open the proposals section
    setShowProposals(true);
    
    // Set the proposal to open
    setProposalToOpen(instanceName);
    
    // Scroll to proposals section
    setTimeout(() => {
      proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[oklch(0.25_0.08_220)] via-[oklch(0.22_0.09_230)] to-[oklch(0.18_0.10_240)]">
      {/* Header - Dark with semi-transparent backdrop */}
      <header className="bg-[oklch(0.15_0.05_230)]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBubble size="md" variant="secondary">
                <Shield className="h-5 w-5" />
              </IconBubble>
              <h1 className="text-2xl font-bold tracking-tight text-secondary">
                Whisper
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="text-white/80 hover:text-white transition-colors font-medium">Home</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors font-medium">Features</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors font-medium">About</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors font-medium">Contact</a>
            </nav>
            <Button
              onClick={handleCreateClick}
              className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-full px-6 shadow-lg transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Image - External URL with Bottom Justification */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: heroImageError ? 'none' : `url(${heroImageSrc})`,
              backgroundColor: heroImageError ? 'oklch(0.20 0.08 230)' : 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Dark Blue Overlay at 25% opacity */}
          <div 
            className="absolute inset-0 z-[1]"
            style={{
              backgroundColor: 'oklch(0.20 0.08 230)',
              opacity: 0.25
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white motion-safe:animate-fade-in-up motion-reduce:opacity-100" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.6)' }}>
                Reclaiming Government of the People, by the People
              </h2>
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto motion-safe:animate-fade-in-up motion-safe:[animation-delay:150ms] motion-reduce:opacity-100 font-normal leading-relaxed" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}>
                A decentralized civic platform designed for citizens to identify, collaborate on, and solve issues — where contribution earns recognition and reward, transparency is guaranteed, and trust in local governance is rebuilt from the ground up.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 motion-safe:animate-fade-in-up motion-safe:[animation-delay:300ms] motion-reduce:opacity-100">
                <Button
                  size="lg"
                  onClick={handleCreateClick}
                  className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-10 py-7 text-lg shadow-xl transition-all hover:scale-105"
                >
                  Explore Whisper
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleOpenSecretary}
                  className="border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/20 hover:text-secondary hover:border-secondary rounded-full px-10 py-7 text-lg backdrop-blur-sm transition-all font-bold shadow-xl hover:scale-105 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                >
                  <MessageCircle className="h-5 w-5 mr-2 text-secondary" />
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
              <div className="motion-safe:animate-fade-in-up motion-reduce:opacity-100">
                <SecretaryDiscoverabilityNudge
                  onOpenSecretary={handleOpenSecretary}
                  onDismiss={handleDismissNudge}
                />
              </div>
            )}

            {/* Create Instance Section */}
            <section ref={createInstanceRef} id="create-instance" className="scroll-mt-24">
              {isCreateInstanceOpen ? (
                <CreateInstancePlaceholderCard
                  onClose={handleCloseCreateInstance}
                  initialInstanceName={instanceNameInput}
                  onProposalSubmitted={handleProposalSubmitted}
                />
              ) : (
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-3">Create Your Local Instance</h3>
                  <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
                    Start a Whisper installation for your city, county, or state. Build transparency and accountability in your community.
                  </p>
                  <Button
                    onClick={() => setIsCreateInstanceOpen(true)}
                    className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-full px-8 py-6 text-lg shadow-lg transition-all hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Instance
                  </Button>
                </div>
              )}
            </section>

            {/* Proposals Section */}
            {showProposals && (
              <section ref={proposalsRef} id="proposals" className="scroll-mt-24">
                <ProposalsSection proposalToOpen={proposalToOpen} onProposalOpened={() => setProposalToOpen(null)} />
              </section>
            )}

            {/* Features Grid */}
            <section id="features" className="py-12">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-3">Why Whisper?</h3>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  A platform built for citizens, by citizens. Transparent, decentralized, and designed to rebuild trust.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-[oklch(0.20_0.05_230)] border-white/10 hover:border-secondary/50 transition-all hover-lift">
                  <CardHeader>
                    <IconBubble size="lg" variant="secondary">
                      <Shield className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-white mt-4">Decentralized Trust</CardTitle>
                    <CardDescription className="text-white/70">
                      Built on the Internet Computer, ensuring transparency and immutability for all civic actions.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[oklch(0.20_0.05_230)] border-white/10 hover:border-secondary/50 transition-all hover-lift">
                  <CardHeader>
                    <IconBubble size="lg" variant="secondary">
                      <Users className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-white mt-4">Community Driven</CardTitle>
                    <CardDescription className="text-white/70">
                      Collaborate with neighbors to identify and solve local issues together.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[oklch(0.20_0.05_230)] border-white/10 hover:border-secondary/50 transition-all hover-lift">
                  <CardHeader>
                    <IconBubble size="lg" variant="secondary">
                      <TrendingUp className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-white mt-4">Earn Recognition</CardTitle>
                    <CardDescription className="text-white/70">
                      Contributions are tracked and rewarded, building reputation and trust in your community.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* Complaint Section */}
            {showComplaint && (
              <section ref={complaintRef} id="complaint" className="scroll-mt-24">
                <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconBubble size="lg" variant="warning">
                        <AlertTriangle className="h-6 w-6" />
                      </IconBubble>
                      <CardTitle className="text-2xl text-white">File a Complaint</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      Report misconduct or issues with local authorities. Your complaint will be recorded on-chain for transparency.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="complaint-title" className="text-white">Complaint Title</Label>
                      <Input
                        id="complaint-title"
                        placeholder="Brief description of the issue"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="complaint-details" className="text-white">Details</Label>
                      <Textarea
                        id="complaint-details"
                        placeholder="Provide detailed information about the complaint..."
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <Button className="bg-warning hover:bg-warning/90 text-warning-foreground font-semibold">
                      Submit Complaint
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* FOIA Section */}
            {showFOIA && (
              <section ref={foiaRef} id="foia" className="scroll-mt-24">
                <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconBubble size="lg" variant="secondary">
                        <FileText className="h-6 w-6" />
                      </IconBubble>
                      <CardTitle className="text-2xl text-white">Submit a FOIA Request</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      Request public records and information from government agencies. Track your request on-chain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="foia-agency" className="text-white">Agency</Label>
                      <Input
                        id="foia-agency"
                        placeholder="Which agency are you requesting from?"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="foia-request" className="text-white">Request Details</Label>
                      <Textarea
                        id="foia-request"
                        placeholder="Describe the information you are requesting..."
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold">
                      Submit FOIA Request
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Support Section */}
            {showSupport && (
              <section ref={supportRef} id="support" className="scroll-mt-24">
                <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconBubble size="lg" variant="secondary">
                        <HelpCircle className="h-6 w-6" />
                      </IconBubble>
                      <CardTitle className="text-2xl text-white">Get Support</CardTitle>
                    </div>
                    <CardDescription className="text-white/70">
                      Need help using Whisper? Have questions about the platform? We're here to help.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="support-subject" className="text-white">Subject</Label>
                      <Input
                        id="support-subject"
                        placeholder="What do you need help with?"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="support-message" className="text-white">Message</Label>
                      <Textarea
                        id="support-message"
                        placeholder="Describe your question or issue..."
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-secondary"
                      />
                    </div>
                    <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold">
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[oklch(0.15_0.05_230)] border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>© {new Date().getFullYear()} Whisper</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>Built with</span>
              <Heart className="h-4 w-4 text-accent fill-accent" />
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-secondary/80 transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Secretary Widget Portal */}
      <SecretaryWidgetPortal
        open={isSecretaryOpen}
        onOpenChange={setIsSecretaryOpen}
        onOptionSelect={handleSecretaryOptionSelect}
      />
    </div>
  );
}

export default App;
