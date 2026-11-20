import React from 'react';

/**
 * Primary CTA buttons:
 * background #00A8E1, white text, hover #0779FF, pressed #177BCE.
 * Secondary buttons:
 * transparent with a 1px #B6BDC6 border, hover background #232F3E.
 */
const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'dodger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'bg-blue-prime text-text-primary hover:bg-blue-bright active:bg-blue-royal shadow-sm';
  } else if (variant === 'secondary') {
    variantClasses = 'bg-transparent text-text-primary border border-text-muted/30 hover:bg-bg-surface hover:border-text-muted/60 active:bg-bg-surface/80';
  } else if (variant === 'dodger') {
    variantClasses = 'bg-blue-dodger text-text-primary hover:bg-blue-bright active:bg-blue-royal';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-surface';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-prime disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses[size] || sizeClasses.md} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
