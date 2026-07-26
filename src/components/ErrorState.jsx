import Button from './Button';
import './ErrorState.css';

const ErrorState = ({
  title = 'Se cortó la púa',
  message = 'No pudimos traer las reseñas. Puede ser la conexión.',
  error,
  onRetry,
}) => {
  // El 404 del API merece un texto propio.
  const is404 = error?.status === 404;

  return (
    <div className="error-state" role="alert">
      <p className="error-state__mark" aria-hidden="true">
        ✕
      </p>
      <h2 className="error-state__title">{is404 ? 'No está en el archivo' : title}</h2>
      <p className="error-state__message">
        {is404 ? 'Esa reseña no existe o fue dada de baja.' : (error?.message ?? message)}
      </p>
      <div className="error-state__actions">
        {onRetry && !is404 && (
          <Button variant="accent" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        <Button variant="ghost" to="/">
          Ir al inicio
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
