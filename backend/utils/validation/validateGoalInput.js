import db from "../../models/index.js";
const Category = db.Category;

export default async function validateGoalInput( targetAmount, type, status, deadline, categoryId ) 
{
    const savingsCategory = await Category.findOne({
    where: { name: "Savings" }
    });

    if (!savingsCategory) {
    throw new Error("Savings category not found");
    }

    const savingsCategoryId = savingsCategory.id;

  // Validate goal status
  if (!["active", "completed", "expired"].includes(status)) {
    return { valid: false, message: "Please, add valid goal status." };
  }

  // Validate goal type
  if (!["saving", "spending"].includes(type)) {
    return { valid: false, message: "Please, add valid goal type." };
  }

  // Validate target amount
  if (
    targetAmount === undefined ||
    targetAmount === null ||
    typeof targetAmount !== "number" ||
    isNaN(targetAmount) ||
    targetAmount <= 0
  ) {
    return { valid: false, message: "Please enter a valid target amount." };
  }

  // Validate deadline
  if (
    typeof deadline !== "string" ||
    deadline.trim() === "" ||
    isNaN(new Date(deadline).getTime())
  ) {
    return { valid: false, message: "Please select a valid deadline date." };
  }
  
  const today = new Date();
  const deadlineDate = new Date(deadline);

  if (deadlineDate <= today) {
    return {
      valid: false,
      message: "Deadline must be in the future.",
    };
}

// Validate goal category
  if (type === "spending") {
    if (
      categoryId === undefined ||
      categoryId === null ||
      typeof categoryId !== "number" ||
      isNaN(categoryId)
    ) {
      return {
        valid: false,
        message: "Spending goals must have a valid category.",
      };
    }
  }

  if (type === "saving") {
    if (categoryId !== savingsCategoryId) {
      return {
        valid: false,
        message: "Saving goals must use the Savings category.",
      };
    }
  }

  return { valid: true, message: "Goal data is valid." };
}
