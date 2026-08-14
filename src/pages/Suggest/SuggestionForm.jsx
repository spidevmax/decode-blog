import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isNotBlank } from '@/utils/validation';

/**
 * Album pitch. Subcomponent used only by the Suggest page.
 *
 * @param {(ready: boolean) => void} onReadyChange  fires when the pitch gains
 *   or loses the two fields that make it a real candidate, so the page can
 *   reflect it in the empty score.
 */
const SuggestionForm = ({ onReadyChange }) => {
  const [values, setValues] = useState({ artist: '', album: '', comment: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  /** A pitch counts once it names a record: artist and album. */
  const reportReady = (next) => {
    onReadyChange?.(isNotBlank(next.artist) && isNotBlank(next.album));
  };

  const update = (field) => (event) => {
    // Computed outside the updater on purpose: a state updater must stay pure,
    // and React may run it twice under StrictMode.
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    reportReady(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!isNotBlank(values.artist)) nextErrors.artist = 'Name the artist.';
    if (!isNotBlank(values.album)) nextErrors.album = 'Name the album.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    try {
      await submitSuggestion({ type: 'suggestion', ...values });
      setStatus('done');
      setValues({ artist: '', album: '', comment: '' });
      onReadyChange?.(false);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="form-success" role="status">
        <h3 className="form-success__title">Pitch sent</h3>
        <p>We will listen. If it moves us, it gets a review.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Pitch another
        </Button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit} noValidate>
      <div className="suggest-form__pair">
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
      </div>

      <FormField
        label="Why it matters"
        as="textarea"
        name="comment"
        value={values.comment}
        placeholder="Make the case. What does this record do that others do not?"
        onChange={update('comment')}
      />

      {status === 'error' && (
        <p className="form-error" role="alert">
          The pitch did not send. Try again.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send the pitch'}
      </Button>
    </form>
  );
};

export default SuggestionForm;
