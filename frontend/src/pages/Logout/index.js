import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BudgetContext } from "../../context/BudgetContext";
import { ExpensesContext } from "../../context/ExpensesContext";
import { GoalContext } from "../../context/GoalContext";
import Loader from "../../components/Loader.jsx";

/**
 * LogoutPage Component.
 * * A component that triggers the logout flow
 * immediately upon mounting. It clears the authentication state and resets all
 * global application data (budgets, expenses, goals) before redirecting to the login page.
 * * @component
 * @returns {JSX.Element} A loading spinner during the logout transition.
 */
const LogoutPage = () => {
  const navigate = useNavigate();

  // Extract logout and reset actions from the contexts
  const { logoutUser } = useContext(AuthContext);
  const { resetBudget } = useContext(BudgetContext);
  const { resetExpenses } = useContext(ExpensesContext);
  const { resetGoals } = useContext(GoalContext);

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logoutUser(); // Perform API logout

        // Clear local context states (goals, expense and budget data)
        resetGoals();
        resetExpenses();
        resetBudget();

        navigate("/login");
      } catch (error) {
        // Navigate anyway despite the error to force a fresh start
        navigate("/login");
      }
    };

    doLogout();
  }, [logoutUser, navigate, resetBudget, resetExpenses, resetGoals]);

  // Display loading spinner while async logout process completes
  return <Loader />;
};

export default LogoutPage;
