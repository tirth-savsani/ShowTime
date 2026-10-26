import React from 'react';
import { Film } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  icon: Icon = Film,
  title = 'No items found',
  hint = 'Try adjusting your filters or search query.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-muted mb-4">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted mb-6">{hint}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
