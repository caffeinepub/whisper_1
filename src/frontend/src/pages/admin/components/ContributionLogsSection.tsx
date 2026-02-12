import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Copy, ExternalLink } from 'lucide-react';
import { useAdminContributionLogs } from '@/hooks/useAdminContributionLogs';
import { getUserFacingError } from '@/utils/userFacingError';
import { IconBubble } from '@/components/common/IconBubble';
import { ALL_ACTION_TYPES } from '@/lib/contributionActionTypes';
import { uiCopy } from '@/lib/uiCopy';
import type { ContributionLogEntry } from '@/backend';

interface ContributionLogsSectionProps {
  isAdmin: boolean;
}

export function ContributionLogsSection({ isAdmin }: ContributionLogsSectionProps) {
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { data: logsData, isLoading, error } = useAdminContributionLogs(
    currentPage * pageSize,
    pageSize,
    isAdmin
  );

  // Flatten the tuple array into a flat list of log entries
  const allLogs: ContributionLogEntry[] = logsData
    ? logsData.flatMap(([principal, entries]) => entries)
    : [];

  // Apply filters
  const filteredLogs = allLogs.filter((log) => {
    if (actionTypeFilter !== 'all' && log.actionType !== actionTypeFilter) {
      return false;
    }
    if (dateFilter !== 'all') {
      const logDate = new Date(Number(log.timestamp) / 1000000);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7days' && daysDiff > 7) return false;
      if (dateFilter === '30days' && daysDiff > 30) return false;
    }
    return true;
  });

  const handleCopyReferenceId = (referenceId: string) => {
    navigator.clipboard.writeText(referenceId);
  };

  const handleNavigateToIssue = (referenceId: string) => {
    // Extract instanceName from referenceId (format: "instanceName-timestamp")
    const parts = referenceId.split('-');
    if (parts.length >= 2) {
      const instanceName = parts.slice(0, -1).join('-');
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      // Trigger navigation to issue project
      setTimeout(() => {
        const event = new CustomEvent('secretary-navigate-to-project', {
          detail: { instanceName, categoryName: null },
        });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconBubble size="md" variant="secondary">
              <FileText className="h-5 w-5" />
            </IconBubble>
            <div>
              <CardTitle>{uiCopy.contributionLogs.title}</CardTitle>
              <CardDescription>{uiCopy.contributionLogs.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconBubble size="md" variant="secondary">
              <FileText className="h-5 w-5" />
            </IconBubble>
            <div>
              <CardTitle>{uiCopy.contributionLogs.title}</CardTitle>
              <CardDescription>{uiCopy.contributionLogs.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{getUserFacingError(error)}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <FileText className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>{uiCopy.contributionLogs.title}</CardTitle>
            <CardDescription>{uiCopy.contributionLogs.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="action-type-filter">{uiCopy.contributionLogs.filterByActionType}</Label>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger id="action-type-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Action Types</SelectItem>
                {ALL_ACTION_TYPES.map((actionType) => (
                  <SelectItem key={actionType} value={actionType}>
                    {actionType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-filter">Filter by Date</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger id="date-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{uiCopy.contributionLogs.noLogs}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-sm font-medium">Contributor</th>
                  <th className="text-left py-2 px-2 text-sm font-medium">Action Type</th>
                  <th className="text-left py-2 px-2 text-sm font-medium">Points</th>
                  <th className="text-left py-2 px-2 text-sm font-medium">Reward Type</th>
                  <th className="text-left py-2 px-2 text-sm font-medium">Reference ID</th>
                  <th className="text-left py-2 px-2 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={Number(log.id)} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 text-sm font-mono">
                      {log.contributor.toString().slice(0, 8)}...
                    </td>
                    <td className="py-2 px-2 text-sm">{log.actionType}</td>
                    <td className="py-2 px-2 text-sm">{Number(log.pointsAwarded)}</td>
                    <td className="py-2 px-2 text-sm">{log.rewardType}</td>
                    <td className="py-2 px-2 text-sm">
                      {log.referenceId ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs truncate max-w-[120px]">
                            {log.referenceId}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyReferenceId(log.referenceId!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {log.actionType === 'IssueCreated' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNavigateToIssue(log.referenceId!)}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-sm">
                      {new Date(Number(log.timestamp) / 1000000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            {uiCopy.contributionLogs.previousPage}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={allLogs.length < pageSize}
          >
            {uiCopy.contributionLogs.nextPage}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
