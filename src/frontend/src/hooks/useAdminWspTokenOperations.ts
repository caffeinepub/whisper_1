import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import { getUserFacingError } from '@/utils/userFacingError';

/**
 * React Query mutation hook for admin-only WSP token minting.
 * Validates inputs, surfaces backend errors, and invalidates relevant queries.
 */
export function useAdminMintWSP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, amount }: { recipient: string; amount: string }) => {
      if (!actor) throw new Error('Actor not available');

      // Validate recipient principal
      let recipientPrincipal: Principal;
      try {
        recipientPrincipal = Principal.fromText(recipient);
      } catch (error) {
        throw new Error('Invalid principal format');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount: must be a positive number');
      }

      const amountBigInt = BigInt(Math.floor(amountNum));
      await actor.adminMintWSP(recipientPrincipal, amountBigInt);

      return { recipient: recipientPrincipal, amount: amountBigInt };
    },
    onSuccess: (data) => {
      // Invalidate WSP balance for the recipient
      queryClient.invalidateQueries({ queryKey: ['wspBalance', data.recipient.toString()] });
      // Invalidate current user profile in case recipient is current user
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      console.error('Mint WSP error:', error);
    },
  });
}

/**
 * React Query mutation hook for admin-only WSP token burning.
 * Validates inputs, surfaces backend errors, and invalidates relevant queries.
 */
export function useAdminBurnWSP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ account, amount }: { account: string; amount: string }) => {
      if (!actor) throw new Error('Actor not available');

      // Validate account principal
      let accountPrincipal: Principal;
      try {
        accountPrincipal = Principal.fromText(account);
      } catch (error) {
        throw new Error('Invalid principal format');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount: must be a positive number');
      }

      const amountBigInt = BigInt(Math.floor(amountNum));
      const result = await actor.adminBurnWSP(accountPrincipal, amountBigInt);

      if (result.__kind__ === 'err') {
        throw new Error(getUserFacingError(result.err));
      }

      return { account: accountPrincipal, amount: amountBigInt };
    },
    onSuccess: (data) => {
      // Invalidate WSP balance for the account
      queryClient.invalidateQueries({ queryKey: ['wspBalance', data.account.toString()] });
      // Invalidate current user profile in case account is current user
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      console.error('Burn WSP error:', error);
    },
  });
}
