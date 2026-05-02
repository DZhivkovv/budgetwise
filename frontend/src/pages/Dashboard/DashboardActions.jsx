import expense from '../../assets/expense.png';
import goal from '../../assets/goal.png';
import addBudget from '../../assets/addBudget.png';
import filter from '../../assets/filter.png';
import yourGoals from '../../assets/yourGoals.png';
import removeFilters from '../../assets/removeFilters.png';
import removeFiltersDisabled from '../../assets/removeFiltersDisabled.png';
import '../../styles/links_and_buttons.css'
import '../../styles/actions.css';

/**
 * DashboardActions component.
 *
 * Renders action buttons for the user dashboard depending on whether
 * the user has a budget.
 *
 * @param {Object} props
 * @param {boolean} props.hasBudget - Indicates if the user has an active budget.
 * @param {function} props.onAddBudgetClick - Callback when "Add Budget" button is clicked.
 * @param {function} props.onAddGoalClick - Callback when "Add Goal" button is clicked.
 * @param {function} props.onYourGoalsClick - Callback when "Your Goals" button is clicked.
 * @param {function} props.onAddExpenseClick - Callback when "Add Expense" button is clicked.
 */
const DashboardActions = ({hasBudget, onAddBudgetClick, onAddGoalClick, onYourGoalsClick, onAddExpenseClick, onFilterExpensesClick, onResetFiltersClick, filtersAreApplied}) => {
  return (
    <section className='g_actions-container'>
      {/* If the user doesn't have a budget, only show the Add Budget button */}
      {!hasBudget ? (
        <div className='g_items-in-a-row g_items-in-a-row--justify-content--center'>
          <button className="g_action-btn" onClick={onAddBudgetClick}>
            <img src={addBudget} className='g_action__icon g_action__icon--big' alt="Add budget" />
            <span>Add Budget</span>
          </button>
        </div>
      ) : (
        <div className='g_actions-grid'>
          {[
            // Rendering action buttons
            { icon: goal, label: "Add Goal", onClick: onAddGoalClick, alt: "Add goal" },
            { icon: yourGoals, label: "Your Goals", onClick: onYourGoalsClick, alt: "View your goals" },
            { icon: expense, label: "Add Expense", onClick: onAddExpenseClick, alt: "Add expense", disabled: !hasBudget },
            { icon: filter, label: "Filter Expenses", onClick: onFilterExpensesClick, alt: "Filter expenses", disabled: !hasBudget },
            { icon: filtersAreApplied ? removeFilters : removeFiltersDisabled, label: "Remove Filters", onClick: onResetFiltersClick, alt: "Remove Filters", disabled: !filtersAreApplied }

          ].map(({icon, label, onClick, alt, disabled}) => (
            <button key={label} className='g_action-btn' onClick={onClick} disabled={disabled} title={disabled ? "Add a budget first" : ""}>
              {/* Button icon */}
              <img src={icon} className='g_action__icon g_action__icon--big' alt={alt} />
              {/* Button label */}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </section>
      )
}

export default DashboardActions;