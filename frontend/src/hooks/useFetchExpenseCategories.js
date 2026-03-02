import { useEffect, use, useState } from "react";
import axios from "axios";
// Custom hook that fetches expense categories
const useFetchExpenseCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    axios
      .get("https://budgetwise-zv14.onrender.com/category", {
        withCredentials: true,
      })
      .then((res) => setExpenseCategories(res.data));
  }, []);

  return expenseCategories;
};

export default useFetchExpenseCategories;
