import Button from './Button';
import './ErrorState.css';

const ErrorState = ({
  title = 'The needle skipped',
  message = 'We could not load the reviews. It might be your connection.',
  error,
  onRetry,
}) => {
  // A 404 from the API deserves its own copy.
  const is404 = error?.status === 404;

  return (
    <div className="error-state" role="alert">
      <p className="error-state__mark" aria-hidden="true">
        ✕
      </p>
      <h2 className="error-state__title">{is404 ? 'Not in the archive' : title}</h2>
      <p className="error-state__message">
        {is404
          ? 'That review does not exist or was taken down.'
          : (error?.message ?? message)}
      </p>
      <div className="error-state__actions">
        {onRetry && !is404 && (
          <Button variant="accent" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="ghost" to="/">
          Go home
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
