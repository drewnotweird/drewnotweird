const express = require('express');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { authRequired, authOptional } = require('../middleware/auth');
const { cacheMovie, searchMovies, getTrending, getMovieDetail } = require('../services/tmdb');
const { notify } = require('../services/notify');

const router = express.Router();
const prisma = new PrismaClient();

// 10 wunwurd submissions per user per hour
const wunwurdLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `user-${req.user.id}`,
  message: { error: 'Too many submissions — slow down! Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/movies/trending?page=1
// Returns only movies that have at least one wunwurd, newest first.
// Search still covers all TMDB movies regardless of submissions.
router.get('/trending', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const PAGE_SIZE = 20;
  try {
    const movies = await prisma.movie.findMany({
      where: { wunwurds: { some: {} } },
      orderBy: [{ year: 'desc' }, { cachedAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    res.json(movies);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// GET /api/movies/search?q=
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  try {
    const movies = await searchMovies(q.trim());
    res.json(movies);
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/movies/:tmdbId
router.get('/:tmdbId', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid movie ID' });
  try {
    let movie = await prisma.movie.findUnique({ where: { tmdbId } });
    if (!movie) {
      const tmdbData = await getMovieDetail(tmdbId);
      movie = await cacheMovie(tmdbData);
    }
    res.json(movie);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// GET /api/movies/:tmdbId/wunwurds
router.get('/:tmdbId/wunwurds', authOptional, async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid movie ID' });
  try {
    const movie = await prisma.movie.findUnique({ where: { tmdbId } });
    if (!movie) return res.json({ words: [], topWord: null, userWord: null });

    const rows = await prisma.wunwurd.findMany({
      where: { movieId: movie.id },
      select: { word: true, userId: true, user: { select: { email: true } } },
    });

    // Aggregate frequencies; real-user votes sort above seed-bot votes
    const freq = {};
    for (const r of rows) {
      const isBot = r.user.email.endsWith('@wunwurd.app');
      if (!freq[r.word]) freq[r.word] = { count: 0, realCount: 0 };
      freq[r.word].count++;
      if (!isBot) freq[r.word].realCount++;
    }
    const words = Object.entries(freq)
      .map(([word, { count, realCount }]) => ({ word, count, realCount }))
      .sort((a, b) => b.realCount - a.realCount || b.count - a.count)
      .map(({ word, count }) => ({ word, count }));

    const topWord = words.length > 0 ? words[0].word : null;
    const userWord = req.user
      ? (rows.find((r) => r.userId === req.user.id)?.word ?? null)
      : null;

    res.json({ words, topWord, userWord });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch wunwurds' });
  }
});

// POST /api/movies/:tmdbId/wunwurds
router.post('/:tmdbId/wunwurds', authRequired, wunwurdLimiter, async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid movie ID' });

  let { word } = req.body;
  if (!word) return res.status(400).json({ error: 'Word is required' });

  // Sanitise: letters only, lowercase, max 30 chars
  word = word.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 30);
  if (!word) return res.status(400).json({ error: 'Word must contain letters only' });

  try {
    let movie = await prisma.movie.findUnique({ where: { tmdbId } });
    if (!movie) {
      const tmdbData = await getMovieDetail(tmdbId);
      movie = await cacheMovie(tmdbData);
    }

    const wunwurd = await prisma.wunwurd.upsert({
      where: { userId_movieId: { userId: req.user.id, movieId: movie.id } },
      create: { userId: req.user.id, movieId: movie.id, word },
      update: { word },
    });

    res.json(wunwurd);
    notify('New Wunwurd submitted', `${req.user.username} called "${movie.title}" → ${word}`);
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit wunwurd' });
  }
});

// DELETE /api/movies/:tmdbId/wunwurds
router.delete('/:tmdbId/wunwurds', authRequired, async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid movie ID' });
  try {
    const movie = await prisma.movie.findUnique({ where: { tmdbId } });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    await prisma.wunwurd.deleteMany({
      where: { userId: req.user.id, movieId: movie.id },
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove wunwurd' });
  }
});

module.exports = router;
