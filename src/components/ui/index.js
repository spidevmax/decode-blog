/**
 * Barrel de primitivos de UI.
 *
 * Es el único barrel del proyecto: son los componentes más estables y los que
 * más se importan juntos. No se añaden barrels en `album/` ni en `pages/`
 * (allí anularía el code-splitting por ruta).
 *
 * Exports nombrados explícitos, sin `export *`: mantiene el tree-shaking
 * predecible y evita colisiones al crecer.
 */
export { default as Button } from './Button';
export { default as ErrorState } from './ErrorState';
export { default as FormField } from './FormField';
export { default as Loader } from './Loader';
export { default as TapeAccent } from './TapeAccent';
