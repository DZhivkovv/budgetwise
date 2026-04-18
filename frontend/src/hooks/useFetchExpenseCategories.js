import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

// Custom hook that fetches expense categories
const useFetchExpenseCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    api.get("/category").then((res) => setExpenseCategories(res.data));
  }, []);

  return expenseCategories;
};

export default useFetchExpenseCategories;
