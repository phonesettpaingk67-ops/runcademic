import React from 'react';
import clsx from 'clsx';

/**
 * Card Component
 * Container component with elevation and padding options
 */
export const Card = React.forwardRef(({
  elevation = 1,
  padding = 'normal',
  interactive = false,
  className,
  children,
  ...props
}, ref) => {
  const elevations = {
    flat: 'shadow-none border border-neutral-200',
    1: 'shadow-elevation-1 border border-neutral-100',
    2: 'shadow-elevation-2 border border-neutral-100',
    3: 'shadow-elevation-3 border border-neutral-100',
  };

  const paddings = {
    compact: 'p-3',
    normal: 'p-4',
    spacious: 'p-6',
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'card-base',
        elevations[elevation],
        paddings[padding],
        {
          'cursor-pointer hover:shadow-elevation-2 hover:scale-102 transition-all duration-fast': interactive,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * CardHeader - Top section of card
 */
export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('pb-3 border-b border-neutral-200', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

/**
 * CardBody - Main content section
 */
export const CardBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('py-3', className)}
    {...props}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

/**
 * CardFooter - Bottom section with actions
 */
export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('pt-3 border-t border-neutral-200 flex gap-2 justify-end', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';
