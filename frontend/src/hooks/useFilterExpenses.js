import { useState } from "react";
import { useContext } from "react";
import { ExpensesContext } from "../context/ExpensesContext";

/**
 * Custom hook for handling expense filtering logic.
 * Manages filter state updates, validation, and submitting filters.
 */
export default function useFilterExpenses() {
  const { filters, setFilters, fetchExpenses } = useContext(ExpensesContext);

  // Local error state for validation messages
  const [error, setError] = useState("");

  /* Handles all filter input changes (checkboxes, dates, price, notes). */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFilters((prev) => {
      // Handle category checkbox toggle
      if (type === "checkbox") {
        const id = Number(name);

        return {
          ...prev,
          categories: checked
            ? [...prev.categories, id]
            : prev.categories.filter((c) => c !== id),
        };
      }

      // Handle date range updates
      if (name === "from" || name === "to") {
        return {
          ...prev,
          date: { ...prev.date, [name]: value },
        };
      }

      // Handle price range updates
      if (name === "min" || name === "max") {
        return {
          ...prev,
          price: { ...prev.price, [name]: value },
        };
      }

      // Default case: notes input
      return {
        ...prev,
        notes: value,
      };
    });
  };

  /* Validates filters and triggers API fetch. Ensures date and price ranges are logically correct.*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate date range
    const from = filters.date.from;
    const to = filters.date.to;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate > toDate) {
        setError("Invalid date range");
        return false;
      }
    }

    // Validate price range
    const minVal = filters.price.min;
    const maxVal = filters.price.max;

    if (minVal !== "" && maxVal !== "") {
      if (Number(minVal) > Number(maxVal)) {
        setError("Invalid price range");
        return false;
      }
    }

    // Fetch filtered expenses
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
