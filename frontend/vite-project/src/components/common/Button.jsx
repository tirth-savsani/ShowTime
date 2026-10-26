import React from 'react';
import Spinner from './Spinner.jsx';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 select-none';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs rounded-xs',
    md: 'h-10 px-5 text-sm rounded-sm', // Spec C4: 40px height, 20px padding, 6px radius
    lg: 'h-12 px-6 text-base rounded-md',
  }[size] || 'h-10 px-5 text-sm rounded-sm';

  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark/95 shadow-sm',
    secondary:
      'bg-white text-primary border border-primary hover:bg-primary/5 active:bg-primary/10',
    ghost:
      'bg-transparent text-ink hover:bg-gray-100 active:bg-gray-200',
    danger:
      'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  }[variant] || 'bg-primary text-white hover:bg-primary-dark';

  const disabledStyles =
    disabled || loading
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <Spinner size={size === 'sm' ? 'sm' : 'sm'} color="currentColor" />
        </span>
      )}
      <span className={loading ? 'invisible' : 'inline-flex items-center gap-2'}>
        {children}
      </span>
    </button>
  );
};

export default Button;
