/**
 * Validaciones genéricas, sin nada específico de DECODE.
 * (Utils = portables a cualquier proyecto; helpers = propios del dominio.)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @returns {boolean} true si `value` parece un email válido. */
export const isValidEmail = (value) => EMAIL_RE.test(String(value ?? '').trim());

/** @returns {boolean} true si `value` tiene algún carácter no-espacio. */
export const isNotBlank = (value) => String(value ?? '').trim().length > 0;
