import type { Request, Response } from "express";
import { db } from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { generateToken } from "../utils/jwt.ts";
import { hashPassword, comparePasswords } from "../utils/password.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { ConflictError } from "../errors/ConflictError.ts";
import { UnauthorizedError } from "../errors/UnauthorizedError.ts";

export const register = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  const hashedPassword = await hashPassword(password);

  // Check if email or username already exists in the database
  const existingUser = await db.query.users.findFirst({
    where: (users, { or, eq }) =>
      or(eq(users.email, email), eq(users.username, username)),
  });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  // create new user in the database
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    })
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    });

  // Generate JWT token for auto-login after registration
  const token = await generateToken({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
    token,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // first find the user by email
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // then compare the provided password with the stored hashed password
  const passwordMatch = await comparePasswords(password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // if password matches, generate a JWT token
  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  res.json({
    message: "User logged in successfully",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
  });
};
