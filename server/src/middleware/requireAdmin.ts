import type { Request, Response, NextFunction } from "express";

export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  // TODO: Phase 2 — verify user has admin role
  next();
}
