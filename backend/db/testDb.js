import { Sequelize } from "sequelize";

/**
 * Sequelize instance for testing.
 * Uses SQLite in-memory mode to ensure a fresh, fast database
 * for every test run without persisting data to disk.
 */
export const sequelize = new Sequelize("sqlite::memory:", {
  logging: false,
});
