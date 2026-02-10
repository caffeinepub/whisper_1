import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, ArrowLeft } from 'lucide-react';
import { IconBubble } from '@/components/common/IconBubble';
import { uiCopy } from '@/lib/uiCopy';

export default function GeographyPage() {
  const handleBackToHome = () => {
    const basePath = import.meta.env.BASE_URL || '/';
    const homePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    window.history.pushState({}, '', homePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBubble variant="secondary" size="md">
              <Map className="h-5 w-5" />
            </IconBubble>
            <h1 className="text-xl font-bold text-white">{uiCopy.geography.pageTitle}</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="border-secondary text-secondary hover:bg-secondary hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {uiCopy.geography.backButton}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <Card className="bg-[oklch(0.20_0.05_230)] border-secondary/50 shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{uiCopy.geography.pageTitle}</CardTitle>
            <CardDescription className="text-white/70">
              {uiCopy.geography.pageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="rounded-full bg-white/5 p-6 inline-block mb-4">
                <Map className="h-12 w-12 text-white/40" />
              </div>
              <p className="text-white/60">Geography features coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
