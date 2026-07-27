import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isValidEmail } from '@/utils/validation';

/** Newsletter sign-up. Subcomponent used only by the Suggest page. */
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [fieldError, setFieldError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setFieldError('Enter a valid email address.');
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
        <h3>Done</h3>
        <p>You will hear about every new review before anyone else.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Use another email
        </Button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Your email"
        type="email"
        name="email"
        required
        value={email}
        placeholder="hello@example.com"
        hint="Once a week. No spam, no promotions."
        error={fieldError}
        onChange={(e) => setEmail(e.target.value)}
      />

      {status === 'error' && (
        <p className="form-error" role="alert">
          We could not sign you up. Try again in a moment.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterForm;
