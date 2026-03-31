const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { execSync } = require('child_process');

const authRoutes = require('./routes/auth');
const boardsRoutes = require('./routes/boards');
const routinesRoutes = require('./routes/routines');

const app = express();
const PORT = process.env.PORT || 3002;

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
    res.json({ status: 'ok' });
  } catch (e) {
    res.json({ status: 'error', message: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/routines', routinesRoutes);

app.listen(PORT, () => {
  console.log(`Now & Next backend running on http://localhost:${PORT}`);
});
