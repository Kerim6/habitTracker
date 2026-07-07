import { db } from "../../src/db/connection.ts";
import {
  users,
  habits,
  entries,
  type NewUser,
  type NewHabit,
} from "../../src/db/schema.ts";
import { generateToken } from "../../src/utils/jwt.ts";
import { hashPassword } from "../../src/utils/password.ts";

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData = {
    email: `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`,
    username: `testuser-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    password: "password123",
    firstName: "Test",
    lastName: "User",
    ...userData,
  };

  const hashedPassword = await hashPassword(defaultData.password);
  const [newUser] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning();

  const token = await generateToken({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
  });
  return { user: newUser, token };
};

export const createTestHabit = async (
  userId: string,
  habitData: Partial<NewHabit> = {},
) => {
  const defaultData = {
    name: `Test Habit ${Date.now()}`,
    description: `Test Description ${Date.now()}`,
    frequency: "daily",
    targetCount: 1,
    isActive: true,
    ...habitData,
  };
  const [newHabit] = await db
    .insert(habits)
    .values({
      userId,
      ...defaultData,
    })
    .returning();
  return newHabit;
};

export const cleanupDatabase = async () => {
  await db.delete(entries).execute();
  await db.delete(habits).execute();
  await db.delete(users).execute();
};
