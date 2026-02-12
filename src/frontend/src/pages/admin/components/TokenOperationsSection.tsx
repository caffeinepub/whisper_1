import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconBubble } from '@/components/common/IconBubble';
import { Coins, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminMintWSP, useAdminBurnWSP } from '@/hooks/useAdminWspTokenOperations';
import { getUserFacingError } from '@/utils/userFacingError';
import { Principal } from '@icp-sdk/core/principal';

/**
 * Admin-only UI section for testing WSP token operations (mint/burn).
 * Shows success/failure feedback and validates inputs before submission.
 */
export function TokenOperationsSection() {
  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const mintMutation = useAdminMintWSP();
  const burnMutation = useAdminBurnWSP();

  const isPending = mintMutation.isPending || burnMutation.isPending;

  const validateInputs = (): string | null => {
    if (!targetPrincipal.trim()) {
      return 'Please enter a target principal';
    }

    try {
      Principal.fromText(targetPrincipal.trim());
    } catch (error) {
      return 'Invalid principal format';
    }

    if (!amount.trim()) {
      return 'Please enter an amount';
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Amount must be a positive number';
    }

    return null;
  };

  const handleMint = async () => {
    setFeedback(null);
    const validationError = validateInputs();
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    try {
      await mintMutation.mutateAsync({
        recipient: targetPrincipal.trim(),
        amount: amount.trim(),
      });
      setFeedback({ type: 'success', message: `Successfully minted ${amount} WSP tokens` });
      setAmount('');
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      setFeedback({ type: 'error', message: errorMessage });
    }
  };

  const handleBurn = async () => {
    setFeedback(null);
    const validationError = validateInputs();
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    try {
      await burnMutation.mutateAsync({
        account: targetPrincipal.trim(),
        amount: amount.trim(),
      });
      setFeedback({ type: 'success', message: `Successfully burned ${amount} WSP tokens` });
      setAmount('');
    } catch (error: any) {
      const errorMessage = getUserFacingError(error);
      setFeedback({ type: 'error', message: errorMessage });
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
            <CardTitle>Token Operations (Test Mode)</CardTitle>
            <CardDescription>Mint or burn WSP tokens for testing purposes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-principal">Target Principal</Label>
          <Input
            id="target-principal"
            value={targetPrincipal}
            onChange={(e) => setTargetPrincipal(e.target.value)}
            placeholder="Enter principal ID"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-amount">Amount</Label>
          <Input
            id="token-amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={isPending}
          />
        </div>

        {feedback && (
          <div
            className={`rounded-lg p-3 ${
              feedback.type === 'success'
                ? 'bg-success/10 border border-success/30'
                : 'bg-destructive/10 border border-destructive/30'
            }`}
          >
            <div className="flex items-start gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  feedback.type === 'success' ? 'text-success' : 'text-destructive'
                }`}
              >
                {feedback.message}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleMint} disabled={isPending} className="flex-1">
            {mintMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              'Mint WSP'
            )}
          </Button>
          <Button onClick={handleBurn} disabled={isPending} variant="destructive" className="flex-1">
            {burnMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Burning...
              </>
            ) : (
              'Burn WSP'
            )}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Warning: These operations directly modify token balances. Use with caution in test mode only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
