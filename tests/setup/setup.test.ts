import {
  createTestHabit,
  createTestUser,
  cleanupDatabase,
} from "./dbHelpers.ts";

describe("Test Setup", () => {
  it("should connect to the test database", async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    await cleanupDatabase(); // Clean up after test
  });
});
