import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "shimmer bg-white/5";
  const variants = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
};

export const CardSkeleton = () => (
  <div className="glass-panel p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="rect" className="h-24 w-full" />
  </div>
);
