import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import usersRouter from './users';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/users', requireAuth, requireAdmin, usersRouter);
// Phase 4: router.use("/tickets", requireAuth, ticketsRouter);

export default router;
