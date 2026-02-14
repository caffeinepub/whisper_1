import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Loader2, Sparkles } from 'lucide-react';
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
 * Staking section with modern glass card styling, teal/cyan gradient accents, improved empty state with motivational messaging, enhanced input/button styling with focus states, and all original staking/unstaking logic preserved.
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
    
    if (wspBalance && amount > wspBalance) {
      return { valid: false, error: 'Insufficient balance', amount: 0n };
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
    
    if (stakingRecord && amount > stakingRecord.lockedBalance) {
      return { valid: false, error: 'Insufficient staked balance', amount: 0n };
    }

    return { valid: true, error: '', amount };
  };

  const handleStake = async () => {
    if (!isAuthenticated || !isActorReady) {
      toast.error('Please log in to stake tokens');
      return;
    }

    const validation = validateStakeAmount(stakeAmount);
    if (!validation.valid) {
      setStakeError(validation.error);
      return;
    }

    setStakeError('');

    stakeMutation.mutate(validation.amount, {
      onSuccess: () => {
        toast.success('Tokens staked successfully');
        setStakeAmount('');
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to stake tokens';
        toast.error(errorMessage);
        setStakeError(errorMessage);
      },
    });
  };

  const handleUnstake = async () => {
    if (!isAuthenticated || !isActorReady) {
      toast.error('Please log in to unstake tokens');
      return;
    }

    const validation = validateUnstakeAmount(unstakeAmount);
    if (!validation.valid) {
      setUnstakeError(validation.error);
      return;
    }

    setUnstakeError('');

    unstakeMutation.mutate(validation.amount, {
      onSuccess: () => {
        toast.success('Tokens unstaked successfully');
        setUnstakeAmount('');
      },
      onError: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to unstake tokens';
        toast.error(errorMessage);
        setUnstakeError(errorMessage);
      },
    });
  };

  return (
    <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm shadow-2xl">
      <CardHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-cyan-500/30 shadow-lg">
            <Link className="h-7 w-7 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Staking</CardTitle>
            <CardDescription className="text-base text-gray-300">Stake your tokens to participate in governance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        ) : !stakingRecord || stakingRecord.totalStaked === BigInt(0) ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-cyan-500/30 shadow-lg">
                <Link className="h-12 w-12 text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-2">No tokens staked yet</p>
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Stake tokens to get started and earn rewards!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Total Staked</div>
              <div className="text-2xl font-bold text-white">{formatTokenAmount(stakingRecord.totalStaked)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Available</div>
              <div className="text-2xl font-bold text-white">{formatTokenAmount(stakingRecord.availableBalance)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Locked</div>
              <div className="text-2xl font-bold text-white">{formatTokenAmount(stakingRecord.lockedBalance)}</div>
            </div>
          </div>
        )}

        {/* Stake Form */}
        <div className="space-y-4 p-6 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="stake-amount" className="text-base font-bold text-white">Stake Tokens</Label>
            <Input
              id="stake-amount"
              type="number"
              value={stakeAmount}
              onChange={(e) => {
                setStakeAmount(e.target.value);
                setStakeError('');
              }}
              placeholder="Enter amount to stake"
              disabled={stakeMutation.isPending || !isAuthenticated}
              className="min-h-12 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
            {stakeError && <p className="text-sm text-red-400">{stakeError}</p>}
          </div>
          <Button
            onClick={handleStake}
            disabled={!stakeAmount || stakeMutation.isPending || !isAuthenticated}
            className="w-full min-h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-base shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {stakeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Staking...
              </>
            ) : (
              'Stake Tokens'
            )}
          </Button>
        </div>

        {/* Unstake Form */}
        <div className="space-y-4 p-6 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="space-y-2">
            <Label htmlFor="unstake-amount" className="text-base font-bold text-white">Unstake Tokens</Label>
            <Input
              id="unstake-amount"
              type="number"
              value={unstakeAmount}
              onChange={(e) => {
                setUnstakeAmount(e.target.value);
                setUnstakeError('');
              }}
              placeholder="Enter amount to unstake"
              disabled={unstakeMutation.isPending || !isAuthenticated}
              className="min-h-12 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
            {unstakeError && <p className="text-sm text-red-400">{unstakeError}</p>}
          </div>
          <Button
            onClick={handleUnstake}
            disabled={!unstakeAmount || unstakeMutation.isPending || !isAuthenticated}
            variant="outline"
            className="w-full min-h-12 border-gray-600 hover:bg-gray-700 text-gray-200 hover:text-white font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {unstakeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Unstaking...
              </>
            ) : (
              'Unstake Tokens'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
