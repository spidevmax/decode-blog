import { useId } from 'react';
import './FormField.css';

/**
 * Campo de formulario con label, hint y error asociados por id.
 * `as="textarea"` para el comentario largo.
 */
const FormField = ({
  label,
  as = 'input',
  hint,
  error,
  required = false,
  className = '',
  ...rest
}) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const Element = as;

  // Sólo describimos por lo que existe, para no dejar ids colgados.
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={id}>
        {label}
        {!required && <span className="field__optional"> (opcional)</span>}
      </label>

      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}

      <Element
        id={id}
        className={`field__control${error ? ' field__control--error' : ''}`}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        {...(as === 'textarea' ? { rows: 5 } : {})}
        {...rest}
      />

      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
