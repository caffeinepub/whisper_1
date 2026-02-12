import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBubble } from '@/components/common/IconBubble';
import { Coins, Loader2 } from 'lucide-react';
import { useStakingInfo } from '@/hooks/useStakingInfo';
import { formatTokenAmount } from '@/lib/formatTokenAmount';

/**
 * Read-only staking section displaying backend StakingRecord data (total staked, available balance, locked balance, pending rewards) with loading states and empty state handling.
 */
export function StakingSection() {
  const { data: stakingRecord, isLoading } = useStakingInfo();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <Coins className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>Staking</CardTitle>
            <CardDescription>View your staking information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stakingRecord ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Total Staked</span>
              <span className="text-sm font-semibold">{formatTokenAmount(stakingRecord.totalStaked)} WSP</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
              <span className="text-sm font-semibold">{formatTokenAmount(stakingRecord.availableBalance)} WSP</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Locked Balance</span>
              <span className="text-sm font-semibold">{formatTokenAmount(stakingRecord.lockedBalance)} WSP</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground">Pending Rewards</span>
              <span className="text-sm font-semibold text-accent">{formatTokenAmount(stakingRecord.pendingRewards)} WSP</span>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              No staking record is available. Start staking to see your information here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
