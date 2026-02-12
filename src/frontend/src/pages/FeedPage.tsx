import { useState } from 'react';
import { HomeHeader } from '@/components/common/HomeHeader';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedList } from '@/components/feed/FeedList';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function FeedPage() {
  const [instanceName, setInstanceName] = useState('WHISPER-General');

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-secondary" />
              Community Feed
            </h1>
            <p className="text-muted-foreground">
              Share updates and connect with your community
            </p>
          </div>

          {/* Instance Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Instance</CardTitle>
              <CardDescription>
                Choose which community feed you want to view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="instance">Instance Name</Label>
                <Input
                  id="instance"
                  placeholder="e.g., WHISPER-California"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Post Composer */}
          <PostComposer />

          {/* Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            <FeedList instanceName={instanceName} />
          </div>
        </div>
      </main>
    </div>
  );
}
