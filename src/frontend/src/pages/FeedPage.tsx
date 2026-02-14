import { useState } from 'react';
import { HomeHeader } from '@/components/common/HomeHeader';
import { BackNav } from '@/components/common/BackNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedList } from '@/components/feed/FeedList';
import { PostDetailDialog } from '@/components/feed/PostDetailDialog';
import { FlagPostDialog } from '@/components/feed/FlagPostDialog';
import { LocationSelector } from '@/components/location/LocationSelector';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import { useInstanceFeed } from '@/hooks/useInstanceFeed';

export default function FeedPage() {
  const [selectedPostId, setSelectedPostId] = useState<bigint | null>(null);
  const [flagPostId, setFlagPostId] = useState<bigint | null>(null);

  const {
    selection,
    setSelectedState,
    setSelectedCounty,
    setSelectedPlace,
    locationId,
  } = useLocationSelection();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInstanceFeed(locationId || '');

  const posts = data?.pages.flatMap((page) => page) || [];

  const handleViewDetails = (postId: bigint) => {
    setSelectedPostId(postId);
  };

  const handleFlag = (postId: bigint) => {
    setFlagPostId(postId);
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <BackNav to="/" />
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feed</CardTitle>
              <CardDescription>View and share posts from your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Select Location</h3>
                <LocationSelector
                  selectedState={selection.state}
                  selectedCounty={selection.county}
                  selectedPlace={selection.place}
                  onStateChange={setSelectedState}
                  onCountyChange={setSelectedCounty}
                  onPlaceChange={setSelectedPlace}
                />
              </div>

              {locationId && (
                <PostComposer
                  key={locationId}
                  instanceName={locationId}
                />
              )}
            </CardContent>
          </Card>

          {locationId && (
            <FeedList
              posts={posts}
              hasNextPage={hasNextPage || false}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              instanceName={locationId}
              onViewDetails={handleViewDetails}
              onFlag={handleFlag}
            />
          )}
        </div>
      </div>

      {selectedPostId !== null && (
        <PostDetailDialog
          postId={selectedPostId}
          open={selectedPostId !== null}
          onOpenChange={(open) => !open && setSelectedPostId(null)}
        />
      )}

      {flagPostId !== null && (
        <FlagPostDialog
          postId={flagPostId}
          open={flagPostId !== null}
          onOpenChange={(open) => !open && setFlagPostId(null)}
        />
      )}
    </div>
  );
}
