import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ArrowUpRight, Plus, FileText, MessageCircle, Shield, Users, TrendingUp, Heart, AlertTriangle, Info, HelpCircle, X } from 'lucide-react';
import { CreateInstancePlaceholderCard } from '@/components/create-instance/CreateInstancePlaceholderCard';
import { ProposalsSection } from '@/components/proposals/ProposalsSection';
import { SecretaryWidgetPortal } from '@/components/secretary/SecretaryWidgetPortal';
import { SecretaryDiscoverabilityNudge } from '@/components/secretary/SecretaryDiscoverabilityNudge';
import { IconBubble } from '@/components/common/IconBubble';
import { HomeHeader } from '@/components/common/HomeHeader';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useSecretaryNavigationRegistry } from '@/hooks/useSecretaryNavigationRegistry';
import { parseDeepLink } from '@/lib/secretaryNavigation';
import { usePreloadedImage } from '@/hooks/usePreloadedImage';

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

  // Preload hero image
  const heroImageUrl = 'https://storage.basecamp.com/bc4-production-activestorage/mwq1mdibz06qks90zdp0a029rnt5?response-content-disposition=inline%3B%20filename%3D%221-a%20second%20best%20hero%20image.jpg%22%3B%20filename%2A%3DUTF-8%27%271-a%2520second%2520best%2520hero%2520image.jpg&response-content-type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=PSFBSAZROHOHENDNACPGDOPOONMFHLBHNMKOEBGFNK%2F20260210%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260210T042856Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=15d679d2bc5a687e8aa935235f8610a85ac00ee395a9c4736db993b144122a97';
  const { isReady: heroImageReady } = usePreloadedImage(heroImageUrl);

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
  }, [register]);

  // Handle deep links from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLink = params.get('secretary');
    if (deepLink) {
      const parsed = parseDeepLink(deepLink);
      if (parsed) {
        navigate(parsed.target);
        setIsSecretaryOpen(true);
      }
    }
  }, [navigate]);

  const handleProposalSubmitted = (instanceName: string) => {
    setProposalToOpen(instanceName);
    setShowProposals(true);
    setTimeout(() => {
      proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGetStarted = () => {
    setIsCreateInstanceOpen(true);
    setTimeout(() => {
      createInstanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <HomeHeader onGetStarted={handleGetStarted} />

      {/* Hero Section */}
      <section className="hero relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with external URL - bottom justified */}
        {heroImageReady && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        
        {/* Fallback background color when image is loading or fails */}
        {!heroImageReady && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: 'oklch(0.30 0.05 230)',
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Reclaiming Government of the People, by the People
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            A decentralized civic platform designed for citizens to identify, collaborate on, and solve issues — where contribution earns recognition and reward, transparency is guaranteed, and trust in local governance is rebuilt from the ground up.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => {
                setShowProposals(true);
                setTimeout(() => {
                  proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg px-8 py-6 shadow-lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Explore Whisper
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsSecretaryOpen(true)}
              className="border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white font-semibold text-lg px-8 py-6 shadow-lg backdrop-blur-sm"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Talk to Secretary
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {/* Create Instance Section */}
        {isCreateInstanceOpen && (
          <section ref={createInstanceRef} className="scroll-mt-8">
            <CreateInstancePlaceholderCard
              onClose={() => setIsCreateInstanceOpen(false)}
              initialInstanceName={instanceNameInput}
              onProposalSubmitted={handleProposalSubmitted}
            />
          </section>
        )}

        {/* Proposals Section */}
        {showProposals && (
          <section ref={proposalsRef} className="scroll-mt-8">
            <ProposalsSection proposalToOpen={proposalToOpen} />
          </section>
        )}

        {/* CTA Section - Ready to Get Started */}
        <section className="space-y-8 text-center py-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-foreground">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the movement for transparent, accountable, and community-driven governance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg px-8 py-6 shadow-lg w-full sm:w-auto"
            >
              Create Your Instance
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsSecretaryOpen(true)}
              className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold text-lg px-8 py-6 shadow-lg w-full sm:w-auto"
            >
              Talk to Secretary
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering communities with tools for transparency, accountability, and civic participation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature: Decentralized Governance */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <Users className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">Decentralized Governance</CardTitle>
                <CardDescription>
                  Community-driven decision making powered by blockchain technology.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create and manage local instances with transparent voting and proposal systems.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Police Accountability */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <Shield className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">Police Accountability</CardTitle>
                <CardDescription>
                  File complaints and track misconduct with immutable records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Secure, anonymous reporting system ensuring transparency and justice.
                </p>
                <Button
                  variant="link"
                  className="mt-4 p-0 h-auto text-secondary hover:text-secondary/80"
                  onClick={() => setShowComplaint(true)}
                >
                  File a Complaint
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Feature: FOIA Requests */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <FileText className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">FOIA Requests</CardTitle>
                <CardDescription>
                  Access public information through streamlined request processes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Submit and track Freedom of Information Act requests with ease.
                </p>
                <Button
                  variant="link"
                  className="mt-4 p-0 h-auto text-secondary hover:text-secondary/80"
                  onClick={() => setShowFOIA(true)}
                >
                  Submit FOIA Request
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Feature: Community Engagement */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <MessageCircle className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">Community Engagement</CardTitle>
                <CardDescription>
                  Connect with neighbors and participate in local discussions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build stronger communities through open dialogue and collaboration.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Transparent Analytics */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <TrendingUp className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">Transparent Analytics</CardTitle>
                <CardDescription>
                  Track civic metrics and measure community impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Data-driven insights for better governance and accountability.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Secure & Private */}
            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <IconBubble variant="secondary" size="lg">
                  <Shield className="h-6 w-6" />
                </IconBubble>
                <CardTitle className="text-2xl">Secure & Private</CardTitle>
                <CardDescription>
                  Built on Internet Computer for maximum security and privacy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data is protected by blockchain technology and cryptographic security.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Police Complaint Form */}
        {showComplaint && (
          <section ref={complaintRef} className="scroll-mt-8">
            <Card className="border-2 border-secondary/50 shadow-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconBubble variant="secondary" size="lg">
                      <AlertTriangle className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-3xl">File a Police Complaint</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowComplaint(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  Report police misconduct securely and anonymously. Your complaint will be recorded on the blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-type">Type of Complaint</Label>
                  <Input id="complaint-type" placeholder="e.g., Excessive Force, Misconduct" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-details">Details</Label>
                  <Textarea
                    id="complaint-details"
                    placeholder="Describe the incident in detail..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-location">Location</Label>
                  <Input id="complaint-location" placeholder="Where did this occur?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-date">Date & Time</Label>
                  <Input id="complaint-date" type="datetime-local" />
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold">
                  Submit Complaint
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* FOIA Request Form */}
        {showFOIA && (
          <section ref={foiaRef} className="scroll-mt-8">
            <Card className="border-2 border-secondary/50 shadow-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconBubble variant="secondary" size="lg">
                      <FileText className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-3xl">Submit a FOIA Request</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFOIA(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  Request public information from government agencies through the Freedom of Information Act.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foia-agency">Government Agency</Label>
                  <Input id="foia-agency" placeholder="Which agency are you requesting from?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foia-subject">Subject of Request</Label>
                  <Input id="foia-subject" placeholder="What information are you seeking?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foia-details">Request Details</Label>
                  <Textarea
                    id="foia-details"
                    placeholder="Provide specific details about the information you're requesting..."
                    rows={6}
                  />
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold">
                  Submit FOIA Request
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Support Section */}
        {showSupport && (
          <section ref={supportRef} className="scroll-mt-8">
            <Card className="border-2 border-secondary/50 shadow-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconBubble variant="secondary" size="lg">
                      <HelpCircle className="h-6 w-6" />
                    </IconBubble>
                    <CardTitle className="text-3xl">Get Support</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSupport(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription>
                  Need help? We're here to assist you with any questions or issues.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-name">Your Name</Label>
                  <Input id="support-name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email Address</Label>
                  <Input id="support-email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input id="support-subject" placeholder="What do you need help with?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea
                    id="support-message"
                    placeholder="Describe your question or issue..."
                    rows={6}
                  />
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Secretary Nudge */}
        {showSecretaryNudge && (
          <SecretaryDiscoverabilityNudge
            onDismiss={() => setShowSecretaryNudge(false)}
            onOpenSecretary={() => setIsSecretaryOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>© {new Date().getFullYear()} Whisper</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-1">
                Built with <Heart className="h-4 w-4 text-secondary fill-secondary" /> using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80 font-medium"
                >
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Secretary Widget Portal */}
      <SecretaryWidgetPortal open={isSecretaryOpen} onOpenChange={setIsSecretaryOpen} />
    </div>
  );
}

export default App;
