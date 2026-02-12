import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Award, AlertCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useAdminContributionLogs } from '@/hooks/useAdminContributionLogs';
import { uiCopy } from '@/lib/uiCopy';
import { userFacingError } from '@/utils/userFacingError';
import { CONTRIBUTION_ACTION_TYPES } from '@/lib/contributionActionTypes';
import type { ContributionLogEntry } from '@/backend';

interface ContributionLogsSectionProps {
  isAdmin: boolean;
}

interface FlattenedLogEntry extends ContributionLogEntry {
  contributorPrincipal: string;
}

/**
 * Admin-only UI section displaying contribution logs with filters, pagination, and linking.
 * Shows a flat list of all contribution entries with action type and date filters.
 */
export function ContributionLogsSection({ isAdmin }: ContributionLogsSectionProps) {
  const [offset, setOffset] = useState(0);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  
  const limit = 20;
  
  const { data: globalLogs, isLoading, isError, error, refetch } = useAdminContributionLogs(offset, limit, isAdmin);

  // Flatten all entries into a single list
  const allEntries = useMemo(() => {
    if (!globalLogs) return [];
    const entries: FlattenedLogEntry[] = [];
    for (const [principal, logEntries] of globalLogs) {
      for (const entry of logEntries) {
        entries.push({
          ...entry,
          contributorPrincipal: principal.toString(),
        });
      }
    }
    // Sort by timestamp descending (newest first)
    return entries.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [globalLogs]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    let filtered = allEntries;

    // Action type filter
    if (actionTypeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.actionType === actionTypeFilter);
    }

    // Date filters
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter).getTime() * 1000000; // Convert to nanoseconds
      filtered = filtered.filter(entry => Number(entry.timestamp) >= fromDate);
    }
    if (dateToFilter) {
      const toDate = new Date(dateToFilter).getTime() * 1000000 + (86400000000000 - 1); // End of day in nanoseconds
      filtered = filtered.filter(entry => Number(entry.timestamp) <= toDate);
    }

    return filtered;
  }, [allEntries, actionTypeFilter, dateFromFilter, dateToFilter]);

  const handleRefresh = () => {
    refetch();
  };

  const handleNextPage = () => {
    setOffset(prev => prev + limit);
  };

  const handlePreviousPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
  };

  const handleClearFilters = () => {
    setActionTypeFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const hasActiveFilters = actionTypeFilter !== 'all' || dateFromFilter || dateToFilter;

  // Navigate to related entity
  const handleNavigateToReference = (entry: FlattenedLogEntry) => {
    if (!entry.referenceId) return;

    // Map action types to navigation targets
    if (entry.actionType === CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED) {
      // Navigate to proposal detail
      const event = new CustomEvent('secretary-navigate-to-project', {
        detail: { proposalId: entry.referenceId, categories: [] }
      });
      window.dispatchEvent(event);
      
      // Also update URL
      const basePath = import.meta.env.BASE_URL || '/';
      const normalizedBase = basePath.endsWith('/') && basePath !== '/' ? basePath.slice(0, -1) : basePath;
      const newPath = normalizedBase === '/' ? '/proposals' : `${normalizedBase}/proposals`;
      window.history.pushState({}, '', newPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    // For other action types, we could add more navigation logic here
  };

  const canNavigate = (entry: FlattenedLogEntry): boolean => {
    return !!entry.referenceId && entry.actionType === CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED;
  };

  if (isLoading) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
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
          <LoadingIndicator label={uiCopy.admin.contributionLogsLoading} />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
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
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-secondary text-secondary hover:bg-secondary/20"
            >
              {uiCopy.admin.contributionLogsTryAgain}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[oklch(0.20_0.05_230)] border-accent/50 text-white">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
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
            disabled={isLoading}
            className="border-secondary text-secondary hover:bg-secondary/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {uiCopy.admin.contributionLogsRefresh}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Section */}
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm font-semibold">{uiCopy.admin.filtersLabel}</Label>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-white/70 hover:text-white hover:bg-white/10 h-auto py-1 px-2"
              >
                {uiCopy.admin.clearFilters}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action Type Filter */}
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">{uiCopy.admin.actionTypeLabel}</Label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={uiCopy.admin.actionTypePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{uiCopy.admin.allActionTypes}</SelectItem>
                  <SelectItem value={CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED}>
                    {CONTRIBUTION_ACTION_TYPES.ISSUE_CREATED}
                  </SelectItem>
                  <SelectItem value={CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED}>
                    {CONTRIBUTION_ACTION_TYPES.COMMENT_CREATED}
                  </SelectItem>
                  <SelectItem value={CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED}>
                    {CONTRIBUTION_ACTION_TYPES.EVIDENCE_ADDED}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">{uiCopy.admin.dateFromLabel}</Label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="bg-white/10 border-white/20 text-white [color-scheme:dark]"
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <Label className="text-white/80 text-xs">{uiCopy.admin.dateToLabel}</Label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="bg-white/10 border-white/20 text-white [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Logs Display */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/70">
              {hasActiveFilters ? uiCopy.admin.noMatchingLogs : uiCopy.admin.contributionLogsEmpty}
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px] w-full rounded-md border border-white/10 p-4">
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div
                    key={`${entry.contributorPrincipal}-${Number(entry.id)}`}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2 hover:bg-white/10 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-semibold text-secondary px-2 py-1 bg-secondary/20 rounded">
                          {entry.actionType}
                        </span>
                        <span className="text-xs text-white/50 shrink-0">
                          {Number(entry.pointsAwarded)} pts
                        </span>
                      </div>
                      <span className="text-xs text-white/60 shrink-0">
                        {new Date(Number(entry.timestamp) / 1000000).toLocaleString()}
                      </span>
                    </div>

                    {/* User Principal */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">{uiCopy.admin.userLabel}:</span>
                      <span className="text-xs font-mono text-white/80 truncate" title={entry.contributorPrincipal}>
                        {entry.contributorPrincipal.slice(0, 20)}...{entry.contributorPrincipal.slice(-8)}
                      </span>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <span className="text-white/70">
                        {uiCopy.admin.rewardTypeLabel}: <span className="font-semibold text-white">{entry.rewardType}</span>
                      </span>
                    </div>

                    {/* Reference Link */}
                    {entry.referenceId && (
                      <div className="flex items-center gap-2 pt-1">
                        {canNavigate(entry) ? (
                          <button
                            onClick={() => handleNavigateToReference(entry)}
                            className="text-xs text-secondary hover:text-secondary/80 flex items-center gap-1 underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {uiCopy.admin.viewRelatedItem}
                          </button>
                        ) : (
                          <span className="text-xs text-white/50">
                            {uiCopy.admin.referenceLabel}: {entry.referenceId}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Details */}
                    {entry.details && (
                      <p className="text-xs text-white/60 italic pt-1">
                        {entry.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
              <div className="text-sm text-white/70">
                {uiCopy.admin.showingEntries
                  .replace('{start}', String(offset + 1))
                  .replace('{end}', String(Math.min(offset + limit, offset + allEntries.length)))
                  .replace('{total}', String(allEntries.length))}
                {hasActiveFilters && ` (${filteredEntries.length} ${uiCopy.admin.filtered})`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={offset === 0}
                  className="border-secondary text-secondary hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {uiCopy.admin.previousPage}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={allEntries.length < limit}
                  className="border-secondary text-secondary hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uiCopy.admin.nextPage}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
