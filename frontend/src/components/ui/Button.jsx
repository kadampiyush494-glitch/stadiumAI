import PropTypes from 'prop-types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes safely.
 * @param {...(string|undefined|null|false)} inputs
 * @returns {string} Merged class names
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Base Button component for OmniFlow
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.variant='primary']
 * @param {string} [props.size='md']
 * @param {string} [props.className]
 * @param {boolean} [props.isLoading=false]
 * @returns {React.ReactElement}
 */
const Button = React.forwardRef(
  ({ children, variant = 'primary', size = 'md', className, isLoading, ...props }, ref) => {
    const variants = {
      primary: 'bg-secondary text-primary hover:bg-secondary/90',
      secondary: 'bg-transparent border border-secondary text-secondary hover:bg-secondary/10',
      accent: 'bg-accent text-white hover:bg-accent/90',
      ghost: 'bg-transparent text-white hover:bg-white/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export { Button, cn };
