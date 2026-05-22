import { cn } from '@/lib/utils';

export function SectionHeader({ eyebrow, title, description, align = 'left', className }) {
  const centered = align === 'center';
  return (
    <div className={cn(centered && 'mx-auto max-w-3xl text-center', className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      ) : null}
      {title ? <h2 className={cn('mt-2 text-3xl font-bold tracking-tight sm:text-4xl', centered && 'text-balance')}>{title}</h2> : null}
      {description ? (
        <p className={cn('mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg', centered && 'text-pretty')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
