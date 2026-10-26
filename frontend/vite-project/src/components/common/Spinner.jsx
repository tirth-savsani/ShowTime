import React from 'react';

export const Spinner = ({ size = 'md', className = '', color = 'current' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  }[size] || 'w-6 h-6 border-2';

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizeClasses} ${className}`}
      style={{
        borderColor: color === 'current' ? undefined : color,
        borderTopColor: 'transparent',
      }}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
