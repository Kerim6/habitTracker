import bcrypt from "bcrypt";
import env from "../../env.ts";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = env.BCRYPT_ROUNDS;
  return await bcrypt.hash(password, saltRounds);
};
