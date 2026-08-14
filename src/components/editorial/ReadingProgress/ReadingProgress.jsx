import { useEffect, useRef, useState } from 'react';
import './ReadingProgress.css';

/**
 * How far through a long read you are, as a rule across the top of the screen.
 *
 * Only features get this. A news item is four paragraphs — a meter for it
 * would measure nothing — so the rule's presence is itself a signal that this
 * is one of the long ones. It is drawn in the piece's own kicker colour, the
 * same one the archive used to file it.
 *
 * Decoration that reports on the document, not a control: `aria-hidden`, no
 * tab stop, and nothing here is the only way to learn anything.
 */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const measure = () => {
      frame.current = 0;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport is entirely read on arrival.
      setProgress(scrollable <= 0 ? 1 : Math.min(window.scrollY / scrollable, 1));
    };

    // One measurement per frame at most: scroll fires far faster than paint.
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div
        className="reading-progress__rule"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

export default ReadingProgress;
