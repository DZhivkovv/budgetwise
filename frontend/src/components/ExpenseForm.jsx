import { useState, useEffect } from "react";
import axios from "axios";
import useFetchExpenseCategories from "../hooks/useFetchExpenseCategories";

// A form component for adding and editing user expense.
// The component receives a 'mode' prop that determines whether the form will add or edit an expense.
const ExpenseForm = ({ mode, data }) => {
  // A state tracking an expense data.
  const [expenseData, setExpenseData] = useState({
    id: data?.id || null,
    categoryId: data?.categoryId || "",
    amount: data?.amount || "",
    date: data?.date || "",
    isPeriodic: data?.isPeriodic || false,
    recurringPeriod: data?.recurringPeriod || "",
    notes: data?.notes || "",
  });

  // A hook that fetches all expense categories in the database.
  const expenseCategories = useFetchExpenseCategories();

  // Function that handles the change of a value in a field.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setExpenseData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : 
      type === "checkbox" ? checked : value,
    }));
  };


  // Function that handles the form's submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...expenseData,
      amount: Number(expenseData.amount),
      categoryId: Number(expenseData.categoryId)
    };

    // If the workmode is 'Add', a post request will be sent in order to add an expense
    if (mode === "add") 
    {
      await axios.post("http://localhost:3000/expense", payload, {
        withCredentials: true,
      });
    }
    // If the workmode is 'Edit', a patch request will be sent in order to update an expense
    else {
      await axios.patch("http://localhost:3000/expense", payload, {
        withCredentials: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Expense category */}
      <select
        name="categoryId"
        value={expenseData.categoryId}
        onChange={handleChange}
      >
        <option value="">Choose a category</option>
        {expenseCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Expense amount */}
      <label>Amount</label>
      <input
        name="amount"
        type="number"
        value={expenseData.amount}
        onChange={handleChange}
      />

      {/* Date of expense */}
      <label>Date</label>
      <input
        name="date"
        type="date"
        value={expenseData.date}
        onChange={handleChange}
      />

      {/* Is the expense periodic */}
      <label>
        <input
          name="isPeriodic"
          type="checkbox"
          checked={expenseData.isPeriodic}
          onChange={handleChange}
        />
        Periodic?
      </label>

      {/* If the expense is periodic, what is the recurring period */}
      {expenseData.isPeriodic && (
        <div>
          <label>Recurring Period</label>
          <select
            name="recurringPeriod"
            value={expenseData.recurringPeriod}
            onChange={handleChange}
          >
            <option value="">Choose...</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      )}

      {/* Additional information about the expense */}
      <label>Notes</label>
      <textarea
        name="notes"
        value={expenseData.notes}
        onChange={handleChange}
      />

      {/* The text in the submit button depends on the working mode of the component */}
      <button type="submit">
        {
          mode === "add" ? "Add Expense" : 
          mode === "edit" ? "Update Expense":
          "null"
        }
      </button>
    </form>
  );
};

export default ExpenseForm;
