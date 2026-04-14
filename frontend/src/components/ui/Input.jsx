import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from './Button';

/**
 * Reusable Input component
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.type='text']
 * @returns {JSX.Element}
 */
const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-white/20 bg-primary/50 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';
Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
};

export { Input };
