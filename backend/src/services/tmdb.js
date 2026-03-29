const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE}${path}${sep}api_key=${process.env.TMDB_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

async function cacheMovie(tmdbMovie) {
  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.slice(0, 4))
    : null;
  return prisma.movie.upsert({
    where: { tmdbId: tmdbMovie.id },
    create: {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title || tmdbMovie.name || 'Unknown',
      year,
      posterPath: tmdbMovie.poster_path || null,
      backdropPath: tmdbMovie.backdrop_path || null,
    },
    update: {
      title: tmdbMovie.title || tmdbMovie.name || 'Unknown',
      year,
      posterPath: tmdbMovie.poster_path || null,
      backdropPath: tmdbMovie.backdrop_path || null,
      cachedAt: new Date(),
    },
  });
}

async function searchMovies(query) {
  const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&page=1`);
  return data.results || [];
}

async function getTrending(page = 1) {
  const data = await tmdbFetch(`/trending/movie/week?page=${page}`);
  return data.results || [];
}

async function getMovieDetail(tmdbId) {
  return tmdbFetch(`/movie/${tmdbId}`);
}

module.exports = { cacheMovie, searchMovies, getTrending, getMovieDetail };
