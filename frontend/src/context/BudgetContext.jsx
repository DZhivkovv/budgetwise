import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createBudget, updateBudget, getActiveUserBudget, getAllUserBudgets } from '../services/budgetService';
import { AuthContext } from './AuthContext';

export const BudgetContext = createContext({
    budget: { budget: "", remainingBudget: "", currency: "" },
    allBudgets: [],
    isLoading: false,
    error: null,
    addBudget: () => {},
    editBudget: () => {},
    refreshBudget: () => {},
    resetBudget: () => {},
    fetchAllBudgets: () => {},
});

export default function BudgetProvider({ children }) {
    const { user, isLoading: authLoading } = useContext(AuthContext);

    const [budget, setBudget] = useState({
        budget: "",
        remainingBudget: "",
        currency: "",
    });
    const [allBudgets, setAllBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const addBudget = async(data) => {
      setIsLoading(true);
      try 
      {
        await createBudget(data);
        refreshBudget();
    } 
      catch (error) 
      {
        setError(error);
      }
      finally
      {
        setIsLoading(false); 
      }
    }

    const editBudget = async(data) => {
      setIsLoading(true);
      try
      {
        await updateBudget(data);
        refreshBudget();
      }
      catch (error)
      {
        setError(error);
      }
      finally
      {
        setIsLoading(false); 
      }
    }

    const refreshBudget = useCallback(async () => {
        setReloadKey(prev => prev + 1);
    },[]);

    const resetBudget = () => {
        setBudget({ budget: "", remainingBudget: "", currency: "" });
        setAllBudgets([]);
        setError(null);
        setIsLoading(false);
    };

    const fetchAllBudgets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await getAllUserBudgets();
            setAllBudgets(data.allBudgets);
            return data;
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch active budget
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            resetBudget();
            return;
        }

        const abortController = new AbortController();

        const loadBudget = async () => {
            setIsLoading(true);
            setError(null);

            try 
            {
              const { data } = await getActiveUserBudget(abortController.signal);
              setBudget(data);
            } 
            catch (error) {
              if (error.name !== 'CanceledError') {
                  setError(error);
              }
            } 
            finally 
            {
              setIsLoading(false);
            }
        };

        loadBudget();

        return () => abortController.abort();
    }, [user, authLoading, reloadKey]);

    return (
        <BudgetContext.Provider
            value={{
                budget,
                allBudgets,
                isLoading,
                error,
                addBudget,
                editBudget,
                refreshBudget,
                resetBudget,
                fetchAllBudgets,
            }}
        >
            {children}
        </BudgetContext.Provider>
    );
}
