const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authRequired, async (req, res) => {
  const routines = await prisma.routine.findMany({ where: { userId: req.user.userId }, orderBy: { updatedAt: 'desc' } });
  res.json(routines);
});

router.post('/', authRequired, async (req, res) => {
  const { name, steps } = req.body;
  const routine = await prisma.routine.create({ data: { userId: req.user.userId, name, steps } });
  res.json(routine);
});

router.put('/:id', authRequired, async (req, res) => {
  const { name, steps } = req.body;
  const routine = await prisma.routine.findUnique({ where: { id: Number(req.params.id) } });
  if (!routine || routine.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.routine.update({ where: { id: routine.id }, data: { name, steps } });
  res.json(updated);
});

router.delete('/:id', authRequired, async (req, res) => {
  const routine = await prisma.routine.findUnique({ where: { id: Number(req.params.id) } });
  if (!routine || routine.userId !== req.user.userId) return res.status(404).json({ error: 'Not found' });
  await prisma.routine.delete({ where: { id: routine.id } });
  res.json({ ok: true });
});

module.exports = router;
