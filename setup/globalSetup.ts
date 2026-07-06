import { db } from "../src/db/connection.ts";
import { users, habits, habitTags, entries, tags } from "../src/db/schema.ts";
import { sql } from "drizzle-orm";
import { execSync } from "child_process";

export default async function setup() {
  console.log("🫙Setting up the test DB");
  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);

    console.log("🚀 Pushing schema using drizzle-kit...");
    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postrgresql"`,
      {
        stdio: "inherit",
        cwd: process.cwd(),
      },
    );

    console.log("✅ test DB created");
  } catch (e) {
    console.error("❌ Faild to setup test db", e);
    throw e;
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
      process.exit(0);
    } catch (e) {
      console.error("❌ Faild to setup test db", e);
      throw e;
    }
  };
}
