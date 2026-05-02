import { useState, useContext } from "react";
import { BudgetContext } from "../../context/BudgetContext";
import { ExpensesContext } from "../../context/ExpensesContext";
import { AuthContext } from "../../context/AuthContext";
import { GoalContext } from "../../context/GoalContext";

// Components
import DashboardActions from "./DashboardActions";
import UserInfo from "./UserInfo/UserInfo";
import Calendar from "../../components/Calendar";
import BudgetForm from "../../components/BudgetForm";
import ExpenseForm from "../../components/ExpenseForm";
import ExpenseFilterForm from "../../components/ExpenseFilterForm";
import GoalForm from "../../components/goals/GoalForm";
import ActiveGoals from "../../components/goals/ActiveGoals";
import MonthlyBudgetReminder from "../../components/MonthlyBudgetModal";
import Modal from "../../components/modal/Modal";
import Loader from "../../components/Loader";
/**
 * DashboardPage Component
 * * The primary authenticated view of the application. It orchestrates user data,
 * monthly budgeting, expense tracking, and financial goal management.
 * * Features:
 * - Automatic budget refresh on mount.
 * - Monthly budget reminder via session-based check.
 * - Calendar integration for expense visualization.
 * - Centralized modal management for various forms (Budget, Expense, Goals).
 * * @component
 * @returns {JSX.Element} The rendered dashboard layout or a loader.
 */
const DashboardPage = () => {
  // Context
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { budget, isLoading: budgetLoading } = useContext(BudgetContext);
  const {
    expenses,
    filtersAreApplied,
    addUserExpense,
    editUserExpense,
    deleteUserExpense,
    removeFilters,
  } = useContext(ExpensesContext);
  const { goals, addGoal, editGoal, removeGoal } = useContext(GoalContext);

  const userHasBudgetForMonth = !!budget?.budget;
  // Derived state that determines what mode will the budget form work.
  // If the user doesn't have a budget, the form will be for adding a budget.
  // If he does, the form will be for editing that existing budget.
  const budgetFormMode = userHasBudgetForMonth ? "edit" : "add";

  // State
  const [monthlyReminder, setMonthlyReminder] = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [showActiveGoals, setShowActiveGoals] = useState(false);
  const [showFilterExpensesForm, setShowFilterExpensesForm] = useState(false);

  // Shared state for editing specific items
  const [expenseData, setExpenseData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Display loader if auth or budget state is still resolving
  if (authLoading || budgetLoading) return <Loader visibility />;

  return (
    <div className="dashboard-layout">
      {/* User Overview Section */}
      <UserInfo
        userData={user}
        budgetData={budget}
        onIconClick={() => setShowBudgetForm(true)}
      />

      {/* Interaction Buttons */}
      <DashboardActions
        hasBudget={userHasBudgetForMonth}
        onAddBudgetClick={() => setShowBudgetForm(true)}
        onAddGoalClick={() => setShowAddGoalForm(true)}
        onYourGoalsClick={() => setShowActiveGoals(true)}
        onAddExpenseClick={() => setShowAddExpenseForm(true)}
        onFilterExpensesClick={() => setShowFilterExpensesForm(true)}
        onResetFiltersClick={async () => await removeFilters()}
        filtersAreApplied={filtersAreApplied}
      />

      {/* Calendar */}
      <div className="cell calendar-wrapper" id="calendar">
        {userHasBudgetForMonth ? (
          <Calendar
            onDateClick={(dateStr) => {
              setSelectedDate(dateStr);
              setShowAddExpenseForm(true);
            }}
            expenses={expenses}
            onExpenseDataChange={setExpenseData}
            currency={budget.currency}
          />
        ) : (
          <div className="placeholder">Please, add a monthly budget</div>
        )}
      </div>

      {/* Modals */}

      {/* Create/ Edit budget */}
      {showBudgetForm && (
        <Modal onClose={() => setShowBudgetForm(false)}>
          <BudgetForm
            mode={budgetFormMode}
            onClose={() => setShowBudgetForm(false)}
          />
        </Modal>
      )}

      {/* Add new expense */}
      {showAddExpenseForm && (
        <Modal
          onClose={() => {
            setShowAddExpenseForm(false);
            setSelectedDate(null);
          }}
        >
          <ExpenseForm
            mode="add"
            data={{ date: selectedDate }}
            onSubmit={addUserExpense}
            onClose={() => {
              setShowAddExpenseForm(false);
              setSelectedDate(null);
            }}
          />
        </Modal>
      )}

      {/* Edit existing expense */}
      {expenseData && (
        <Modal onClose={() => setExpenseData(null)}>
          <ExpenseForm
            mode="edit"
            data={expenseData}
            onSubmit={editUserExpense}
            onDelete={deleteUserExpense}
            onClose={() => setExpenseData(null)}
          />
        </Modal>
      )}

      {/* Filter expenses */}
      {showFilterExpensesForm && (
        <Modal
          onClose={() => {
            setShowFilterExpensesForm(false);
          }}
        >
          <ExpenseFilterForm
            onClose={() => {
              setShowFilterExpensesForm(false);
            }}
          />
        </Modal>
      )}

      {/* Create new financial goal */}
      {showAddGoalForm && (
        <Modal onClose={() => setShowAddGoalForm(false)}>
          <GoalForm
            onSubmit={addGoal}
            onClose={() => setShowAddGoalForm(false)}
          />
        </Modal>
      )}

      {/* List and manage active goals */}
      {showActiveGoals && (
        <Modal onClose={() => setShowActiveGoals(false)}>
          <ActiveGoals goals={goals} onEdit={editGoal} onDelete={removeGoal} />
        </Modal>
      )}

      {/* Automated Monthly Budget Prompt */}
      {monthlyReminder?.remind && (
        <Modal onClose={() => setMonthlyReminder(null)}>
          <MonthlyBudgetReminder
            message={monthlyReminder.message}
            userHasBudget={userHasBudgetForMonth}
            onConfirm={() => {
              setMonthlyReminder(null);
              // Small delay to allow previous modal to clear before opening form
              setTimeout(() => setShowBudgetForm(true), 0);
            }}
            onClose={() => setMonthlyReminder(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
