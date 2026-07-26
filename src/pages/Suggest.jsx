import { useState } from 'react';
import Button from '../components/Button';
import FormField from '../components/FormField';
import TapeAccent from '../components/TapeAccent';
import { submitSuggestion } from '../services/api';
import './Suggest.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulario de newsletter. */
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [fieldError, setFieldError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
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

/** Formulario "sugerí un álbum". */
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
    if (!values.artist.trim()) nextErrors.artist = 'Falta el artista.';
    if (!values.album.trim()) nextErrors.album = 'Falta el álbum.';
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

const Suggest = () => {
  return (
    <div className="section">
      <div className="container">
        <header className="suggest__head">
          <p className="eyebrow">Participá</p>
          <h1 className="suggest__title">Sumate</h1>
          <p className="suggest__lede">
            Recibe las reseñas por mail o cuéntanos qué disco tendríamos que estar
            escuchando.
          </p>
        </header>

        <div className="suggest__panels">
          <section className="suggest__panel" aria-labelledby="newsletter-title">
            <TapeAccent position="top-left" rotate={-6} width="7rem" />
            <h2 id="newsletter-title" className="suggest__panel-title">
              Newsletter
            </h2>
            <NewsletterForm />
          </section>

          <section className="suggest__panel" aria-labelledby="suggestion-title">
            <TapeAccent position="top-right" rotate={5} width="7rem" color="red" />
            <h2 id="suggestion-title" className="suggest__panel-title">
              Sugiere un álbum
            </h2>
            <SuggestionForm />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Suggest;
