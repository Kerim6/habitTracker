import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import env from "../../env.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { BadRequestError } from "../errors/BadRequestError.ts";
import { ForbiddenError } from "../errors/ForbiddenError.ts";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
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
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
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
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?.id;
  const { email, username, firstName, lastName } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const updatedProfile = await db
    .update(users)
    .set({
      email,
      username,
      firstName,
      lastName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      updatedAt: users.updatedAt,
    });

  res.json({ message: "Profile updated successfully", user: updatedProfile });
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw new NotFoundError("User is not found");
  }

  const validateCurrentPassword = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!validateCurrentPassword) {
    throw new BadRequestError("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  res.json({ message: "Password changed successfully" });
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;

  if (req.user?.id === userId) {
    throw new ForbiddenError("Admin can't delete his or her account");
  }

  const deletedUser = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  if (deletedUser.length === 0) {
    throw new NotFoundError("User not found");
  }

  return res.json({ message: "User deleted successfully" });
};
