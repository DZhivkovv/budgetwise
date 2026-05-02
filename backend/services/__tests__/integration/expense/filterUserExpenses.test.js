import { jest } from "@jest/globals";
import { Op } from "sequelize";
import { filterExpenses } from "../../../expenseService";

const makeExpenseModel = (results = []) => ({
  findAll: jest.fn().mockResolvedValue(results),
});

const makeUserModel = () => ({ name: "User" });
const makeBudgetModel = () => ({ name: "Budget" });
const makeCategoryModel = () => ({ name: "Category" });

const callFilter = (userId, filters, expenses = []) =>
  filterExpenses(
    userId,
    filters,
    makeExpenseModel(expenses),
    makeUserModel(),
    makeBudgetModel(),
    makeCategoryModel(),
  );

describe("filterExpenses – Base behaviour", () => {
  it("always scopes results to the given userId", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "user-42",
      {},
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.userId).toBe("user-42");
  });

  it("returns whatever findAll resolves with", async () => {
    const fakeRows = [{ id: 1 }, { id: 2 }];
    const result = await callFilter("u1", {}, fakeRows);
    expect(result).toEqual(fakeRows);
  });

  it("passes category / user / budget includes to findAll", async () => {
    const ExpenseModel = makeExpenseModel();
    const UserModel = makeUserModel();
    const BudgetModel = makeBudgetModel();
    const CategoryModel = makeCategoryModel();

    await filterExpenses(
      "u1",
      {},
      ExpenseModel,
      UserModel,
      BudgetModel,
      CategoryModel,
    );

    const [{ include }] = ExpenseModel.findAll.mock.calls[0];
    expect(include).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ model: CategoryModel, as: "category" }),
        expect.objectContaining({
          model: UserModel,
          as: "users",
          include: expect.arrayContaining([
            expect.objectContaining({ model: BudgetModel, as: "budgets" }),
          ]),
        }),
      ]),
    );
  });
});

describe("filterExpenses – Category filter", () => {
  it("accepts an array of category IDs", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { categories: ["cat1", "cat2"] },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.categoryId).toEqual({ [Op.in]: ["cat1", "cat2"] });
  });

  it("splits a comma-separated string into an array", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { categories: "cat1,cat2" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.categoryId).toEqual({ [Op.in]: ["cat1", "cat2"] });
  });

  it("trims category values when comma-separated string has spaces", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { categories: "cat1, cat2 ,  cat3 " },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.categoryId).toEqual({
      [Op.in]: ["cat1", "cat2", "cat3"],
    });
  });

  it("omits categoryId when categories is absent", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      {},
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where).not.toHaveProperty("categoryId");
  });

  it("ignores empty category values", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { categories: "cat1,,cat2,," },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.categoryId).toEqual({
      [Op.in]: ["cat1", "cat2"],
    });
  });
});

describe("filterExpenses – Date filter", () => {
  it("applies Op.gte for dateFrom only", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { dateFrom: "2024-01-01" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.date).toEqual({ [Op.gte]: new Date("2024-01-01") });
  });

  it("applies Op.lte for dateTo only", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { dateTo: new Date("2024-12-31") },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.date).toEqual({ [Op.lte]: new Date("2024-12-31") });
  });

  it("applies both bounds when dateFrom and dateTo are provided", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-12-31") },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.date).toEqual({
      [Op.gte]: new Date("2024-01-01"),
      [Op.lte]: new Date("2024-12-31"),
    });
  });

  it("throws 400 when dateFrom is after dateTo", async () => {
    await expect(
      callFilter("u1", {
        dateFrom: new Date("2024-12-31"),
        dateTo: new Date("2024-01-01"),
      }),
    ).rejects.toEqual({ status: 400, message: "Invalid date provided" });
  });

  it("omits date filter when neither dateFrom nor dateTo is given", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      {},
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where).not.toHaveProperty("date");
  });

  it("accepts equal dateFrom and dateTo", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { dateFrom: new Date("2024-01-01"), dateTo: new Date("2024-01-01") },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.date).toEqual({
      [Op.gte]: new Date("2024-01-01"),
      [Op.lte]: new Date("2024-01-01"),
    });
  });

  it("throws for invalid date format", async () => {
    await expect(callFilter("u1", { dateFrom: "not-a-date" })).rejects.toEqual({
      status: 400,
      message: "Invalid date provided",
    });
  });
});

describe("filterExpenses – Price filter", () => {
  it("applies Op.gte for min only", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { min: "10" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.amount).toEqual({ [Op.gte]: 10 });
  });

  it("applies Op.lte for max only", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { max: "100" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.amount).toEqual({ [Op.lte]: 100 });
  });

  it("accepts 0 as valid min/max", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { min: "0", max: "0" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.amount).toEqual({
      [Op.gte]: 0,
      [Op.lte]: 0,
    });
  });

  it("applies both bounds when min and max are valid", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { min: "10", max: "100" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.amount).toEqual({ [Op.gte]: 10, [Op.lte]: 100 });
  });

  it("handles floating point values correctly", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { min: "10.5", max: "20.75" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.amount).toEqual({
      [Op.gte]: 10.5,
      [Op.lte]: 20.75,
    });
  });

  it("throws 400 for a non-numeric min", async () => {
    await expect(callFilter("u1", { min: "abc" })).rejects.toEqual({
      status: 400,
      message: "Invalid price value",
    });
  });

  it("throws 400 for a non-numeric max", async () => {
    await expect(callFilter("u1", { max: "xyz" })).rejects.toEqual({
      status: 400,
      message: "Invalid price value",
    });
  });

  it("throws 400 when min is greater than max", async () => {
    await expect(callFilter("u1", { min: "100", max: "10" })).rejects.toEqual({
      status: 400,
      message: "Invalid price range",
    });
  });

  it("omits amount filter when neither min nor max is given", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      {},
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where).not.toHaveProperty("amount");
  });
});

describe("filterExpenses – Notes filter", () => {
  it("wraps the search term in SQL LIKE wildcards", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      { notes: "lunch" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where.notes).toEqual({ [Op.like]: "%lunch%" });
  });

  it("omits notes filter when not provided", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      {},
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where).not.toHaveProperty("notes");
  });

  it("ignores empty notes string", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { notes: "" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where).not.toHaveProperty("notes");
  });

  it("handles special SQL LIKE characters safely", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      { notes: "%test_" },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where.notes).toEqual({
      [Op.like]: "%%test_%",
    });
  });
});

describe("filterExpenses – Combined filters", () => {
  it("applies all filters simultaneously", async () => {
    const ExpenseModel = makeExpenseModel();
    await filterExpenses(
      "u1",
      {
        categories: ["cat1"],
        dateFrom: "2024-01-01",
        dateTo: new Date("2024-06-30"),
        min: "5",
        max: "50",
        notes: "coffee",
      },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];
    expect(where).toMatchObject({
      userId: "u1",
      categoryId: { [Op.in]: ["cat1"] },
      date: {
        [Op.gte]: new Date("2024-01-01"),
        [Op.lte]: new Date("2024-06-30"),
      },
      amount: { [Op.gte]: 5, [Op.lte]: 50 },
      notes: { [Op.like]: "%coffee%" },
    });
  });

  it("handles messy real-world input", async () => {
    const ExpenseModel = makeExpenseModel();

    await filterExpenses(
      "u1",
      {
        categories: " cat1, ,cat2 ",
        min: " 10 ",
        max: "50",
        dateFrom: new Date("2024-01-01"),
        notes: " coffee ",
      },
      ExpenseModel,
      makeUserModel(),
      makeBudgetModel(),
      makeCategoryModel(),
    );

    const [{ where }] = ExpenseModel.findAll.mock.calls[0];

    expect(where).toMatchObject({
      userId: "u1",
      categoryId: { [Op.in]: ["cat1", "cat2"] },
      amount: { [Op.gte]: 10, [Op.lte]: 50 },
      notes: { [Op.like]: "%coffee%" },
    });
  });
});
