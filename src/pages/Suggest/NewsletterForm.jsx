import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui';
import FormField from '@/components/ui/FormField';
import { submitSuggestion } from '@/services/api';
import { isValidEmail } from '@/utils/validation';

/**
 * Newsletter sign-up. Subcomponent used only by the Suggest page.
 *
 * One field, so it lays out as a single row inside the subscribe band. The
 * cadence is stated once, by the band itself, so there is no hint here.
 *
 * The field is uncontrolled: the address is only ever read on submit, so
 * holding it in state would re-render the row on every keystroke to produce a
 * value nothing looks at until the button is pressed. `emailRef` is the field
 * — it reads the value and takes the focus. SuggestionForm is controlled for
 * the opposite reason: its parent needs the values as they are typed.
 */
const NewsletterForm = () => {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [fieldError, setFieldError] = useState(null);

  const emailRef = useRef(null);
  const doneRef = useRef(null);

  // The row is replaced by the confirmation, so the focus that was on the
  // subscribe button would otherwise fall back to the top of the document.
  useEffect(() => {
    if (status === 'done') doneRef.current?.focus();
  }, [status]);

  // Corrected is corrected: the message goes as soon as the address does.
  // Nothing else is tracked, so a clean field types without re-rendering.
  const update = () => {
    if (fieldError) setFieldError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = emailRef.current?.value ?? '';

    if (!isValidEmail(email)) {
      setFieldError('Enter a valid email address.');
      emailRef.current?.focus();
      return;
    }
    setFieldError(null);
    setStatus('sending');

    try {
      await submitSuggestion({ type: 'newsletter', email: email.trim() });
      // No reset needed: the form unmounts for the confirmation, so coming
      // back through "Use another email" mounts a fresh, empty field.
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="form-success form-success--inline" role="status">
        <h3 className="form-success__title" ref={doneRef} tabIndex={-1}>
          Subscribed
        </h3>
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
        autoComplete="email"
        ref={emailRef}
        placeholder="hello@example.com"
        error={fieldError}
        onChange={update}
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
