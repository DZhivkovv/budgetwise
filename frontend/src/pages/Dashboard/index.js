import useCheckIfUserHasMonthlyBudget from '../../hooks/useCheckIfUserHasMonthlyBudget';
import BudgetForm from '../../components/BudgetForm';
import ExpenseForm from '../../components/ExpenseForm';

// A dashboard page for budget and expenses management.
const DashboardPage = () => {
  // A custom hook that checks whether the user has a monthly budget or not.
  // Usage: Depending on the result (the value of hasBudget const), a different form will be rendered on the page.
  // If the user has budget (const hasBudget is true), a form for editing a budget will be rendered.
  // If the user has budget (const hasBudget is true), a form for adding a budget will be rendered.
  const {hasBudget:userHasBudget, budget}  = useCheckIfUserHasMonthlyBudget();    
  
  // Budget-related variables:
  // If the user has a budget, the workmode will be 'Edit' - editing the budget. Otherwise, the budget will be 'Add' - adding a budget.
  // Decides if form for budget adding or editing will be rendered.
  const budgetFormWorkmode = !userHasBudget ? 'add' : 'edit';
  // // If the user has a budget, this variable will contain the budget's amount. Otherwise, the value will be null.
  const budgetAmount = budget ? budget.amount : null;
  // // If the user has a budget, this variable will contain the budget's currency. Otherwise, the value will be null.
  const budgetCurrency = budget ? budget.currency : null;



    return (
    <div>
      {/* {/* A form for adding/editing a budget (depending on whether the user has a budget) */}
      <BudgetForm mode={budgetFormWorkmode} budget={budgetAmount} currency={budgetCurrency}/>

      {/* If the user has a budget, render a form for adding an expense. */}
      { userHasBudget && <ExpenseForm mode='add'/> }
    </div>
  )
}

export default DashboardPage