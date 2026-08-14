import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isValidEmail } from '@/utils/validation';

/**
 * Newsletter sign-up. Subcomponent used only by the Suggest page.
 *
 * One field, so it lays out as a single row inside the subscribe band. The
 * cadence is stated once, by the band itself, so there is no hint here.
 */
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
      <div className="form-success form-success--inline" role="status">
        <h3 className="form-success__title">Subscribed</h3>
        <p>The next review lands in your inbox.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Use another email
        </Button>
      </div>
    );
  }

  return (
    <form
      className="suggest-form suggest-form--inline"
      onSubmit={handleSubmit}
      noValidate
    >
      <FormField
        label="Your email"
        type="email"
        name="email"
        required
        value={email}
        placeholder="hello@example.com"
        error={fieldError}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Subscribe'}
      </Button>

      {status === 'error' && (
        <p className="form-error" role="alert">
          Sign-up did not go through. Try again in a moment.
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
