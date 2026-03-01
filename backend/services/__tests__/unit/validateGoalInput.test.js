import { jest } from "@jest/globals";
import validateGoalInput from "../../../utils/validation/validateGoalInput.js";
import db from "../../../models/index.js";

const Category = db.Category;

describe("validateGoalInput – full unit tests", () => {
  // Mock на DB операцията
  beforeAll(() => {
    jest.spyOn(Category, "findOne").mockImplementation(async () => {
      return { id: 1, name: "Savings" };
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  describe("✅ Valid cases", () => {
    it("should return valid true for a correct saving goal", async () => {
      const result = await validateGoalInput(1000, "saving", "active", futureDateStr, 1);
      expect(result).toEqual({ valid: true, message: "Goal data is valid." });
    });

    it("should return valid true for a correct spending goal", async () => {
      const result = await validateGoalInput(500, "spending", "completed", futureDateStr, 2);
      expect(result).toEqual({ valid: true, message: "Goal data is valid." });
    });
  });

  describe("❌ Invalid cases", () => {
    it("should fail if goal status is invalid", async () => {
      const result = await validateGoalInput(1000, "saving", "invalid", futureDateStr, 1);
      expect(result).toEqual({ valid: false, message: "Please, add valid goal status." });
    });

    it("should fail if goal type is invalid", async () => {
      const result = await validateGoalInput(1000, "invalid_type", "active", futureDateStr, 1);
      expect(result).toEqual({ valid: false, message: "Please, add valid goal type." });
    });

    it("should fail if target amount is missing", async () => {
      const result = await validateGoalInput(null, "saving", "active", futureDateStr, 1);
      expect(result).toEqual({ valid: false, message: "Please enter a valid target amount." });
    });

    it("should fail if target amount is negative", async () => {
      const result = await validateGoalInput(-50, "saving", "active", futureDateStr, 1);
      expect(result).toEqual({ valid: false, message: "Please enter a valid target amount." });
    });

    it("should fail if deadline is missing", async () => {
      const result = await validateGoalInput(1000, "saving", "active", "", 1);
      expect(result).toEqual({ valid: false, message: "Please select a valid deadline date." });
    });

    it("should fail if deadline is invalid", async () => {
      const result = await validateGoalInput(1000, "saving", "active", "not-a-date", 1);
      expect(result).toEqual({ valid: false, message: "Please select a valid deadline date." });
    });

    it("should fail if deadline is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = await validateGoalInput(1000, "saving", "active", pastDate.toISOString().split("T")[0], 1);
      expect(result).toEqual({ valid: false, message: "Deadline must be in the future." });
    });

    it("should fail for spending goal with missing category", async () => {
      const result = await validateGoalInput(500, "spending", "active", futureDateStr, null);
      expect(result).toEqual({ valid: false, message: "Spending goals must have a valid category." });
    });

    it("should fail for spending goal with invalid category type", async () => {
      const result = await validateGoalInput(500, "spending", "active", futureDateStr, "abc");
      expect(result).toEqual({ valid: false, message: "Spending goals must have a valid category." });
    });

    it("should fail for saving goal with wrong category ID", async () => {
      const result = await validateGoalInput(1000, "saving", "active", futureDateStr, 999);
      expect(result).toEqual({ valid: false, message: "Saving goals must use the Savings category." });
    });
  });
});