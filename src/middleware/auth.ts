import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";
import type { Role } from "../db/schema.ts";

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

export const authorize = (...alowedRoles: Role[]) => {
  const normalizedRoles = alowedRoles.map((role) => role.toLowerCase());

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: "Role missing" });
    }

    if (
      normalizedRoles.length > 0 &&
      !normalizedRoles.includes(userRole.toLowerCase())
    ) {
      return res.status(403).json({ message: "Forbbiden" });
    }

    next();
  };
};
