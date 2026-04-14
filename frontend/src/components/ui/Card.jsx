import PropTypes from 'prop-types';
import { cn } from './Button';

/**
 * Reusable Glass-morphism Card component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @returns {React.ReactElement}
 */
export function Card({ children, className, ...props }) {
  return (
    <div className={cn("glass-card p-6", className)} {...props}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export function CardHeader({ children, className }) {
  return <div className={cn("mb-4 flex items-center justify-between", className)}>{children}</div>;
}

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-xl font-bold tracking-tight text-white", className)}>{children}</h3>;
}

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
