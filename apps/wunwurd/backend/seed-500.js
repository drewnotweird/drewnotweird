const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

require('dotenv').config();

const prisma = new PrismaClient();
const API_KEY = process.env.TMDB_API_KEY;
const TARGET = 500;

const GENRE_WORDS = {
  28:    ['epic', 'intense', 'explosive', 'thrilling', 'brutal', 'kinetic', 'relentless', 'powerful', 'stunning', 'visceral', 'electrifying', 'fierce', 'raw', 'unstoppable', 'ferocious', 'savage', 'propulsive', 'breathless', 'muscular', 'punishing'],
  12:    ['epic', 'exciting', 'thrilling', 'spectacular', 'grand', 'sweeping', 'breathtaking', 'daring', 'rousing', 'exhilarating', 'wondrous', 'bold', 'adventurous', 'majestic', 'extraordinary', 'soaring', 'mythic', 'boundless', 'rapturous', 'stirring'],
  16:    ['magical', 'charming', 'beautiful', 'heartwarming', 'colorful', 'joyful', 'imaginative', 'wonderful', 'enchanting', 'delightful', 'whimsical', 'vibrant', 'lovely', 'radiant', 'playful', 'luminous', 'sweet', 'expressive', 'lush', 'inventive'],
  35:    ['hilarious', 'funny', 'witty', 'charming', 'delightful', 'clever', 'lighthearted', 'breezy', 'absurd', 'silly', 'warm', 'playful', 'fresh', 'joyful', 'sharp', 'snappy', 'irreverent', 'zany', 'infectious', 'spirited'],
  80:    ['gritty', 'dark', 'stylish', 'slick', 'sharp', 'tense', 'moody', 'brooding', 'atmospheric', 'clever', 'raw', 'intense', 'compelling', 'seedy', 'dangerous', 'sinister', 'murky', 'menacing', 'hardboiled', 'ruthless'],
  99:    ['revealing', 'fascinating', 'powerful', 'compelling', 'insightful', 'moving', 'important', 'honest', 'gripping', 'shocking', 'essential', 'urgent', 'intimate', 'sobering', 'illuminating', 'unflinching', 'damning', 'vital', 'searching', 'courageous'],
  18:    ['emotional', 'moving', 'powerful', 'haunting', 'gripping', 'raw', 'beautiful', 'heartfelt', 'profound', 'touching', 'intense', 'honest', 'deep', 'stirring', 'searing', 'devastating', 'absorbing', 'layered', 'aching', 'resonant'],
  10751: ['wholesome', 'heartwarming', 'charming', 'sweet', 'magical', 'delightful', 'joyful', 'warm', 'lovely', 'cheerful', 'uplifting', 'cozy', 'enchanting', 'bright', 'endearing', 'nurturing', 'sunny', 'gentle', 'cuddly', 'comforting'],
  14:    ['magical', 'wondrous', 'enchanting', 'epic', 'imaginative', 'beautiful', 'mystical', 'dreamlike', 'spectacular', 'majestic', 'mythical', 'extraordinary', 'breathtaking', 'otherworldly', 'transcendent', 'spellbinding', 'ethereal', 'dazzling', 'fantastical', 'luminous'],
  36:    ['majestic', 'sweeping', 'powerful', 'grand', 'epic', 'moving', 'important', 'stirring', 'beautiful', 'compelling', 'dramatic', 'inspiring', 'monumental', 'dignified', 'weighty', 'authoritative', 'immersive', 'reverent', 'formidable', 'consequential'],
  27:    ['terrifying', 'creepy', 'disturbing', 'unsettling', 'chilling', 'scary', 'dark', 'sinister', 'haunting', 'nightmarish', 'tense', 'bleak', 'twisted', 'dreadful', 'oppressive', 'harrowing', 'unnerving', 'grotesque', 'suffocating', 'relentless'],
  10402: ['soulful', 'uplifting', 'vibrant', 'passionate', 'moving', 'electric', 'beautiful', 'energetic', 'joyful', 'inspiring', 'rhythmic', 'emotional', 'powerful', 'infectious', 'alive', 'transcendent', 'exhilarating', 'magnetic', 'rapturous', 'soaring'],
  9648:  ['intriguing', 'clever', 'atmospheric', 'moody', 'suspenseful', 'dark', 'twisty', 'enigmatic', 'layered', 'gripping', 'mysterious', 'compelling', 'cerebral', 'puzzling', 'eerie', 'labyrinthine', 'ambiguous', 'shadowy', 'obsessive', 'hypnotic'],
  10749: ['sweet', 'heartwarming', 'tender', 'lovely', 'beautiful', 'touching', 'emotional', 'dreamy', 'charming', 'moving', 'gentle', 'warm', 'bittersweet', 'swoony', 'intoxicating', 'aching', 'rapturous', 'longing', 'euphoric', 'irresistible'],
  878:   ['visionary', 'cerebral', 'futuristic', 'imaginative', 'stunning', 'ambitious', 'cosmic', 'trippy', 'brilliant', 'epic', 'innovative', 'expansive', 'challenging', 'philosophical', 'otherworldly', 'bold', 'prophetic', 'dazzling', 'strange', 'monumental'],
  53:    ['tense', 'gripping', 'suspenseful', 'dark', 'twisty', 'clever', 'intense', 'brooding', 'chilling', 'riveting', 'mysterious', 'sharp', 'edgy', 'claustrophobic', 'relentless', 'paranoid', 'menacing', 'electric', 'propulsive', 'unsettling'],
  10752: ['brutal', 'harrowing', 'powerful', 'devastating', 'intense', 'raw', 'gritty', 'heroic', 'tragic', 'gripping', 'emotional', 'dark', 'sobering', 'visceral', 'unforgettable', 'shattering', 'uncompromising', 'immersive', 'human', 'staggering'],
  37:    ['rugged', 'atmospheric', 'gritty', 'cool', 'stylish', 'classic', 'brooding', 'tense', 'moody', 'epic', 'raw', 'authentic', 'iconic', 'dusty', 'elemental', 'austere', 'mythic', 'stark', 'lonesome', 'weathered'],
};

const DEFAULT_WORDS = ['compelling', 'entertaining', 'engaging', 'solid', 'enjoyable', 'watchable', 'good', 'great', 'stunning', 'impressive', 'memorable', 'interesting', 'satisfying', 'polished', 'effective', 'accomplished', 'assured', 'confident', 'slick', 'smart'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWordPool(movie) {
  let pool = [];
  for (const id of (movie.genre_ids || [])) {
    if (GENRE_WORDS[id]) pool.push(...GENRE_WORDS[id]);
  }
  if (pool.length < 4) pool.push(...DEFAULT_WORDS);
  pool = pool.map(w => w.replace(/[^a-z]/gi, '').toLowerCase()).filter(Boolean);
  return shuffle([...new Set(pool)]);
}

// Simpler plan: just 4 words, 1 vote each (one gets 2 to give a clear winner)
function buildPlan(wordPool) {
  return [
    { word: wordPool[0], count: 2 },
    { word: wordPool[1], count: 1 },
    { word: wordPool[2], count: 1 },
    { word: wordPool[3], count: 1 },
  ].filter(p => p.word);
}

async function tmdbGet(path) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`https://api.themoviedb.org/3${path}${sep}api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  await new Promise(r => setTimeout(r, 250));
  return data.results || [];
}

async function fetchAll() {
  const seen = new Set();
  const movies = [];

  const push = (list) => {
    for (const m of list) {
      if (!seen.has(m.id)) { seen.add(m.id); movies.push(m); }
    }
  };

  // Trending week pages 1–5 first — these are exactly what the homepage shows
  console.log('  Fetching trending this week (pages 1–5, homepage content)…');
  for (let p = 1; p <= 5; p++) push(await tmdbGet(`/trending/movie/week?page=${p}`));

  console.log('  Fetching now-playing…');
  for (let p = 1; p <= 5; p++) push(await tmdbGet(`/movie/now_playing?page=${p}`));

  console.log('  Fetching popular (pages 1–20)…');
  for (let p = 1; p <= 20; p++) push(await tmdbGet(`/movie/popular?page=${p}`));

  console.log('  Fetching top-rated (pages 11–30)…');
  for (let p = 11; p <= 30; p++) push(await tmdbGet(`/movie/top_rated?page=${p}`));

  console.log('  Fetching trending this week (pages 6–15)…');
  for (let p = 6; p <= 15; p++) push(await tmdbGet(`/trending/movie/week?page=${p}`));

  return movies;
}

async function main() {
  console.log(`\n🎬  WUNWURD seed-500 starting (target: ${TARGET} new movies)…\n`);

  const users = await prisma.user.findMany({
    where: { email: { contains: '@wunwurd.app' } },
  });
  if (users.length === 0) {
    console.error('No seed users found — run seed.js first.');
    process.exit(1);
  }
  console.log(`✓ Found ${users.length} seed users\n`);

  const alreadySeeded = new Set(
    (await prisma.wunwurd.findMany({ select: { movie: { select: { tmdbId: true } } } }))
      .map(w => w.movie.tmdbId)
  );
  console.log(`  (${alreadySeeded.size} movies already seeded — skipping those)\n`);

  console.log('Fetching movies from TMDB…');
  const allMovies = await fetchAll();
  const newMovies = allMovies.filter(m => !alreadySeeded.has(m.id)).slice(0, TARGET);
  console.log(`\n✓ ${allMovies.length} total fetched, seeding ${newMovies.length} new movies\n`);

  let seededCount = 0;
  let wunwurdCount = 0;

  for (const tmdbMovie of newMovies) {
    const year = tmdbMovie.release_date
      ? parseInt(tmdbMovie.release_date.slice(0, 4))
      : null;

    const movie = await prisma.movie.upsert({
      where: { tmdbId: tmdbMovie.id },
      create: {
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        year,
        posterPath: tmdbMovie.poster_path || null,
        backdropPath: tmdbMovie.backdrop_path || null,
      },
      update: {
        title: tmdbMovie.title,
        year,
        posterPath: tmdbMovie.poster_path || null,
        backdropPath: tmdbMovie.backdrop_path || null,
        cachedAt: new Date(),
      },
    });

    const wordPool = getWordPool(tmdbMovie);
    const plan = buildPlan(wordPool);
    const shuffledUsers = shuffle(users);

    let userIndex = 0;
    let movieWunwurds = 0;

    for (const { word, count } of plan) {
      for (let i = 0; i < count; i++) {
        if (userIndex >= shuffledUsers.length) break;
        await prisma.wunwurd.upsert({
          where: { userId_movieId: { userId: shuffledUsers[userIndex].id, movieId: movie.id } },
          create: { userId: shuffledUsers[userIndex].id, movieId: movie.id, word },
          update: { word },
        });
        userIndex++;
        movieWunwurds++;
      }
    }

    wunwurdCount += movieWunwurds;
    seededCount++;
    const topWord = plan[0]?.word?.toUpperCase();
    console.log(`  ✓  ${movie.title.padEnd(45)} ${String(year || '').padEnd(6)} → ${String(movieWunwurds).padStart(2)} votes  (${topWord})`);
  }

  const totalMovies = await prisma.movie.count();
  const totalWunwurds = await prisma.wunwurd.count();
  console.log(`\n🎉  Done!`);
  console.log(`    Added ${wunwurdCount} wunwurds across ${seededCount} new movies`);
  console.log(`    Total in DB: ${totalMovies} movies, ${totalWunwurds} wunwurds\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
