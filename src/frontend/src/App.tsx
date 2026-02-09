import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { CreateInstancePlaceholderCard } from '@/components/create-instance/CreateInstancePlaceholderCard';

function App() {
  const [isCreateInstanceOpen, setIsCreateInstanceOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'whisper-icp'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Whisper
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Decentralized Civic Accountability Platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreateInstanceOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Instance
              </Button>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <h2 className="text-4xl font-semibold tracking-tight text-balance">
              Empowering Citizens Through Transparency
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Whisper is a community-driven platform built on the Internet Computer Protocol,
              enabling citizens to report issues, collaborate on solutions, and hold institutions
              accountable.
            </p>
          </section>

          <Separator className="my-8" />

          {/* Create Instance CTA */}
          <section className="space-y-6">
            <Card className="border-accent/50 shadow-sm bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-accent" />
                  No Whisper for Your Area?
                </CardTitle>
                <CardDescription>
                  Start a new Whisper instance for your city, county, or state and empower your
                  community to drive civic accountability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="default"
                  onClick={() => setIsCreateInstanceOpen(true)}
                >
                  Create Instance
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Create Instance Placeholder Card */}
          {isCreateInstanceOpen && (
            <CreateInstancePlaceholderCard onClose={() => setIsCreateInstanceOpen(false)} />
          )}

          <Separator className="my-8" />

          {/* Architecture Overview */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Architecture Foundation</h3>
              <p className="text-muted-foreground">
                This is the foundational phase of Whisper. The architecture documentation, system
                diagrams, and visual design system have been established. Full application features
                will be implemented in subsequent phases.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Comprehensive architecture and planning documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Architecture Overview</span>
                    <Badge variant="outline" className="badge-resolved">
                      Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phased Development Plan</span>
                    <Badge variant="outline" className="badge-resolved">
                      Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deployment Guide</span>
                    <Badge variant="outline" className="badge-resolved">
                      Complete
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Style Guide</span>
                    <Badge variant="outline" className="badge-resolved">
                      Complete
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Next Steps
                  </CardTitle>
                  <CardDescription>Upcoming development phases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phase 1: Single Installation</span>
                    <Badge variant="outline" className="badge-in-progress">
                      Planned
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phase 2: Multi-Installation</span>
                    <Badge variant="outline" className="badge-in-progress">
                      Planned
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phase 3: Collaboration Tools</span>
                    <Badge variant="outline" className="badge-in-progress">
                      Planned
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phase 4: AI Routing</span>
                    <Badge variant="outline" className="badge-in-progress">
                      Planned
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Core Principles */}
          <section className="space-y-6">
            <h3 className="text-2xl font-semibold">Core Principles</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg">Equality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Merit-based influence through verifiable contributions, not insider advantages.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Immutable logs prevent manipulation and ensure all actions are auditable.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-xs">
                <CardHeader>
                  <CardTitle className="text-lg">Accountability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Citizens, officials, and institutions held to the same standard of
                    responsibility.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Installation Hierarchy Preview */}
          <section className="space-y-6">
            <h3 className="text-2xl font-semibold">Hierarchical Installations</h3>
            <p className="text-muted-foreground">
              Whisper organizes as a hierarchy of jurisdiction-specific installations, from
              hyper-local cities to national aggregation.
            </p>
            <Card className="border-border shadow-xs bg-muted/30">
              <CardContent className="pt-6">
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <span className="text-foreground">WhisperUSA (National)</span>
                  </div>
                  <div className="ml-6 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">WhisperIowa (State)</span>
                  </div>
                  <div className="ml-12 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">WhisperScottCounty-IA (County)</span>
                  </div>
                  <div className="ml-18 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">WhisperDavenport-IA (City)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Whisper. Built on Internet Computer Protocol.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
