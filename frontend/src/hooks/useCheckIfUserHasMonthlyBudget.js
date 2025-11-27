import { useState, useEffect } from "react";
import axios from "axios";

// Custom hook that checks if user has monthly budget
const useCheckIfUserHasMonthlyBudget = () => {
  // State that tracks if user has a budget and the budget data
  const [budgetData, setBudgetData] = useState({
    hasBudget: false,
    budget: null, // Null if no budget exists
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/budget", { withCredentials: true })
      .then(({ data }) => {
        setBudgetData({ hasBudget: data.hasBudget, budget: data.budget });
      })
      .catch(() => {
        setBudgetData({ hasBudget: false, budget: null });
      });
  }, []);

  return budgetData; 
};

export default useCheckIfUserHasMonthlyBudget;
