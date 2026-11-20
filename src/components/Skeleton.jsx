import React from 'react';

const Skeleton = ({ className = '', rounded = 'rounded-lg', ...props }) => {
  return (
    <div
      className={`bg-bg-surface animate-pulse-subtle ${rounded} ${className}`}
      {...props}
    />
  );
};

export const MovieCardSkeleton = () => (
  <div className="flex-shrink-0 w-44 sm:w-56 space-y-2">
    <Skeleton className="w-full aspect-[2/3] rounded-lg" />
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-3 w-1/2 rounded" />
  </div>
);

export const HeroBannerSkeleton = () => (
  <div className="relative w-full h-[65vh] min-h-[420px] bg-bg-surface animate-pulse-subtle flex items-end p-6 sm:p-12">
    <div className="space-y-4 max-w-xl w-full">
      <Skeleton className="h-10 w-2/3 rounded-lg" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-11 w-32 rounded-lg" />
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
    </div>
  </div>
);

export default Skeleton;
