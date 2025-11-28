import validateUserBudget from "../utils/validation/validateUserBudget.js"
import getUserIdFromToken from "../utils/auth/getUserIdFromToken.js";

// Import Budget model from the database
import db from "../models/index.js";
const Budget = db.Budget;

/**
 * Checks whether the authenticated user has an existing budget.
 *
 * Extracts the user ID from the authentication token stored in cookies,
 * queries the database for a budget entry associated with that user,
 * and returns information indicating if the budget exists and what its values are.
 *
 * @async
 * @function checkIfUserHasBudget
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response:
 * 
 * **200 OK**  
 *  - `{ success: true, hasBudget: boolean, budget: number|null, currency: string|null }`
 *
 * **401 Unauthorized**  
 *  - `{ success: false, message: "Invalid or expired token." }`
 *
 * **400–499 Token extraction errors**  
 *  - Based on `getUserIdFromToken` return structure.
 *
 * **500 Internal Server Error**  
 *  - `{ success: false, message: "Internal server error." }`
 *
 * @throws Will NOT throw directly—errors are caught and translated into HTTP responses.
 */
export async function checkIfUserHasBudget(req, res) {
  try {
    const { success, status, message, userId } = getUserIdFromToken(req.cookies, 'auth-token');
    if (!success) {
      return res.status(status).json({ success: false, message });
    }

      // Find if the user already has a budget using his ID.
      const userBudget = await Budget.findOne({where: {userId: userId }});
      // Initialize a variable that will contain a boolean value 'false' if the user has not set a monthly budget yet.
      const userHasBudget = userBudget != null; 

      // Send a 200 OK response. 
      return res.status(200).json({ success: true, hasBudget: userHasBudget });
    }
    catch(error)
    {
      // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
      {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
      }

  
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
}



/**
 * Handles adding a new monthly budget for an authenticated user.
 *
 * Workflow:
 * 1. Extract authenticated user ID from JWT cookie.
 * 2. Validate authentication (missing/invalid/expired JWT → 401).
 * 3. Check whether the user already has a budget (→ 409 Conflict if true).
 * 4. Validate incoming budget amount and currency via validateUserBudget().
 * 5. Insert new budget record into the database.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 *
 * @returns {Promise<import("express").Response>}
 *
 * --- POSSIBLE RESPONSE STATUSES ---
 * 201:
 * - **201 Created** → Budget successfully stored.
 *
 * 400s:
 * - **400 Bad Request** → Invalid budget or currency.
 * - **401 Unauthorized** → Invalid/missing/expired JWT.
 * - **409 Conflict** → User already has a budget.
 *
 * 500:
 * - **500 Internal Server Error** → Unexpected DB/server error.
 */
export async function addUserBudget(req, res) {
  try 
  {
    // Call a function that extracts the user ID from the auth cookie token.
    const {success, status, message, userId} = getUserIdFromToken(req.cookies, 'auth-token');
    // If the id can not be extracted from the token, the function execution stops here.
    if (!success)
    {
        return res.status(status).json({success:false, message });
    }
    // Find if the user already has a budget using his ID.
    const existingBudget = await Budget.findOne({ where: { userId } });
    // If the user has a budget already, return 409 Conflict response. The function execution stops here.
    if (existingBudget) {
        return res.status(409).json({ success: false, message: "User already has a budget" });
    }
    
    // Get the user's budget from the request body and parse it.
    const { budget, currency } = req.body;
    const parsedBudget = parseFloat(budget);

    // Check if the user's budget and currency input is valid
    const budgetValidityData = validateUserBudget(parsedBudget,currency);
    // If the user input is invalid, return a response with information about the invalid data. The function execution stops here.
    if (budgetValidityData.valid === false)
    {
        return res.status(budgetValidityData.status).json({success: false, message: budgetValidityData.message})
    }

    // Create new record in the Budget database with the user budget.
    const newBudget = await Budget.create({
      userId,
      amount: parsedBudget,
      currency
    });

    // Send 201 Created response.
    return res.status(201).json({ success: true, message: "Budget added successfully", budget: newBudget });

  } catch (error) {

    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
    {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



/**
 * Edits the existing budget of an authenticated user.
 *
 * Workflow:
 * 1. Extract user ID from JWT stored in cookies.
 * 2. Validate authentication (→ 401 if missing/invalid token).
 * 3. Check if the user already has a budget (→ 404 if not found).
 * 4. Validate the updated budget values.
 * 5. Update database record and return success response.
 *
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 *
 * @returns {Promise<import("express").Response>}
 *
 * --- POSSIBLE RESPONSE STATUSES ---
 * 200:
 * - **200 OK** → Budget updated successfully.
 *
 * 400s:
 * - **400 Bad Request** → Invalid budget or currency.
 * - **401 Unauthorized** → Missing/invalid/expired JWT.
 * - **404 Not Found** → User does not have a budget to edit.
 *
 * 500:
 * - **500 Internal Server Error**
 */
export async function editUserBudget(req, res) {
  try 
  {
    // Call a function that extracts the user ID from the auth cookie token.
    const {success, status, message, userId} = getUserIdFromToken(req.cookies, 'auth-token');
    // If the id can not be extracted from the token, the function execution stops here.
    if (!success)
    {
        return res.status(status).json({success:false, message });
    }
    
    // Find if the user already has a budget using his ID.
    const existingBudget = await Budget.findOne({ where: { userId } });
    // If the user does not have a budget already, return 404 Not Found response. The function execution stops here.
    if (!existingBudget) {
        return res.status(404).json({ success: false, message: "User does not have a budget" });
    }
    // Get the user's budget from the request body and parse it.
    const { budget, currency } = req.body;
    const parsedBudget = parseFloat(budget);
    
    // Check if the user's budget and currency input is valid
    const budgetValidityData = validateUserBudget(parsedBudget,currency);
    // If the user input is invalid, return a response with information about the invalid data. The function execution stops here.
    if (!budgetValidityData.valid)
    {
        return res.status(budgetValidityData.status).json({success: false, message: budgetValidityData.message})
    }

    // Update the user's budget record in the database.
    existingBudget.amount = parsedBudget;
    existingBudget.currency = currency;
    await existingBudget.save();

    // Send 200 OK response.
    return res.status(200).json({ success: true, message: "Budget edited successfully", existingBudget});

  } catch (error) {

    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
    {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TEST FUNCTIONS - To be removed later.
////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function getAllBudgets(req, res) {
  const budgets = await Budget.findAll();

  // If user has no budgets yet
  if (!budgets.length) {
      return res.status(200).json({ success: true, message: "No budgets found", data: [] });
  }

  // Return all budgets
  return res.status(200).json({ success: true, data: budgets });
}


export async function deleteAllBudgets(req, res) {

  await Budget.destroy({ where: {},truncate: true,   restartIdentity: true})

  return res.status(200).json({ success: true, message: "All budgets removed" });
}
