import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Award, AlertCircle, Search } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAdminContributionLogs } from '@/hooks/useAdminContributionLogs';
import { useAdminUserContributionLogs } from '@/hooks/useAdminUserContributionLogs';
import { uiCopy } from '@/lib/uiCopy';
import { userFacingError } from '@/utils/userFacingError';

/**
 * Admin-only UI section displaying contribution logs with two modes:
 * (1) paginated global logs (offset/limit + refresh)
 * (2) user-scoped query by principal text input (with loading/error/empty states)
 */
export function ContributionLogsSection() {
  const [offset, setOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'global' | 'user'>('global');
  const [userPrincipalInput, setUserPrincipalInput] = useState('');
  const [searchPrincipal, setSearchPrincipal] = useState<string | null>(null);
  const limit = 20;
  
  const { data: globalLogs, isLoading: globalLoading, isError: globalError, error: globalErrorObj, refetch: refetchGlobal } = useAdminContributionLogs(offset, limit);
  const { data: userLogs, isLoading: userLoading, isError: userError, error: userErrorObj, refetch: refetchUser } = useAdminUserContributionLogs(searchPrincipal, 100);

  const handleRefresh = () => {
    if (viewMode === 'global') {
      refetchGlobal();
    } else {
      refetchUser();
    }
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handleLoadPrevious = () => {
    setOffset(prev => Math.max(0, prev - limit));
  };

  const handleSearchUser = () => {
    if (userPrincipalInput.trim()) {
      setSearchPrincipal(userPrincipalInput.trim());
      setViewMode('user');
    }
  };

  const handleBackToGlobal = () => {
    setViewMode('global');
    setSearchPrincipal(null);
    setUserPrincipalInput('');
  };

  const isLoading = viewMode === 'global' ? globalLoading : userLoading;
  const isError = viewMode === 'global' ? globalError : userError;
  const error = viewMode === 'global' ? globalErrorObj : userErrorObj;

  if (isLoading) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                {uiCopy.admin.contributionLogsTitle}
              </CardTitle>
              <CardDescription className="text-white/70">
                {uiCopy.admin.contributionLogsDescription}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingIndicator label={viewMode === 'global' ? 'Loading contribution logs...' : 'Loading user contribution logs...'} />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                {uiCopy.admin.contributionLogsTitle}
              </CardTitle>
              <CardDescription className="text-white/70">
                {uiCopy.admin.contributionLogsDescription}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-secondary text-secondary hover:bg-secondary/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {uiCopy.admin.contributionLogsRefresh}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-white/70 mb-4">{userFacingError(error)}</p>
            <div className="flex gap-2">
              {viewMode === 'user' && (
                <Button
                  variant="outline"
                  onClick={handleBackToGlobal}
                  className="border-secondary text-secondary hover:bg-secondary/20"
                >
                  Back to Global Logs
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-secondary text-secondary hover:bg-secondary/20"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasLogs = viewMode === 'global' 
    ? globalLogs && globalLogs.length > 0
    : userLogs && userLogs.length > 0;

  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              {uiCopy.admin.contributionLogsTitle}
            </CardTitle>
            <CardDescription className="text-white/70">
              {uiCopy.admin.contributionLogsDescription}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-secondary text-secondary hover:bg-secondary/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {uiCopy.admin.contributionLogsRefresh}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Search Section */}
        <div className="space-y-2">
          <Label className="text-white text-sm">{uiCopy.admin.userSearchLabel}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={userPrincipalInput}
              onChange={(e) => setUserPrincipalInput(e.target.value)}
              placeholder={uiCopy.admin.userSearchPlaceholder}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-secondary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchUser();
                }
              }}
            />
            <Button
              variant="outline"
              onClick={handleSearchUser}
              disabled={!userPrincipalInput.trim()}
              className="border-secondary text-secondary hover:bg-secondary/20 shrink-0"
            >
              <Search className="h-4 w-4 mr-2" />
              {uiCopy.admin.userSearchButton}
            </Button>
          </div>
          {viewMode === 'user' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToGlobal}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Global Logs
            </Button>
          )}
        </div>

        {/* Logs Display */}
        {!hasLogs ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/70">
              {viewMode === 'user' ? uiCopy.admin.userLogsEmpty : uiCopy.admin.contributionLogsEmpty}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-md border border-white/10 p-4">
              <div className="space-y-4">
                {viewMode === 'global' && globalLogs ? (
                  globalLogs.map(([principal, entries]) => (
                    <div key={principal.toString()} className="space-y-2">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <p className="text-sm font-mono text-secondary truncate">
                          {principal.toString().slice(0, 20)}...
                        </p>
                        <span className="text-xs text-white/50">
                          ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                        </span>
                      </div>
                      {entries.map((entry) => (
                        <div
                          key={Number(entry.id)}
                          className="p-3 bg-white/5 rounded border border-white/10 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-secondary">
                              {entry.actionType}
                            </span>
                            <span className="text-xs text-white/60">
                              {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white/70">
                              Points: <span className="font-semibold text-white">{Number(entry.pointsAwarded)}</span>
                            </span>
                            <span className="text-white/70">
                              Type: <span className="font-semibold text-white">{entry.rewardType}</span>
                            </span>
                          </div>
                          {entry.referenceId && (
                            <p className="text-xs text-white/50">
                              Ref: {entry.referenceId}
                            </p>
                          )}
                          {entry.details && (
                            <p className="text-xs text-white/60 italic">
                              {entry.details}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                ) : viewMode === 'user' && userLogs ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <p className="text-sm font-mono text-secondary break-all">
                        {searchPrincipal}
                      </p>
                      <span className="text-xs text-white/50 shrink-0">
                        ({userLogs.length} {userLogs.length === 1 ? 'entry' : 'entries'})
                      </span>
                    </div>
                    {userLogs.map((entry) => (
                      <div
                        key={Number(entry.id)}
                        className="p-3 bg-white/5 rounded border border-white/10 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-secondary">
                            {entry.actionType}
                          </span>
                          <span className="text-xs text-white/60">
                            {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white/70">
                            Points: <span className="font-semibold text-white">{Number(entry.pointsAwarded)}</span>
                          </span>
                          <span className="text-white/70">
                            Type: <span className="font-semibold text-white">{entry.rewardType}</span>
                          </span>
                        </div>
                        {entry.referenceId && (
                          <p className="text-xs text-white/50">
                            Ref: {entry.referenceId}
                          </p>
                        )}
                        {entry.details && (
                          <p className="text-xs text-white/60 italic">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </ScrollArea>
            
            {viewMode === 'global' && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadPrevious}
                  disabled={offset === 0}
                  className="border-secondary text-secondary hover:bg-secondary/20 disabled:opacity-50"
                >
                  Previous
                </Button>
                <span className="text-sm text-white/60">
                  Showing {offset + 1} - {offset + (globalLogs?.length || 0)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={!globalLogs || globalLogs.length < limit}
                  className="border-secondary text-secondary hover:bg-secondary/20 disabled:opacity-50"
                >
                  {uiCopy.admin.contributionLogsLoadMore}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
