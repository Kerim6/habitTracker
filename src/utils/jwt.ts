import { SignJWT, jwtVerify } from "jose";
import { createSecretKey } from "crypto";
import env from "../../env.ts";
import type { Role } from "../db/schema.ts";

export interface JwtPayload extends Record<string, unknown> {
  id: string;
  email: string;
  username: string;
  role: Role;
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  const secret = env.JWT_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secret = env.JWT_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  const { payload } = await jwtVerify(token, secretKey);
  return {
    id: payload.id as string,
    email: payload.email as string,
    username: payload.username as string,
    role: payload.role as Role,
  };
};
