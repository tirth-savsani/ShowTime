import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rect', // 'rect' | 'circle' | 'poster' | 'text'
}) => {
  const baseClasses = 'animate-pulse bg-[#E5E7EB]';

  const variantClasses = {
    rect: 'rounded-sm',
    circle: 'rounded-full',
    poster: 'rounded-md aspect-[2/3] w-full',
    text: 'rounded-xs h-4 w-full',
  }[variant] || 'rounded-sm';

  return <div className={`${baseClasses} ${variantClasses} ${className}`} />;
};

export default Skeleton;
