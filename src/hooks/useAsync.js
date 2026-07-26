import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Envuelve una función async de services/api en el ciclo idle → loading →
 * success | error, con reintento y protección contra respuestas fuera de orden.
 *
 * Infraestructura genérica: no sabe nada del dominio. Los hooks de cada entidad
 * (useAlbums, useNews…) se construyen encima.
 *
 * @param {(...args:any[]) => Promise<T>} fetcher
 * @param {any[]} deps  argumentos que se le pasan al fetcher; también disparan refetch
 * @param {{ enabled?: boolean }} [options]
 */
export const useAsync = (fetcher, deps, { enabled = true } = {}) => {
  // Sólo la petición más reciente puede escribir en el estado.
  const requestId = useRef(0);
  const [attempt, setAttempt] = useState(0);

  // El fetcher y los args se redefinen en cada render; los leemos por ref para
  // que no cuenten como dependencias del efecto. Lo que sí dispara un refetch
  // es `depsKey`, la serialización de los args.
  const fetcherRef = useRef(fetcher);
  const depsRef = useRef(deps);
  useEffect(() => {
    fetcherRef.current = fetcher;
    depsRef.current = deps;
  });

  const depsKey = JSON.stringify(deps);

  // Identidad de la petición vigente. Cambiarla es, por sí sola, la señal de
  // "hay que volver a pedir": no hace falta un efecto que sincronice loading.
  const key = `${depsKey}|${attempt}`;
  const [settled, setSettled] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const id = ++requestId.current;
    let active = true;

    fetcherRef
      .current(...depsRef.current)
      .then((data) => {
        if (!active || id !== requestId.current) return;
        setSettled({ key, data, error: null });
      })
      .catch((error) => {
        if (!active || id !== requestId.current) return;
        setSettled({ key, data: null, error });
      });

    return () => {
      // Invalida esta petición: su respuesta ya no puede escribir estado.
      active = false;
    };
  }, [enabled, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // El resultado sólo cuenta si corresponde a la petición vigente; si no,
  // seguimos cargando. Todo derivado del render, sin setState en efectos.
  const fresh = settled?.key === key ? settled : null;

  if (!enabled) {
    return { data: null, loading: false, error: null, retry };
  }

  return {
    data: fresh?.data ?? null,
    error: fresh?.error ?? null,
    loading: fresh === null,
    retry,
  };
};
