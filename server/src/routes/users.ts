import { Router } from 'express';
import { db } from '../lib/db';

const router = Router();

router.get('/', async (_req, res) => {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

export default router;
