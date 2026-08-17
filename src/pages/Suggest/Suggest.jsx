import './Suggest.css';

import { useState } from 'react';

import NewsletterForm from './NewsletterForm';
import SuggestionForm from './SuggestionForm';

/**
 * Submissions.
 *
 * The two things this page does are not equal, so they are not weighted
 * equally: pitching a record is an argument (three fields, the page's reason
 * to exist) and subscribing is a transaction (one field). The pitch gets the
 * page; the newsletter gets a band at the foot.
 *
 * The empty score is the page's one flourish: every record DECODE covers ends
 * up with a number in a circle, and a pitch is the moment before that number
 * exists. It reads "—" until the artist and album are named, then "?" — the
 * record is now a candidate, it just has no verdict yet.
 */
const Suggest = () => {
  const [ready, setReady] = useState(false);

  return (
    <>
      <div className="section">
        <div className="container">
          <header className="pitch__head">
            <p className="eyebrow">Submissions</p>
            <h1 className="pitch__title">Pitch us a record</h1>
            <p className="pitch__lede">
              One album per pitch. Tell us why it matters and we will listen. If it moves
              us, it gets a score.
            </p>
          </header>

          <section className="pitch" aria-labelledby="pitch-title">
            <h2 id="pitch-title" className="visually-hidden">
              Suggest an album
            </h2>

            <aside className="pitch__aside">
              <div
                className={`pitch__score${ready ? ' pitch__score--ready' : ''}`}
                aria-hidden="true"
              >
                <span>{ready ? '?' : '—'}</span>
              </div>
              <p className="pitch__score-note">
                {ready ? 'Awaiting a verdict' : 'Unscored'}
              </p>
            </aside>

            <div className="pitch__form">
              <SuggestionForm onReadyChange={setReady} />
            </div>
          </section>
        </div>
      </div>

      <section className="subscribe" aria-labelledby="subscribe-title">
        <div className="container subscribe__inner">
          <div className="subscribe__text">
            <h2 id="subscribe-title" className="subscribe__title">
              The newsletter
            </h2>
            <p className="subscribe__note">Every review, once a week.</p>
          </div>

          <NewsletterForm />
        </div>
      </section>
    </>
  );
};

export default Suggest;
