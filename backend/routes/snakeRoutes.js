const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/snake/leaderboard — top 10 global
router.get('/leaderboard', async (req, res) => {
  try {
    const scores = await prisma.snakeScore.findMany({
      orderBy: { score: 'desc' },
      take: 10,
      include: {
        user: { select: { fullName: true, avatarUrl: true } }
      }
    });
    res.json({ scores: scores.map(s => ({
      name:   s.user.fullName,
      avatar: s.user.avatarUrl || null,
      score:  s.score,
      date:   s.updatedAt.toLocaleDateString('es-CO'),
    }))});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/snake/score — guardar/actualizar solo si es mejor score
router.post('/score', authMiddleware, async (req, res) => {
  const { score } = req.body;
  if (!score || score <= 0) return res.status(400).json({ error: 'Score inválido' });
  try {
    // upsert: crea si no existe, actualiza solo si el nuevo score es mayor
    const existing = await prisma.snakeScore.findUnique({ where: { userId: req.user.id } });
    if (!existing || score > existing.score) {
      await prisma.snakeScore.upsert({
        where:  { userId: req.user.id },
        update: { score },
        create: { userId: req.user.id, score },
      });
    }
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
