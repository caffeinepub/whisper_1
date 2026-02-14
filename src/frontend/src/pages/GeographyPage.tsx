import { PageLayout } from '@/components/common/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uiCopy } from '@/lib/uiCopy';

export default function GeographyPage() {
  return (
    <PageLayout showBack backTo="/">
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
    </PageLayout>
  );
}
