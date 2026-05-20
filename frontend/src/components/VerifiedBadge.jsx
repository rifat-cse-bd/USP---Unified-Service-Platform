import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function VerifiedBadge({ className, size = 'sm' }) {
  return (
    <Badge variant="success" className={cn('gap-1', className)}>
      <BadgeCheck className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      Verified
    </Badge>
  );
}
