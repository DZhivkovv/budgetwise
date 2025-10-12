import validateUserBudget from "../utils/budget/validateUserBudget.js";
import getUserIdFromToken from "../utils/auth/getUserIdFromToken.js";
import jwt from 'jsonwebtoken';

// Import Budget model from the database
import db from "../models/index.js";
const Budget = db.Budget;

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A function that checks if user has monthly budget 
////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function checkIfUserHasBudget(req,res)
{
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



////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A function that creates a record in the 'Budget' table in the database using id of the authenticated user.
////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    console.log(parsedBudget);

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
    console.error("Error adding budget:", error);

    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
    {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A function that edits a record in the 'Budget' table in the database using id of the authenticated user.
////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    console.error("Error editing budget:", error);

    // If the token is invalid or expired, return 401 Unauthorized. The function execution stops here.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") 
    {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
}



export async function getAllBudgets(req, res) {
  // Fetch all budgets for this user
  const budgets = await Budget.findAll();

  // If user has no budgets yet
  if (!budgets.length) {
      return res.status(200).json({ success: true, message: "No budgets found", data: [] });
  }

  // Return all budgets
  return res.status(200).json({ success: true, data: budgets });
}
