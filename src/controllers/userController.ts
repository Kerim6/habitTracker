import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import env from "../../env.ts";

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

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { email, username, firstName, lastName } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
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
  } catch (error) {
    console.error("Update profile error", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validateCurrentPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!validateCurrentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
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
  } catch (error) {
    console.error(error, "Faild to change password");
    res.status(500).json({ message: "Faild to update the password" });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;

    if (req.user?.id === userId) {
      return res
        .status(401)
        .json({ message: "Admin can't delete his or her account" });
    }

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (deletedUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Deleting user error", error);
    return res.status(500).json({ message: "Failed deleting user" });
  }
};
