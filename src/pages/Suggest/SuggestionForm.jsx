import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isNotBlank } from '@/utils/validation';

/** Album suggestion. Subcomponent used only by the Suggest page. */
const SuggestionForm = () => {
  const [values, setValues] = useState({ artist: '', album: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!isNotBlank(values.artist)) nextErrors.artist = 'Artist is missing.';
    if (!isNotBlank(values.album)) nextErrors.album = 'Album is missing.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    try {
      await submitSuggestion({ type: 'suggestion', ...values });
      setStatus('done');
      setValues({ artist: '', album: '', comment: '' });
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
        <h3>Noted</h3>
        <p>We will listen. If it moves us, we will review it.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Suggest another
        </Button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Artist"
        name="artist"
        required
        value={values.artist}
        placeholder="Charli XCX"
        error={errors.artist}
        onChange={update('artist')}
      />

      <FormField
        label="Album"
        name="album"
        required
        value={values.album}
        placeholder="BRAT"
        error={errors.album}
        onChange={update('album')}
      />

      <FormField
        label="Why we should listen to it"
        as="textarea"
        name="comment"
        value={values.comment}
        placeholder="Tell us what makes it stand out…"
        onChange={update('comment')}
      />

      {status === 'error' && (
        <p className="form-error" role="alert">
          We could not send your suggestion. Try again.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send suggestion'}
      </Button>
    </form>
  );
};

export default SuggestionForm;
