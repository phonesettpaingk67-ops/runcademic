import React from 'react';
import clsx from 'clsx';

/**
 * Input Component
 * Text input with optional label, icon, and error handling
 */
export const Input = React.forwardRef(({
  label,
  error,
  icon,
  size = 'md',
  variant = 'filled',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const sizes = {
    sm: 'text-body-sm',
    md: 'text-body',
    lg: 'text-body',
  };

  const variants = {
    filled: 'bg-neutral-100 border-neutral-300 focus:bg-white',
    outlined: 'bg-white border-neutral-300',
  };

  return (
    <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
      {label && (
        <label className="text-body-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 flex items-center">
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'input-base',
            sizes[size],
            variants[variant],
            {
              'pl-10': icon,
              'border-coral-500 focus:ring-coral-500': error,
            },
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <p className="text-caption text-coral-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea Component
 * Multi-line text input
 */
export const Textarea = React.forwardRef(({
  label,
  error,
  rows = 4,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
      {label && (
        <label className="text-body-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'input-base resize-none',
          {
            'border-coral-500 focus:ring-coral-500': error,
          },
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-caption text-coral-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * Select Component
 * Dropdown select input
 */
export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
      {label && (
        <label className="text-body-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        className={clsx(
          'input-base',
          {
            'border-coral-500 focus:ring-coral-500': error,
          },
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-caption text-coral-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
