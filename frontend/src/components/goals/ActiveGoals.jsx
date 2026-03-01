import '../../styles/goals.css'

/**
 * Goal component.
 *
 * Displays a single financial goal card with:
 * - Goal type (saving/spending)
 * - Associated category
 * - Deadline
 * - Progress (current vs target amount)
 * - Delete button
 *
 * @component
 * @param {Object} props
 * @param {Object} props.goalData - Goal data object.
 * @param {number|string} props.goalData.id - Unique goal identifier.
 * @param {number|string} props.goalData.targetAmount - Target amount for the goal.
 * @param {number|string} props.goalData.currentAmount - Current accumulated amount.
 * @param {string} props.goalData.type - Goal type ("saving" | "spending").
 * @param {string} props.goalData.deadline - Goal deadline date.
 * @param {Object} props.goalData.category - Associated category object.
 * @param {string} props.goalData.category.name - Category name.
 * @param {(goalId: number|string) => void} props.onDelete - Callback triggered when deleting the goal.
 *
 * @returns {JSX.Element}
 */
const Goal = ({ goalData, onDelete }) => {
  // Target saving/spending amount.
  const target = Number(goalData.targetAmount);

  // Current saved/spent amount.
  const current = Number(goalData.currentAmount);

  return (
    <div className="goals__card">
      <div className="goals__info">
        {/* Goal information */}
        <p className="goals__text">
          {goalData.type} for {goalData.category.name}
        </p>

        {/* Goal deadline */}
        <p className="goals__text">
          Deadline: {goalData.deadline}
        </p>

        {/* Target and current saving/spending amount */}
        <p className="goals__amount">
          €{current.toFixed(2)} / €{target.toFixed(2)}
        </p>
      </div>

      {/* Delete goal */}
      <div className="goals__actions">
        <button
          className="goals__delete-button"
          onClick={() => onDelete(goalData.id)}
        >
          Remove Goal
        </button>
      </div>
    </div>
  );
};


/**
 * ActiveGoals component.
 *
 * Renders a list of all active goals.
 * If no goals exist, displays a fallback message.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.goals - Array of goal objects.
 * @param {(goalId: number|string) => void} props.onDelete - Callback triggered when a goal is removed.
 *
 * @returns {JSX.Element}
 */
const ActiveGoals = ({ goals, onDelete }) => {
  if (!goals || goals.length === 0) {
    return <p className="goals__none">No active goals yet.</p>;
  }

  return (
    <div className="goals__container">
      <h3 className="goals__title">Active Goals</h3>

      <div className="goals__layout">
        {goals.map((goal) => (
          <Goal
            key={goal.id}
            goalData={goal}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveGoals;