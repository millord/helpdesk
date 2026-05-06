import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Phase 2: router.use("/auth", authRouter);
// Phase 3: router.use("/users", usersRouter);
// Phase 4: router.use("/tickets", ticketsRouter);

export default router;
