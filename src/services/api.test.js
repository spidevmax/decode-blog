import { describe, expect, it } from 'vitest';
import { getAlbumById, getAlbums, getFacets, getFeatures, getNews } from './api';

// La caída de red simulada se desactiva con VITE_API_FAIL_RATE=0, fijada en
// vite.config.js: el módulo la lee al importarse, así que aquí ya sería tarde.

describe('getAlbums', () => {
  it('devuelve todo el catálogo sin filtros', async () => {
    const albums = await getAlbums();
    expect(albums.length).toBeGreaterThan(0);
    expect(albums[0]).toHaveProperty('title');
  });

  it('ordena por fecha descendente por defecto', async () => {
    const albums = await getAlbums();
    const dates = albums.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('ordena por puntaje cuando se pide', async () => {
    const albums = await getAlbums({ sort: 'score' });
    const scores = albums.map((a) => a.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it('filtra por género', async () => {
    const albums = await getAlbums({ genre: 'Folclore' });
    expect(albums.length).toBeGreaterThan(0);
    expect(albums.every((a) => a.genres.includes('Folclore'))).toBe(true);
  });

  it('filtra por año, comparando como string o número', async () => {
    const porNumero = await getAlbums({ year: 2025 });
    const porString = await getAlbums({ year: '2025' });
    expect(porNumero.map((a) => a.id)).toEqual(porString.map((a) => a.id));
    expect(porNumero.every((a) => a.year === 2025)).toBe(true);
  });

  it('devuelve copias: mutar el resultado no altera el dataset', async () => {
    const primera = await getAlbums();
    primera[0].title = 'MUTADO';
    const segunda = await getAlbums();
    expect(segunda[0].title).not.toBe('MUTADO');
  });
});

describe('getAlbumById', () => {
  it('encuentra un álbum existente', async () => {
    const album = await getAlbumById('cemento');
    expect(album.title).toBe('Cemento');
    expect(album.body.length).toBeGreaterThan(0);
  });

  it('rechaza con 404 si no existe', async () => {
    await expect(getAlbumById('no-existe')).rejects.toMatchObject({ status: 404 });
  });
});

describe('getFacets', () => {
  it('devuelve géneros y años únicos y ordenados', async () => {
    const { genres, years } = await getFacets();
    expect(new Set(genres).size).toBe(genres.length);
    expect([...genres].sort()).toEqual(genres);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });
});

describe('contenido editorial', () => {
  it('getNews ordena de más reciente a más antigua', async () => {
    const news = await getNews();
    const dates = news.map((n) => n.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('getFeatures ordena de más reciente a más antiguo', async () => {
    const features = await getFeatures();
    const dates = features.map((f) => f.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});
