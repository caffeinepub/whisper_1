import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBubble } from '@/components/common/IconBubble';
import { Coins, Loader2 } from 'lucide-react';
import { useStakingInfo } from '@/hooks/useStakingInfo';
import { useWspBalance } from '@/hooks/useWspBalance';
import { useStake, useUnstake } from '@/hooks/useStakingMutations';
import { formatTokenAmount } from '@/lib/formatTokenAmount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';

/**
 * Staking section with stake/unstake write controls, validation, pending states, and automatic data refresh on success.
 */
export function StakingSection() {
  const { data: stakingRecord, isLoading } = useStakingInfo();
  const { data: wspBalance } = useWspBalance();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const stakeMutation = useStake();
  const unstakeMutation = useUnstake();

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeError, setStakeError] = useState('');
  const [unstakeError, setUnstakeError] = useState('');

  const isAuthenticated = !!identity;
  const isActorReady = !!actor;

  const validateStakeAmount = (value: string): { valid: boolean; error: string; amount: bigint } => {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'Amount is required', amount: 0n };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { valid: false, error: 'Please enter a valid number', amount: 0n };
    }

    if (numValue <= 0) {
      return { valid: false, error: 'Amount must be greater than zero', amount: 0n };
    }

    const amount = BigInt(Math.floor(numValue));
    
    // Check if user has enough balance
    if (wspBalance && amount > wspBalance) {
      return { valid: false, error: 'Insufficient balance', amount };
    }

    return { valid: true, error: '', amount };
  };

  const validateUnstakeAmount = (value: string): { valid: boolean; error: string; amount: bigint } => {
    if (!value || value.trim() === '') {
      return { valid: false, error: 'Amount is required', amount: 0n };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { valid: false, error: 'Please enter a valid number', amount: 0n };
    }

    if (numValue <= 0) {
      return { valid: false, error: 'Amount must be greater than zero', amount: 0n };
    }

    const amount = BigInt(Math.floor(numValue));
    
    // Check if user has enough staked
    if (stakingRecord && amount > stakingRecord.lockedBalance) {
      return { valid: false, error: 'Insufficient staked balance', amount };
    }

    return { valid: true, error: '', amount };
  };

  const handleStake = async () => {
    setStakeError('');
    const validation = validateStakeAmount(stakeAmount);

    if (!validation.valid) {
      setStakeError(validation.error);
      return;
    }

    try {
      await stakeMutation.mutateAsync(validation.amount);
      toast.success(`Successfully staked ${stakeAmount} WSP`);
      setStakeAmount('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to stake tokens';
      setStakeError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUnstake = async () => {
    setUnstakeError('');
    const validation = validateUnstakeAmount(unstakeAmount);

    if (!validation.valid) {
      setUnstakeError(validation.error);
      return;
    }

    try {
      await unstakeMutation.mutateAsync(validation.amount);
      toast.success(`Successfully unstaked ${unstakeAmount} WSP`);
      setUnstakeAmount('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unstake tokens';
      setUnstakeError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isStakePending = stakeMutation.isPending;
  const isUnstakePending = unstakeMutation.isPending;
  const isDisabled = !isAuthenticated || !isActorReady || isLoading;

  return (
    <Card id="staking-section">
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <Coins className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>Staking</CardTitle>
            <CardDescription>Stake your WSP tokens to earn rewards</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : stakingRecord ? (
          <>
            {/* Staking Info Display */}
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

            {/* Stake Controls */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Stake Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => {
                      setStakeAmount(e.target.value);
                      setStakeError('');
                    }}
                    disabled={isDisabled || isStakePending}
                  />
                  <Button
                    onClick={handleStake}
                    disabled={isDisabled || isStakePending || !stakeAmount}
                  >
                    {isStakePending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Staking...
                      </>
                    ) : (
                      'Stake'
                    )}
                  </Button>
                </div>
                {stakeError && <p className="text-sm text-destructive">{stakeError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unstake-amount">Unstake Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="unstake-amount"
                    type="number"
                    placeholder="Enter amount to unstake"
                    value={unstakeAmount}
                    onChange={(e) => {
                      setUnstakeAmount(e.target.value);
                      setUnstakeError('');
                    }}
                    disabled={isDisabled || isUnstakePending}
                  />
                  <Button
                    onClick={handleUnstake}
                    disabled={isDisabled || isUnstakePending || !unstakeAmount}
                    variant="outline"
                  >
                    {isUnstakePending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Unstaking...
                      </>
                    ) : (
                      'Unstake'
                    )}
                  </Button>
                </div>
                {unstakeError && <p className="text-sm text-destructive">{unstakeError}</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No staking record found. Stake tokens to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
