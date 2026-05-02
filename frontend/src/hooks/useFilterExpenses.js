import { useState } from "react";
import { useContext } from "react";
import { ExpensesContext } from "../context/ExpensesContext";
import { filterExpenses } from "../services/expenseService";

export default function useFilterExpenses() {
  const { filters, setFilters, fetchExpenses } = useContext(ExpensesContext);

  // Error state
  const [error, setError] = useState("");

  // Handler function for input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFilters((prev) => {
      if (type === "checkbox") {
        const id = Number(name);

        return {
          ...prev,
          categories: checked
            ? [...prev.categories, id]
            : prev.categories.filter((c) => c !== id),
        };
      }

      if (name === "from" || name === "to") {
        return {
          ...prev,
          date: { ...prev.date, [name]: value },
        };
      }

      if (name === "min" || name === "max") {
        return {
          ...prev,
          price: { ...prev.price, [name]: value },
        };
      }

      return {
        ...prev,
        notes: value,
      };
    });
  };

  // Filter submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const from = filters.date.from;
    const to = filters.date.to;

    if (from && to && new Date(from) > new Date(to)) {
      setError("Invalid date range");
      return false;
    }

    const min = Number(filters.price.min);
    const max = Number(filters.price.max);

    if (min && max) {
      if (!isNaN(min) && !isNaN(max)) {
        if (min > max) {
          setError("Invalid price range");
          return false;
        }
      }
    }

    await fetchExpenses(filters);
    return true;
  };

  return {
    filters,
    error,
    handleChange,
    handleSubmit,
  };
}
