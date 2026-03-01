/**
 * MonthlyBudgetReminder Component
 *
 * Displays a reminder modal prompting the user to create or update
 * their monthly budget.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Main reminder message displayed to the user
 * @param {Function} props.onConfirm - Callback triggered when the user confirms (add/update budget)
 * @param {Function} props.onClose - Callback triggered when the user dismisses the reminder
 * @param {boolean} props.userHasBudget - Indicates whether the user already has an existing budget
 *
 * @returns {JSX.Element} The rendered monthly budget reminder UI
 */
const MonthlyBudgetReminder = ({ message, onConfirm, onClose, userHasBudget }) => {
  return (
    <div className="monthly-budget-reminder">
      <h2>Monthly Budget</h2>

      <p style={{ marginTop: "1rem" }}>
        {message}
      </p>

      {userHasBudget === true && (
        <p style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.5rem" }}>
          You can update your existing budget or keep it unchanged.
        </p>
      )}

      <div
        className="actions"
        style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}
      >
        <button
          className="primary-btn"
          onClick={onConfirm}
        >
          {userHasBudget ? "Update budget" : "Add budget"}
        </button>

        <button
          className="secondary-btn"
          onClick={onClose}
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default MonthlyBudgetReminder;