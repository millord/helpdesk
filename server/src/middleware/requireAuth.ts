import type { Request, Response, NextFunction } from "express";

export function requireAuth(_req: Request, res: Response, next: NextFunction) {
  // TODO: Phase 2 — check session and attach user to req
  next();
}
