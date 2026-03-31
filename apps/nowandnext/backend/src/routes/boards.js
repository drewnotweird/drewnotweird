const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authRequired, async (req, res) => {
  const boards = await prisma.board.findMany({ where: { userId: req.user.userId }, orderBy: { updatedAt: 'desc' } });
  res.json(boards);
});

router.post('/', authRequired, async (req, res) => {
  const { name, mode, items } = req.body;
  const board = await prisma.board.create({ data: { userId: req.user.userId, name, mode, items } });
  res.json(board);
});

router.put('/:id', authRequired, async (req, res) => {
  const { name, mode, items } = req.body;
  const board = await prisma.board.findUnique({ where: { id: Number(req.params.id) } });
  if (!board || board.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.board.update({ where: { id: board.id }, data: { name, mode, items } });
  res.json(updated);
});

router.delete('/:id', authRequired, async (req, res) => {
  const board = await prisma.board.findUnique({ where: { id: Number(req.params.id) } });
  if (!board || board.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
  await prisma.board.delete({ where: { id: board.id } });
  res.json({ ok: true });
});

module.exports = router;
