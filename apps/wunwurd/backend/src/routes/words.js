const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/words/search?q= — find words matching a query, return [{ word, count }]
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!q) return res.json([]);

  try {
    const grouped = await prisma.wunwurd.groupBy({
      by: ['word'],
      where: { word: { contains: q } },
      _count: { word: true },
      orderBy: { _count: { word: 'desc' } },
      take: 20,
    });

    res.json(grouped.map((g) => ({ word: g.word, count: g._count.word })));
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/words/:word — all movies tagged with this word, sorted by vote count
const PAGE_SIZE = 20;

router.get('/:word', async (req, res) => {
  const word = req.params.word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return res.status(400).json({ error: 'Invalid word' });

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const grouped = await prisma.wunwurd.groupBy({
      by: ['movieId'],
      where: { word },
      _count: { word: true },
      orderBy: { _count: { word: 'desc' } },
      skip,
      take: PAGE_SIZE + 1,
    });

    if (grouped.length === 0) return res.json({ movies: [], hasMore: false });

    const hasMore = grouped.length > PAGE_SIZE;
    const slice = grouped.slice(0, PAGE_SIZE);

    const movieIds = slice.map((g) => g.movieId);
    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
    });

    const movieMap = Object.fromEntries(movies.map((m) => [m.id, m]));

    const result = slice
      .map((g) => ({ ...movieMap[g.movieId], votes: g._count.word }))
      .filter((m) => m.tmdbId);

    res.json({ movies: result, hasMore });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch movies for word' });
  }
});

module.exports = router;
