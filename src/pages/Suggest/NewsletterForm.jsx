import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isValidEmail } from '@/utils/validation';

/** Alta al newsletter. Subcomponente exclusivo de la página Suggest. */
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [fieldError, setFieldError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setFieldError('Ingresá un email válido.');
      return;
    }
    setFieldError(null);
    setStatus('sending');

    try {
      await submitSuggestion({ type: 'newsletter', email: email.trim() });
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="form-success" role="status">
        <p className="form-success__mark" aria-hidden="true">
          ✓
        </p>
        <h3>Listo</h3>
        <p>Te vas a enterar de cada reseña nueva antes que el resto.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Cargar otro email
        </Button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Tu email"
        type="email"
        name="email"
        required
        value={email}
        placeholder="hola@ejemplo.com"
        hint="Una vez por semana. Sin spam, sin promociones."
        error={fieldError}
        onChange={(e) => setEmail(e.target.value)}
      />

      {status === 'error' && (
        <p className="form-error" role="alert">
          No pudimos suscribirte. Probá de nuevo en un momento.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Suscribirme'}
      </Button>
    </form>
  );
};

export default NewsletterForm;
