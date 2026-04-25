import React from 'react';
import clsx from 'clsx';

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 * 
 * @param {object} props - Component props
 * @param {string} props.variant - Button variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} props.size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.loading - Show loading state
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.iconPosition - Icon position: 'left' | 'right'
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {object} props.rest - Additional props
 * @returns {React.ReactElement}
 */
export const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-slate-blue-500 text-white hover:bg-slate-blue-600 active:bg-slate-blue-700 disabled:bg-slate-blue-300',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 disabled:bg-neutral-100 disabled:text-neutral-400',
    danger: 'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 disabled:bg-coral-300',
    ghost: 'bg-transparent text-slate-blue-500 hover:bg-slate-blue-50 active:bg-slate-blue-100 disabled:text-neutral-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-body-sm gap-2',
    md: 'px-4 py-2 text-body gap-2',
    lg: 'px-6 py-3 text-body gap-3',
  };

  return (
    <button
      ref={ref}
      className={clsx(
        'btn-base',
        variants[variant],
        sizes[size],
        'focus:ring-2 focus:ring-offset-2 focus:ring-sky-blue-500',
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="flex items-center">{icon}</span>
      )}

      {children}

      {icon && iconPosition === 'right' && !loading && (
        <span className="flex items-center">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
