import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data from server. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-6 bg-red-50/50 rounded-lg border border-red-100 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-danger mb-3">
        <AlertCircle className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
