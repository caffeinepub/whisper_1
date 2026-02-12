/**
 * Formats a BigInt token amount for display with configurable decimals.
 * @param amount - Token amount as BigInt
 * @param decimals - Number of decimal places (default: 0 for WSP)
 * @returns Formatted string suitable for UI display
 */
export function formatTokenAmount(amount: bigint, decimals: number = 0): string {
  if (decimals === 0) {
    return amount.toString();
  }

  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalStr}`;
}
