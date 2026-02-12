import { useEffect, useState } from 'react';
import { HomeHeader } from '@/components/common/HomeHeader';
import { PostComposer } from '@/components/feed/PostComposer';
import { FeedList } from '@/components/feed/FeedList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { LocationAcquisitionCard } from '@/components/location/LocationAcquisitionCard';
import { useInstanceScopeLocation } from '@/hooks/useInstanceScopeLocation';
import { generateWhisperInstanceName } from '@/lib/whisperInstanceNaming';
import { USHierarchyLevel } from '@/backend';
import { getLocationMetadata, setLocationMetadata } from '@/utils/instanceScope';

export default function FeedPage() {
  const {
    selection,
    setSelectedState,
    setSelectedCounty,
    setSelectedPlace,
    locationId,
    displayName,
  } = useInstanceScopeLocation();

  const [instanceName, setInstanceName] = useState<string>('');

  // Restore location from localStorage on mount
  useEffect(() => {
    const metadata = getLocationMetadata();
    if (metadata) {
      // We have persisted metadata but not the full objects
      // The user will need to reselect, but we can show the last instance name
      try {
        const level = metadata.placeName 
          ? USHierarchyLevel.place 
          : metadata.countyName 
          ? USHierarchyLevel.county 
          : USHierarchyLevel.state;
        
        const name = generateWhisperInstanceName(
          level,
          metadata.stateName,
          metadata.countyName,
          metadata.placeName
        );
        setInstanceName(name);
      } catch (error) {
        console.error('Error restoring instance name:', error);
      }
    }
  }, []);

  // Generate instance name when location changes
  useEffect(() => {
    if (locationId && selection.state) {
      try {
        const level = selection.place 
          ? USHierarchyLevel.place 
          : selection.county 
          ? USHierarchyLevel.county 
          : USHierarchyLevel.state;

        const name = generateWhisperInstanceName(
          level,
          selection.state.longName,
          selection.county?.shortName,
          selection.place?.shortName
        );

        setInstanceName(name);

        // Persist metadata
        setLocationMetadata({
          locationId,
          stateName: selection.state.longName,
          countyName: selection.county?.shortName,
          placeName: selection.place?.shortName,
        });
      } catch (error) {
        console.error('Error generating instance name:', error);
      }
    }
  }, [locationId, selection]);

  // Scroll to top when instance changes
  useEffect(() => {
    if (instanceName) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [instanceName]);

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

          {/* Location Acquisition */}
          <LocationAcquisitionCard
            selectedState={selection.state}
            selectedCounty={selection.county}
            selectedPlace={selection.place}
            onStateChange={setSelectedState}
            onCountyChange={setSelectedCounty}
            onPlaceChange={setSelectedPlace}
          />

          {/* Show selected location and instance name */}
          {instanceName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Location</CardTitle>
                <CardDescription>
                  Viewing posts for: <span className="font-semibold text-foreground">{displayName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Instance: <span className="font-mono text-foreground">{instanceName}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Composer - only show when location is selected */}
          {instanceName && <PostComposer instanceName={instanceName} />}

          {/* Feed - remounts when instanceName changes via key */}
          {instanceName && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <FeedList key={instanceName} instanceName={instanceName} />
            </div>
          )}

          {/* Prompt to select location if none selected */}
          {!instanceName && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Please select your location above to view and create posts
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
