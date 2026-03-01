import { useState, useEffect } from "react";
import useFetchExpenseCategories from "../hooks/useFetchExpenseCategories";

import formatDate from "../utils/date/formatDate";
import deleteIcon from '../assets/delete.png';

/**
 * ExpenseForm Component
 *
 * A form component used to add or edit a user's expense. 
 * Supports inline validation, error messages, and deletion (in edit mode).
 *
 * @component
 * @param {Object} props - Component props
 * @param {'add'|'edit'} props.mode - Determines whether the form is adding a new expense or editing an existing one
 * @param {Object} [props.data] - Pre-filled data for editing an expense (required in edit mode)
 * @param {Function} props.onSubmit - Callback function triggered on form submission, receives expense data
 * @param {Function} [props.onDelete] - Callback function triggered when deleting an expense (edit mode only)
 * @param {Function} props.onClose - Callback function triggered to close the form modal
 *
 * @returns {JSX.Element} The rendered expense form
 *
 * @example
 * <ExpenseForm
 *    mode="add"
 *    onSubmit={handleAddExpense}
 *    onClose={() => setShowForm(false)}
 * />
 */
const ExpenseForm = ({ mode, data, onSubmit, onDelete, onClose }) => {
  // Expense data
  const [expenseData, setExpenseData] = useState({
    id: data?.id ?? null,
    categoryId: data?.categoryId ?? "",
    amount: data?.amount ?? "",
    date: formatDate(data?.date),
    notes: data?.notes ?? "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  // Expense categories.
  const expenseCategories = useFetchExpenseCategories();
  // The title of the form depending on the working mode.
  const formTitle = mode === 'add' ? 'Add Expense' : 'Edit Expense';

  useEffect(() => {
    if (mode !== "edit" || !data) return;

    setExpenseData({
      id: data.id ?? null,
      categoryId: data.categoryId ?? "",
      amount: data.amount ?? "",
      date: formatDate(data.date),
      notes: data.notes ?? "",
    });
  }, [data]);

  // Handler function for expense data change.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setExpenseData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "categoryId"
          ? Number(value)
          : value,
    }));
  };

  // Handler function for expense data submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try 
    {
      // Add/edit expense (depending on the working mode) and close the form.
      await onSubmit(expenseData);

      onClose(); 
    } 
    catch (error) 
    {
      setErrorMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleExpenseDeletion = async () => {
    try 
    {
      // Delete the expense and close the form.
      onDelete(expenseData.id); 
      onClose(); 

    } 
    catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="g_form">
      <div className='g_items-in-a-row g_items-in-a-row--justify-content--space-between'>

        <h3>{formTitle}</h3>

        {mode === "edit" && (
          <button
            type="button"
            className="g_button-delete "
            onClick={handleExpenseDeletion}
          >
            <img 
              src={deleteIcon} 
              className='g_icon g_icon--size-24' 
              alt='Delete expense'
              title='Delete expense'
            />
          </button>
        )}
      </div>

      <div className='g_error-message-container'>
        {errorMessage && <p className="g_error-message">{errorMessage}</p>}
      </div>

      {/* Category */}
      <div className="g_form__group">
        <label className="g_form__label"> Category <span className="g_star">*</span> </label>
        <select
          name="categoryId"
          value={expenseData.categoryId}
          onChange={handleChange}
          className="g_form__input"
        >
          <option value="">Choose a category</option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="g_form__group">
        <label className="g_form__label">
          Amount<span className="g_star">*</span>
        </label>
        <input
          name="amount"
          type="number"
          className="g_form__input"
          value={expenseData.amount}
          onChange={handleChange}
        />
      </div>

      {/* Date */}
      <div className="g_form__group">
        <label className="g_form__label">
          Date<span className="g_star">*</span>
        </label>
        <input
          name="date"
          type="date"
          className="g_form__input"
          value={expenseData.date}
          onChange={handleChange}
        />
      </div>

      {/* Notes */}
      <div className="g_form__group">
        <label className="g_form__label">Notes</label>
        <textarea
          name="notes"
          className="g_form__textarea"
          value={expenseData.notes}
          placeholder="Additional information..."
          onChange={handleChange}
        />
      </div>

      <div>
        <button type="submit" className="g_form__submit">
          {mode === "add" ? "Add Expense" : "Update Expense"}
        </button>

      </div>
    </form>
  );
};

export default ExpenseForm;
