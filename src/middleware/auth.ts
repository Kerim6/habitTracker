import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";

export interface AuthenticatedRequest<
  P = any,
  B = any,
  Q = any,
> extends Request<P, B, Q> {
  user?: JwtPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const payload = await verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
