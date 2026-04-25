#!/usr/bin/env node
// Daily seeder: finds movies with no wunwurds and seeds them with AI-generated words.
// Prioritises newest releases. Run via GitHub Actions cron.
// Requires: DATABASE_URL, TMDB_API_KEY, ANTHROPIC_API_KEY

const { Client } = require('pg');
const Anthropic = require('@anthropic-ai/sdk');

const DB_URL = process.env.DATABASE_URL;
const TMDB_KEY = process.env.TMDB_API_KEY;
const WORDS_PER_MOVIE = 4;
const MAX_MOVIES = 150;
const BATCH = 10;

if (!DB_URL || !TMDB_KEY || !process.env.ANTHROPIC_API_KEY) {
  console.error('Missing required env vars: DATABASE_URL, TMDB_API_KEY, ANTHROPIC_API_KEY');
  process.exit(1);
}

const ai = new Anthropic();

async function tmdbFetch(path, page = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3${path}?api_key=${TMDB_KEY}&language=en-US&page=${page}`
  );
  const data = await res.json();
  return data.results || [];
}

async function generateWords(movies) {
  const list = movies.map((m, i) => `${i + 1}. "${m.title}" (${m.year || '?'})`).join('\n');
  const msg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `For each film below, give exactly ${WORDS_PER_MOVIE} single English words that capture its vibe or essence. Be creative and unexpected — avoid genre labels like "thriller" or "comedy". Return ONLY a JSON array of arrays, e.g. [["word1","word2","word3","word4"],...]. No other text.\n\n${list}`,
    }],
  });

  const raw = msg.content[0].text.trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Unexpected Claude response: ${raw}`);
  return JSON.parse(match[0]);
}

function toMovie(m) {
  return {
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
    posterPath: m.poster_path || null,
    backdropPath: m.backdrop_path || null,
    releaseDate: m.release_date || '0000-00-00',
  };
}

async function main() {
  const db = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();

  // Get seed user IDs
  const { rows: seedUsers } = await db.query(
    `SELECT id FROM "User" WHERE email LIKE '%@wunwurd.app' ORDER BY id`
  );
  if (seedUsers.length === 0) {
    console.error('No seed users found in database');
    await db.end();
    process.exit(1);
  }
  const seedIds = seedUsers.map(u => u.id);
  console.log(`Found ${seedIds.length} seed users`);

  // Fetch from multiple sources — newest releases first in priority
  console.log('Fetching movies from TMDB...');
  const fetches = await Promise.all([
    // Upcoming — genuinely new, highest priority
    tmdbFetch('/movie/upcoming', 1),
    tmdbFetch('/movie/upcoming', 2),
    tmdbFetch('/movie/upcoming', 3),
    // Now playing
    tmdbFetch('/movie/now_playing', 1),
    tmdbFetch('/movie/now_playing', 2),
    tmdbFetch('/movie/now_playing', 3),
    // Trending this week
    tmdbFetch('/trending/movie/week', 1),
    tmdbFetch('/trending/movie/week', 2),
    // Popular sorted by release date
    tmdbFetch('/movie/popular', 1),
    tmdbFetch('/movie/popular', 2),
    tmdbFetch('/movie/popular', 3),
  ]);

  const seen = new Set();
  const candidates = [];
  for (const results of fetches) {
    for (const m of results) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      candidates.push(toMovie(m));
    }
  }

  // Sort newest first
  candidates.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  console.log(`${candidates.length} unique movies fetched, checking for unseeded...`);

  // Find which have no wunwurds yet
  const unseeded = [];
  for (const movie of candidates) {
    if (unseeded.length >= MAX_MOVIES) break;
    const { rows: existing } = await db.query(
      `SELECT w.id FROM "Wunwurd" w
       JOIN "Movie" m ON m.id = w."movieId"
       WHERE m."tmdbId" = $1 LIMIT 1`,
      [movie.tmdbId]
    );
    if (existing.length === 0) unseeded.push(movie);
  }

  if (unseeded.length === 0) {
    console.log('No unseeded movies found today.');
    await db.end();
    return;
  }
  console.log(`Seeding ${unseeded.length} movies...`);

  for (let i = 0; i < unseeded.length; i += BATCH) {
    const batch = unseeded.slice(i, i + BATCH);
    let wordSets;
    try {
      wordSets = await generateWords(batch);
    } catch (err) {
      console.error(`Claude error on batch ${Math.floor(i / BATCH) + 1}:`, err.message);
      continue;
    }

    for (let j = 0; j < batch.length; j++) {
      const movie = batch[j];
      const words = (wordSets[j] || []).slice(0, WORDS_PER_MOVIE);
      if (words.length === 0) continue;

      // Upsert movie
      const { rows: [dbMovie] } = await db.query(
        `INSERT INTO "Movie" ("tmdbId", title, year, "posterPath", "backdropPath", "cachedAt")
         VALUES ($1,$2,$3,$4,$5,NOW())
         ON CONFLICT ("tmdbId") DO UPDATE SET title=EXCLUDED.title, "cachedAt"=NOW()
         RETURNING id`,
        [movie.tmdbId, movie.title, movie.year, movie.posterPath, movie.backdropPath]
      );

      // Assign words to distinct shuffled seed users
      const shuffled = [...seedIds].sort(() => Math.random() - 0.5);
      for (let k = 0; k < words.length; k++) {
        const word = words[k].replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 30);
        if (!word) continue;
        await db.query(
          `INSERT INTO "Wunwurd" ("userId", "movieId", word, "submittedAt", "updatedAt")
           VALUES ($1,$2,$3,NOW(),NOW())
           ON CONFLICT ("userId", "movieId") DO NOTHING`,
          [shuffled[k], dbMovie.id, word]
        );
      }
      console.log(`  [${movie.releaseDate}] ${movie.title}: ${words.join(', ')}`);
    }
  }

  await db.end();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
