import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue. Please try again in a moment.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-8 bg-white rounded-xl border border-border shadow-card ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-primary mb-4">
        <AlertCircle className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-muted mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="px-5 font-semibold">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
