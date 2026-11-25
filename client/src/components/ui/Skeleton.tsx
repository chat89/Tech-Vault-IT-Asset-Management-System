import clsx from 'clsx';

interface SkeletonProps { className?: string; }
export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={clsx('animate-pulse rounded-lg bg-slate-800/60', className)} />
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/50">
    <Skeleton className="w-8 h-8 rounded-full" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-2xl bg-slate-800/40 p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);

