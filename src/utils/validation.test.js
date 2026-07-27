import { describe, expect, it } from 'vitest';
import { isNotBlank, isValidEmail } from './validation';

describe('isValidEmail', () => {
  it('acepta emails con forma válida', () => {
    expect(isValidEmail('hola@ejemplo.com')).toBe(true);
    expect(isValidEmail('m.lopez+decode@sub.dominio.ar')).toBe(true);
  });

  it('recorta espacios antes de validar', () => {
    expect(isValidEmail('  hola@ejemplo.com  ')).toBe(true);
  });

  it('rechaza lo que no tiene forma de email', () => {
    expect(isValidEmail('malo')).toBe(false);
    expect(isValidEmail('sin@dominio')).toBe(false);
    expect(isValidEmail('@ejemplo.com')).toBe(false);
    expect(isValidEmail('con espacio@ejemplo.com')).toBe(false);
  });

  it('no explota con null/undefined', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

describe('isNotBlank', () => {
  it('distingue contenido real de espacios', () => {
    expect(isNotBlank('Cemento')).toBe(true);
    expect(isNotBlank('   ')).toBe(false);
    expect(isNotBlank('')).toBe(false);
  });

  it('no explota con null/undefined', () => {
    expect(isNotBlank(null)).toBe(false);
    expect(isNotBlank(undefined)).toBe(false);
  });
});
