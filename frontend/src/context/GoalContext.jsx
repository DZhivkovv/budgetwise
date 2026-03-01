import { createContext, useState, useEffect, useContext } from "react";
import { ExpensesContext } from "./ExpensesContext";
import { getGoals, createGoal, deleteGoal } from "../services/goalService";

export const GoalContext = createContext({
    goals: [],
    isLoading: false,
    addGoal: () => {},
    editGoal: () => {},
    removeGoal: () => {},
    resetGoals: () => {},
  });

export default function GoalProvider({ children }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { expenses } = useContext(ExpensesContext); // subscribe to expenses

  const fetchGoals = async () => {
    setIsLoading(true);
    try 
    {
      const { data } = await getGoals();
      setGoals(data.goals);
    } 
    catch (error) 
    {
      console.error("Failed to fetch goals:", error);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };

  const addGoal = async (goalData) => {
    try 
    {
      await createGoal(goalData);
      fetchGoals(); // Refetch after adding a new goal
    } 
    catch (error) {
      console.error("Failure adding a goal", error);
    }
  };

  const editGoal = async (goalData) => {
    try
    {
      await editGoal(goalData);
      fetchGoals(); //Refetch after editing goal.
    }
    catch (error) 
    {
      console.error("Failure editing goal", error);
    }    
  }

  const removeGoal = async (goalId) => {
    try
    {
      await deleteGoal(goalId);
      fetchGoals(); // Refetch after deleting a goal
    }
    catch(error)
    {
      console.error("Failure deleting goal", error);
    }
  }

  const resetGoals = () => {
    setGoals([]);    
  }
  // Fetch goals on mount and whenever expenses change
  useEffect(() => {
    fetchGoals();
  }, [expenses]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        isLoading,
        addGoal,
        editGoal,
        removeGoal,
        resetGoals,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}
