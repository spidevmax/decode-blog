import { useState } from 'react';
import { Button, FormField } from '@/components/ui';
import { submitSuggestion } from '@/services/api';
import { isNotBlank } from '@/utils/validation';

/** Sugerencia de álbum. Subcomponente exclusivo de la página Suggest. */
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
    if (!isNotBlank(values.artist)) nextErrors.artist = 'Falta el artista.';
    if (!isNotBlank(values.album)) nextErrors.album = 'Falta el álbum.';
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
        <h3>Anotado</h3>
        <p>Lo escuchamos. Si nos mueve algo, lo reseñamos.</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus('idle')}>
          Sugerir otro
        </Button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit} noValidate>
      <FormField
        label="Artista"
        name="artist"
        required
        value={values.artist}
        placeholder="Los Brutos del Riachuelo"
        error={errors.artist}
        onChange={update('artist')}
      />

      <FormField
        label="Álbum"
        name="album"
        required
        value={values.album}
        placeholder="Cemento"
        error={errors.album}
        onChange={update('album')}
      />

      <FormField
        label="Por qué deberíamos escucharlo"
        as="textarea"
        name="comment"
        value={values.comment}
        placeholder="Contanos qué tiene de particular…"
        onChange={update('comment')}
      />

      {status === 'error' && (
        <p className="form-error" role="alert">
          No pudimos enviar tu sugerencia. Prueba de nuevo.
        </p>
      )}

      <Button type="submit" variant="accent" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar sugerencia'}
      </Button>
    </form>
  );
};

export default SuggestionForm;
