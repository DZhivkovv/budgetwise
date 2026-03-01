import edit from '../../../assets/edit.png';
import './UserInfo.css';

/**
 * UserInfo component.
 *
 * Displays user's information and user's budget overview.
 * Includes:
 *  - User full name
 *  - Monthly budget (amount + currency)
 *  - Budget period (start & end dates)
 *  - Remaining budget
 *  - Progress bar showing spent vs remaining
 *
 * @param {Object} props
 * @param {Object} props.userData - User information object.
 * @param {string} props.userData.firstName - User's first name.
 * @param {string} props.userData.lastName - User's last name.
 * @param {Object} props.budgetData - Budget information object.
 * @param {number} props.budgetData.budget - Total monthly budget.
 * @param {number} props.budgetData.remainingBudget - Remaining budget.
 * @param {string} props.budgetData.currency - Currency symbol or code.
 * @param {string} props.budgetData.startDate - Budget start date (ISO string).
 * @param {string} props.budgetData.endDate - Budget end date (ISO string).
 * @param {function} props.onIconClick - Callback for edit budget icon click.
 */
const UserInfo = ({ userData, budgetData, onIconClick }) => {
  // If user or budget data is missing, nothing will be rendered
  if (!userData || !budgetData) return null;

  // Helper function to format date as DD MMM YYYY (e.g., 28 Feb 2026)
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <section className="user-info">
      {/* User Identity */}
      <div className="user-info__header">
        <span className="user-info__label">Name</span>
        <h2 className="user-info__name">
          {userData.firstName} {userData.lastName}
        </h2>
      </div>

      {/* Budget Overview */}
      <div className="user-info__budget-row">
        <span className="user-info__label">Monthly Budget</span>
        <div className="user-info__budget-value-container">
          <span className="user-info__budget-amount">
            {budgetData.budget
              ? `${budgetData.budget} ${budgetData.currency}`
              : '-'}
          </span>
          {/* Edit budget button only if budget exists */}
          {
          budgetData.budget
            ? 
            <button className="user-info__edit-btn" onClick={onIconClick}>
              <img src={edit} className="user-info__edit-icon" alt="Edit" />
            </button>
            : null
          }
        </div>
      </div>

      {/* Budget Period */}
      <div className="user-info__period">
        <span className="user-info__label">Period</span>
        <div className="user-info__period-value">
          {budgetData.startDate && budgetData.endDate
            ? `${formatDate(budgetData.startDate)} – ${formatDate(budgetData.endDate)}`
            : '-'}
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="user-info__remaining">
        <span className="user-info__label">Remaining</span>
        <div className="user-info__remaining-value">
          {budgetData.budget
            ? `${budgetData.remainingBudget} ${budgetData.currency}`
            : '-'}
        </div>
      </div>

      {/* Progress bar showing spent vs remaining */}
      <div className="user-info__progress-container">
        <progress
          className="user-info__progress-bar"
          value={budgetData.remainingBudget || 0}
          max={budgetData.budget || 100}
        />
      </div>

    </section>
  );
};

export default UserInfo;
