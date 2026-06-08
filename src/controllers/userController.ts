import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getUsers = await db
      .select({
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users);

    res.json({ getUsers });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const getUser = await db
      .select({
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId));

    res.json({ getUser });
  } catch (error) {
    return res.status(500).json({ error, message: "Internal Server Error" });
  }
};
