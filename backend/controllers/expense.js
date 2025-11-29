import getUserIdFromToken from "../utils/auth/getUserIdFromToken.js";
import validateExpenseInput from "../utils/validation/validateExpenseInput.js"
import calculateNextExpenseDate from "../utils/expense/calculateNextExpenseDate.js";
import getUserBudget from "../utils/budget/getUserBudget.js";

// Import User, Expense and Category models from the database
import db from "../models/index.js";
const User = db.User;
const Expense = db.Expense;
const Category = db.Category;
/**
 * Retrieves all expenses that belong to the authenticated user.
 *
 * This controller verifies the user's identity by extracting the JWT token 
 * from cookies, validating it, and using the decoded user ID to fetch all 
 * related expenses from the database.
 *
 * @async
 * @function getAllUserExpenses
 * @param {import('express').Request} req - The HTTP request object. Expects a JWT inside `req.cookies['auth-token']`.
 * @param {import('express').Response} res - The HTTP response object used to send JSON responses.
 * 
 * @returns {Promise<import('express').Response>} JSON response with one of:
 *
 * | Status | success | Description |
 * |--------|---------|-------------|
 * | **200 OK** | `true` | Returns all expenses for the authenticated user |
 * | **401 Unauthorized** | `false` | Missing / invalid / expired token |
 * | **500 Internal Server Error** | `false` | Unexpected server failure |
 *
 * @example
 * // Example Express route using the controller:
 * router.get('/expenses', getAllUserExpenses);
 */
export async function getAllUserExpenses(req, res)
{
  try
  {
    // Call a helper function that extracts the authenticated user's id from the auth token in the cookies. 
    const { success: tokenSuccess, status: tokenStatus, message: tokenMessage, userId } = getUserIdFromToken(req.cookies, 'auth-token');
    // If the user token is not extracted successfully, the function execution stops here.
    if (!tokenSuccess) { 
      return res.status(tokenStatus).json({ success: false, message: tokenMessage }) 
    }

    // Find all user expenses and return them including the expenses category names and user budget currency.
    const userExpenses = await Expense.findAll({
      where: { userId },
      include: [
        // Include expense category name
        {
          model: Category,
          as: "category",
          attributes: ["name"]
        },
        // Include user budget currency
        {
          model: db.User,
          as: "user",
          include: [
            {
              model: db.Budget,
              as: "budget",
              attributes: ["currency"]
            }
          ],
          attributes: ["id"], 
        },
      ]
    });
    
    // Send a 200 OK response. 
    return res.status(200).json({success: true, expenses: userExpenses});
    
  }
  catch(error)
  {
    return res.status(500).json({ success: false, message: error.message });
  }
}


/**
 * Adds an expense record for the authenticated user.
 *
 * Handles:
 * - Token extraction & validation
 * - Retrieving user budget
 * - Validating expense input
 * - Category lookup
 * - Month/year restriction
 * - Budget restriction
 * - Recurring expense handling
 * - Expense creation
 * - Budget update
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} JSON response with success status, message and created data.
 */
export async function addUserExpense(req,res)
{
  try
  {
    // Call a helper function that extracts the authenticated user's id from the auth token in the cookies. 
    const { success: tokenSuccess, status: tokenStatus, message: tokenMessage, userId } = getUserIdFromToken(req.cookies, 'auth-token');
    // If the user token is not extracted successfully, the function execution stops here.
    if (!tokenSuccess) { 
      return res.status(tokenStatus).json({ success: false, message: tokenMessage }) 
    }

    // Call an async helper function that retrieves the authenticated user's budget 
    // from the database using the user ID extracted from the auth token in cookies.
    const { success: budgetSuccess, status: budgetStatus, message: budgetMessage, data: budget } = await getUserBudget(userId);
    // If the budget is not retrieved successfully, the function execution stops here.
    if (!budgetSuccess) {
      return res.status(budgetStatus).json({ success: false, message: budgetMessage });
    }

    // Get the expense data from the request body.
    const { categoryId, amount: expenseAmount , date: expenseDate, isPeriodic: expenseIsPeriodic, recurringPeriod, notes } = req.body;

    // Call a function that handles the validation of expense data.
    const {valid: expenseIsValid, status: expenseStatus, message: expenseMessage} = validateExpenseInput(categoryId, expenseAmount, expenseDate, expenseIsPeriodic, recurringPeriod)
    // If the expense data is invalid, return 400 Bad Request. The function execution stops here.
    if (!expenseIsValid)
    {
      return res.status(400).json({success:false, message: expenseMessage });
    }

    // Get the expense category
    const category = await Category.findOne({where: {id: categoryId }});
    // If no expense category is found, return 404 Not Found. The function execution stops here.
    if (!category)
    {
      return res.status(404).json({success:false, message: "Category not found." });
    }

    // Get the expense year and month.  
    const expenseYear = new Date(expenseDate).getFullYear();
    const expenseMonth = new Date(expenseDate).getMonth(); 

    // Get the current year month and month.
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // If the expense is not for the current month, return 403 Forbidden. The function execution stops here. 
    if ( currentYear !== expenseYear || currentMonth !== expenseMonth )
    {
      return res.status(403).json({ success: false, message: "Expenses can be added only for the current month." });
    }

    // If the expense amount is more than the user's budget, return 400 Bad Request. The function execution stops here.
    if (expenseAmount > budget.amount)
    {
      return res.status(400).json({success:false, message: "You cannot afford this expense." });
    }

    // Stores the calculated date for the next recurring payment if the expense is periodic (one week/month/year after the original expense date).
    // The next due date is being calculated only if the expense is periodic, by calling the function calculateNextExpenseDate. 
    // If the expense is not periodic, the value will be null.
    let nextDueDate = expenseIsPeriodic ? calculateNextExpenseDate(expenseDate, recurringPeriod) : null
    
    // Create a record of the expense in the database.
    const expense = await Expense.create({userId, categoryId, amount: expenseAmount, date: expenseDate, isPeriodic: expenseIsPeriodic, recurringPeriod, nextDueDate, notes});

    // Update the user's budget after adding the expense.
    budget.amount = Number(budget.amount) - Number(expenseAmount);
    // Save the updated user budget.
    await budget.save();

    // Send a 200 OK response. 
    return res.status(200).json({ success: true,  message: 'User expense added successfully!', data:{expense, budget} });
  }
  catch(error)
  {
    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
    {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}


/**
 * Edits an existing expense record belonging to the authenticated user.
 *
 * Handles:
 * - Token validation
 * - Budget retrieval
 * - Expense lookup
 * - Category validation
 * - Input validation
 * - Month/year restrictions
 * - Updating expense & recalculating next due date
 * - Budget adjustment after edit
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} JSON response containing updated expense and budget.
 */
export async function editUserExpense(req, res) {
  try {
    // Call a helper function that extracts the authenticated user's id from the auth token in the cookies. 
    const { success: tokenSuccess, status: tokenStatus, message: tokenMessage, userId } =
      getUserIdFromToken(req.cookies, "auth-token");

    // If the user token is not extracted successfully, the function execution stops here.
    if (!tokenSuccess) {
      return res.status(tokenStatus).json({ success: false, message: tokenMessage });
    }

    // Call an async helper function that retrieves the authenticated user's budget 
    // from the database using the user ID extracted from the auth token in cookies.
    const { success: budgetSuccess, status: budgetStatus, message: budgetMessage, data: budget} = await getUserBudget(userId);

    // If the budget is not retrieved successfully, the function execution stops here.
    if (!budgetSuccess) {
      return res.status(budgetStatus).json({ success: false, message: budgetMessage });
    }

    // Get the expense data from the request body.
    const {
      id: expenseId,
      categoryId,
      amount: updatedExpenseAmount,
      date: updatedExpenseDate,
      isPeriodic: expenseIsPeriodic,
      recurringPeriod,
      notes,
    } = req.body;

    // If the expense id is undefined or invalid, return 400 Bad Input. The function execution stops here.
    if (!expenseId || isNaN(expenseId)) {
      return res.status(400).json({ success: false, message: "Expense not found." });
    }

    // If categoryId is missing → Bad request (not Not Found)
    if (!categoryId) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    // Get the expense category
    const category = await Category.findOne({ where: { id: categoryId } });

    // If there is no expense category with the id categoryID, return 404 Not Found. The function execution stops here.
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Validate expense data
    const { valid: expenseIsValid, status: expenseStatus, message: expenseMessage } = validateExpenseInput(categoryId, updatedExpenseAmount, updatedExpenseDate, expenseIsPeriodic, recurringPeriod);

    // If the expense data is invalid, return 400 Bad Request. The function execution stops here.
    if (!expenseIsValid) {
      return res.status(400).json({ success: false, message: expenseMessage });
    }

    const expense = await Expense.findOne({ where: { id: expenseId } });

    // If expense not found, return 404 Not Found. The function execution stops here.
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    // Get the expense month and year.
    const expenseMonth = new Date(expense.date).getMonth();
    const expenseYear = new Date(expense.date).getFullYear();

    // Get the current month and year.
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Get the month and year from the updated expense date.
    const updatedExpenseMonth = new Date(updatedExpenseDate).getMonth();
    const updatedExpenseYear = new Date(updatedExpenseDate).getFullYear();

    // If the expense you want to edit is not from the current month, return 403 Forbidden. The function execution stops here.
    if (
      currentYear !== expenseYear ||
      currentMonth !== expenseMonth ||
      currentYear !== updatedExpenseYear ||
      currentMonth !== updatedExpenseMonth
    ) {
      return res.status(403).json({
        success: false,
        message: "Only current month expenses can be edited.",
      });
    }

    // If the expense amount is a number with value of zero or less, return 400 Bad Request. The function execution stops here.
    if (!Number.isFinite(updatedExpenseAmount) || updatedExpenseAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid expense amount." });
    }

    // Difference in budget after update
    const expenseAmountDifference = Number(expense.amount) - Number(updatedExpenseAmount);

    // --- IMPORTANT FIX: Affordability must be checked BEFORE saving the expense ---
    const updatedBudget = Number(budget.amount) + expenseAmountDifference;

    if (updatedBudget < 0) {
      return res.status(400).json({
        success: false,
        message: "You cannot afford this expense.",
      });
    }

    // Update the expense data
    expense.amount = Number(updatedExpenseAmount);
    expense.date = updatedExpenseDate;
    expense.isPeriodic = expenseIsPeriodic;
    expense.recurringPeriod = expenseIsPeriodic ? recurringPeriod : null;
    expense.nextDueDate = expenseIsPeriodic
      ? calculateNextExpenseDate(updatedExpenseDate, recurringPeriod)
      : null;
    expense.notes = notes;

    // Save the updated expense data.
    await expense.save();

    // Save the updated user budget
    budget.amount = updatedBudget;
    await budget.save();

    // Send a 200 OK response.
    return res.status(200).json({
      success: true,
      message: "Successful expense edit",
      data: { expense, budget },
    });
  } catch (error) {
    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}


/**
 * Deletes an expense record for the authenticated user.
 *
 * Handles:
 * - Token authentication
 * - Budget retrieval
 * - Expense lookup
 * - Month/year restriction (only current month expenses)
 * - Budget refund after deletion
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} JSON response including updated budget.
 */
export async function deleteUserExpense(req,res)
{
    try
    {
      // Call a helper function that extracts the authenticated user's id from the auth token in the cookies. 
      const { success: tokenSuccess, status: tokenStatus, message: tokenMessage, userId } = getUserIdFromToken(req.cookies, 'auth-token');
      // If the user token is not extracted successfully, the function execution stops here.
      if (!tokenSuccess) { 
        return res.status(tokenStatus).json({ success: false, message: tokenMessage }) 
      }

      // Call an async helper function that retrieves the authenticated user's budget 
      // from the database using the user ID extracted from the auth token in cookies.
      const { success: budgetSuccess, status: budgetStatus, message: budgetMessage, data: budget } = await getUserBudget(userId);
      // If the budget is not retrieved successfully, the function execution stops here.
      if (!budgetSuccess) {
        return res.status(budgetStatus).json({ success: false, message: budgetMessage });
      }

      // Get the expense ID from the request body.
      const { id: expenseId } = req.body;
      // If the expense id is not a number, return 400 Bad Input. The function execution stops here.
      if (typeof expenseId !== "number")
      {
        return res.status(400).json({ success: false, message: "Expense not found." });
      }

      // Retrieve the expense from the database.
      const expense = await Expense.findOne({where: {id: expenseId, userId} });
      // If expense not found, return 404 Not Found. The function execution  stops here.
      if (!expense)
      {
        return res.status(404).json({ success: false, message: "Expense not found." });
      }

      // Get the expense month and year.
      const expenseMonth = new Date(expense.date).getMonth(); 
      const expenseYear = new Date(expense.date).getFullYear()

      // Get the current month and year.
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // If the expense month is not the current month, return 403 Forbidden. The function execution stops here. 
      if (currentYear !== expenseYear || currentMonth !== expenseMonth )
      {
        return res.status(403).json({ success: false, message: "Only current month expenses can be deleted." });
      }

      // Get the expense amount.
      const expenseAmount = expense.amount;
  
      // Delete the expense record from the database.
      await expense.destroy();
       
      // Update the user's budget by adding the deleted expense's amount to the budget.
      budget.amount = Number(budget.amount) + Number(expenseAmount);
      // Save the updated user budget.
      await budget.save();

      // Send a 200 OK response. 
      return res.status(200).json({ success: true, budget, message:"Expense deleted successfully." });
    }
    catch(error)
    {
      // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
      {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
      }

      return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export async function deleteAllExpenses(req, res) {

  await Expense.destroy({ where: {},truncate: true,   restartIdentity: true})

  return res.status(200).json({ success: true, message: "All expenses removed" });
}
