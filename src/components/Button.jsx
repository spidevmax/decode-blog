import { Link } from 'react-router-dom';
import './Button.css';

/**
 * @param {'primary'|'accent'|'ghost'} variant
 * Renderiza <Link> si recibe `to`, <a> si recibe `href`, si no <button>.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  ...rest
}) => {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
};

export default Button;
