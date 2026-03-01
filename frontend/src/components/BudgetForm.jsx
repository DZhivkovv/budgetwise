import { useContext, useState, useEffect } from "react";
import { BudgetContext } from "../context/BudgetContext";

/**
 * BudgetForm Component
 *
 * A form component for adding or editing a user's monthly budget.
 *
 * @component
 * @param {Object} props - Component props
 * @param {'add'|'edit'} props.mode - Determines whether the form is adding a new budget or editing an existing one
 * @param {Function} props.onClose - Callback function to close the form modal
 *
 * @returns {JSX.Element} The rendered budget form
 *
 * @example
 * <BudgetForm mode="add" onClose={() => setShowForm(false)} />
 */
const BudgetForm = ({ mode, onClose }) => {
  const { budget: userBudget, addBudget, editBudget, refreshBudget } =
    useContext(BudgetContext);

  const [formData, setFormData] = useState({
    budget: userBudget?.budget || "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData({
      budget: userBudget?.budget || "",
    });
  }, [userBudget]);

  const submitButtonText = mode === "add" ? "Add Budget" : "Edit Budget";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      budget: Number(formData.budget),
      currency: userBudget.currency
    };

    try {
      if (mode === "add") {
        await addBudget(payload);
      } else if (mode === "edit") {
        await editBudget(payload);
      }

      refreshBudget();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setErrorMessage(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="g_form">
      {errorMessage && (
        <p className="g_error-message">{errorMessage}</p>
      )}

      <h3>{mode === "add" ? "Add Budget" : "Edit Budget"}</h3>

      {/* Budget Amount */}
      <div className="g_form__group">
        <label className="g_form__label">
          Budget (€)<span className="g_star">*</span>
        </label>

        <input
          name="budget"
          type="number"
          step="1"
          min="0"
          placeholder="e.g. 1200"
          value={formData.budget}
          className="g_form__input"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setFormData((prev) => ({
              ...prev,
              budget: isNaN(value) ? "" : value,
            }));
          }}
        />

        <small className="g_form__hint">
          Enter your monthly budget in euros (€)
        </small>
      </div>

      <button type="submit" className="g_form__submit">
        {submitButtonText}
      </button>
    </form>
  );
};

export default BudgetForm;
