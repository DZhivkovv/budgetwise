// Import context providers responsible for different global states
import AuthProvider from '../context/AuthContext';        // Handles authentication state (user, login, logout)
import BudgetProvider from '../context/BudgetContext';    // Manages budget-related state
import ExpensesProvider from '../context/ExpensesContext';// Manages expenses state
import GoalProvider from '../context/GoalContext';        // Manages financial goals state

/**
 * AppProviders
 * 
 * This component wraps the entire application with all global context providers.
 * It ensures that authentication, budget, expenses, and goals state
 * are accessible throughout the app.
 * 
 * - AuthProvider is outermost because other providers may depend on authenticated user data.
 */
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <BudgetProvider>
        <ExpensesProvider>
          <GoalProvider>
            {children}
          </GoalProvider>
        </ExpensesProvider>
      </BudgetProvider>
    </AuthProvider>
  );
};

export default AppProviders;