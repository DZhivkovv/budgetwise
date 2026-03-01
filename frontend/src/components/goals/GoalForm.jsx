import { useState, useEffect, useMemo } from "react";
import useFetchExpenseCategories from "../../hooks/useFetchExpenseCategories";

/**
 * GoalForm component
 *
 * Used to add or edit a user's financial (spending/ saving) goal.
 *
 * @param {Object} props
 * @param {function} props.onClose - Callback to close the form/modal
 * @param {function} props.onSubmit - Callback to handle submission, receives goal data object
 * @param {Object} [props.initialData={}] - Existing goal data for editing
 * @returns {JSX.Element} Form for creating or editing a goal
 */
const GoalForm = ({ onClose, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    targetAmount: "",
    deadline: "",
    categoryId: "",
    type: "saving",
    status: "active",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all categories (used for spending goals)
  const expenseCategories = useFetchExpenseCategories();

  /**
   * Initialize formData if editing an existing goal
   */
  useEffect(() => {
    if (initialData?.id) {
      setFormData({
        targetAmount: initialData.targetAmount || "",
        deadline: initialData.deadline || "",
        categoryId: initialData.categoryId || "",
        type: initialData.type || "saving",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);

  /**
   * Automatically set categoryId to "savings" if type is saving
   * Clear categoryId if type is spending
   */
  useEffect(() => {
    if (formData.type === "saving" && expenseCategories.length > 0) {
      const savingsCategory = expenseCategories.find(
        (c) => c.name.toLowerCase() === "savings"
      );
      if (savingsCategory) {
        setFormData((prev) => ({ ...prev, categoryId: String(savingsCategory.id) }));
      }
    } else if (formData.type === "spending") {
      setFormData((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [formData.type, expenseCategories]);

  /**
   * Filter out "savings" for spending categories
   */
  const spendingCategories = useMemo(
    () => expenseCategories.filter((c) => c.name.toLowerCase() !== "savings"),
    [expenseCategories]
  );

  /**
   * Handles input changes for all fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(""); // Reset error on change for better UX
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.targetAmount || !formData.deadline || !formData.categoryId) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      await onSubmit({
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline,
        categoryId: Number(formData.categoryId),
        type: formData.type,
        status: formData.status,
        ...(initialData.id ? { goalId: initialData.id } : {}),
      });
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || "Failed to save goal");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="g_form">
      {errorMessage && <p className="g_error-message">{errorMessage}</p>}

      <h3>{initialData.id ? "Edit Goal" : "Add Goal"}</h3>

      {/* Target Amount */}
      <div className="g_form__group">
        <label className="g_form__label">
          Savings target <span className="g_star">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          name="targetAmount"
          value={formData.targetAmount}
          className="g_form__input"
          onChange={handleChange}
        />
      </div>

      {/* Deadline */}
      <div className="g_form__group">
        <label className="g_form__label">
          Deadline <span className="g_star">*</span>
        </label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          className="g_form__input"
          onChange={handleChange}
        />
      </div>

      {/* Category selection for spending goals */}
      {formData.type === "spending" && (
        <div className="g_form__group">
          <label className="g_form__label">
            Category <span className="g_star">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="g_form__input"
          >
            <option value="">Choose a category</option>
            {spendingCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Goal Type */}
      <div className="g_form__group">
        <label className="g_form__label">
          Type <span className="g_star">*</span>
        </label>
        <div className="g_form__radio-group">
          {["saving", "spending"].map((type) => (
            <label key={type} className="g_form__radio-label">
              <input
                type="radio"
                name="type"
                value={type}
                checked={formData.type === type}
                onChange={handleChange}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="g_form__submit">
        {initialData.id ? "Update goal" : "Add goal"}
      </button>
    </form>
  );
};

export default GoalForm;