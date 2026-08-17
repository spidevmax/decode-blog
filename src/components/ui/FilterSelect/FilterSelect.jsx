import './FilterSelect.css';

import { useEffect, useRef, useState } from 'react';

/**
 * A single-choice filter, collapsed behind its current value.
 *
 * The trigger states what is selected rather than naming the control, so the
 * bar reads as a sentence about the archive: "Showing all genres, all years,
 * highest rated". The facet name is still announced, via aria-label.
 *
 * This is a disclosure, not a listbox: the options are ordinary buttons, so
 * Tab walks them and Enter picks one. Escape closes and hands focus back.
 * Full listbox semantics would promise arrow-key navigation this does not
 * implement.
 *
 * @param {string} label  facet name, for screen readers
 * @param {string|null} value  the selected option's value
 * @param {{value: string|null, label: string}[]} options  the first entry is
 *   the neutral one: what the control reads when nothing has been applied.
 */
const FilterSelect = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const close = ({ refocus = false } = {}) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') close({ refocus: true });
    };
    // pointerdown rather than click: closing on the press means a click that
    // starts outside never lands on whatever moved underneath it.
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  // The first option is the neutral one — "All genres", or the default sort.
  // Anything else counts as applied, which is what earns the accent: sort
  // always holds a value, but choosing an order does not narrow the archive.
  const isSet = options.length > 0 && value !== options[0].value;

  // The options arrive with the facets, a moment after the URL does. Falling
  // back to "All genres" while they load would have the control claim nothing
  // is filtered when something is, so an unrecognised value shows itself.
  const current =
    options.find((option) => option.value === value) ??
    (isSet ? { value, label: value } : options[0]);

  return (
    <div className="filter-select" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`filter-select__trigger${isSet ? ' filter-select__trigger--set' : ''}`}
        aria-expanded={open}
        aria-label={`${label}: ${current?.label ?? ''}`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="filter-select__value">{current?.label}</span>
        <span className="filter-select__caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-select__panel" role="group" aria-label={label}>
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              className={`filter-select__option${
                option.value === value ? ' filter-select__option--current' : ''
              }`}
              aria-pressed={option.value === value}
              onClick={() => {
                onSelect(option.value);
                close({ refocus: true });
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;
