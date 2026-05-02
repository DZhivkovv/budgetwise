import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

// Custom hook that fetches expense categories
const useFetchExpenseCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const res = await api.get("/category");
        setExpenseCategories(res.data);
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    expenseCategories,
    isLoading,
    error,
  };
};

export default useFetchExpenseCategories;
