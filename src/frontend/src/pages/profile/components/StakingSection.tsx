import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconBubble } from '@/components/common/IconBubble';
import { Coins } from 'lucide-react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useState } from 'react';

/**
 * Frontend-only staking UI section with client-side validation and localStorage persistence.
 * Does not modify backend UserProfile; values are stored locally only.
 */
export function StakingSection() {
  const [stakeAmount, setStakeAmount] = useLocalStorageState<string>('whisper_stake_amount', '');
  const [lockTerm, setLockTerm] = useLocalStorageState<string>('whisper_lock_term', '30');
  const [amountError, setAmountError] = useState<string>('');

  const handleAmountChange = (value: string) => {
    setStakeAmount(value);

    // Client-side validation
    if (value === '') {
      setAmountError('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setAmountError('Please enter a valid number');
    } else if (numValue < 0) {
      setAmountError('Amount cannot be negative');
    } else if (numValue === 0) {
      setAmountError('Amount must be greater than zero');
    } else {
      setAmountError('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <IconBubble size="md" variant="secondary">
            <Coins className="h-5 w-5" />
          </IconBubble>
          <div>
            <CardTitle>Staking</CardTitle>
            <CardDescription>Configure your staking preferences (frontend only)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stake-amount">Amount to Stake</Label>
          <Input
            id="stake-amount"
            type="number"
            min="0"
            step="1"
            value={stakeAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
          />
          {amountError && (
            <p className="text-sm text-destructive">{amountError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lock-term">Lock Term (Days)</Label>
          <Select value={lockTerm} onValueChange={setLockTerm}>
            <SelectTrigger id="lock-term">
              <SelectValue placeholder="Select lock term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Note: Staking functionality is coming soon. These settings are stored locally and do not affect your actual token balance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
