const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { execSync } = require('child_process');

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const profileRoutes = require('./routes/profile');
const wordsRoutes = require('./routes/words');

const app = express();
const PORT = process.env.PORT || 3001;

// Run DB migration before starting
try {
  console.log('Running prisma db push...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('DB ready.');
} catch (e) {
  console.error('prisma db push failed:', e.message);
}

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://drewnotweird.com',
  'https://www.drewnotweird.com',
  'https://drewnotweird.co.uk',
  'https://www.drewnotweird.co.uk',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const { PrismaClient } = require('@prisma/client');
app.get('/health', async (req, res) => {
  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: 'ok', allowedOrigins });
  } catch (e) {
    res.json({ db: 'error', message: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/words', wordsRoutes);

app.listen(PORT, () => {
  console.log(`WUNWURD backend running on http://localhost:${PORT}`);
});
