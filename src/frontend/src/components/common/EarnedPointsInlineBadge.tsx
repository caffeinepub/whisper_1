import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ContributionLogResult } from '@/hooks/useContributionEventLogger';

interface EarnedPointsInlineBadgeProps {
  result: ContributionLogResult | null;
  className?: string;
}

/**
 * Small reusable inline confirmation UI that renders earned points and reward type
 * from the standardized ContributionLogResult. Hides itself when isDuplicate=true
 * or pointsAwarded=0. English-only user-facing text.
 */
export function EarnedPointsInlineBadge({ result, className = '' }: EarnedPointsInlineBadgeProps) {
  // Don't show for duplicates or zero points
  if (!result || result.isDuplicate || result.pointsAwarded === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
        +{result.pointsAwarded} {result.rewardType} points earned
      </Badge>
    </div>
  );
}
