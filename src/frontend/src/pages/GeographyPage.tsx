import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uiCopy } from '@/lib/uiCopy';

export default function GeographyPage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav to="/" />
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{uiCopy.geography.pageTitle}</CardTitle>
              <CardDescription>{uiCopy.geography.pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Geography features coming soon. This page will display hierarchical U.S. geography data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
