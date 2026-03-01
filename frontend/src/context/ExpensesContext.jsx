import { useState, useEffect, createContext, useContext } from 'react'
import { getAllUserExpenses, addExpense, editExpense, deleteExpense } from '../services/expenseService';

import { AuthContext } from './AuthContext';
import { BudgetContext } from './BudgetContext';

export const ExpensesContext = createContext({
    expenses: [],
    loading: false,
    error: null,
    fetchExpenses: () => {},
    addUserExpense: () => {},
    editUserExpense: () => {},
    deleteUserExpense: () => {}, 
    resetExpenses: () => {},
});

export default function ExpensesProvider({children}) {
    // User data
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { refreshBudget } = useContext(BudgetContext);

    // States:
    const [expenses, setExpenses] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const resetExpenses = () => {
        setExpenses([]);
    };

    // Fetch all user expenses. (Centralized Loading/Error handling)
    const fetchExpenses = async () => {
        setIsLoading(true);
        setError(null); // Clear previous errors
        try
        {
            // Fetch the expenses and set them as a state.
            const { data } = await getAllUserExpenses();
            setExpenses(data.expenses);
        }
        catch (error) 
        {
            // Set error
            setError(error);
        }
        finally
        {
            setIsLoading(false);
        }
    };

    // Add an expense.    
    const addUserExpense = async(data) => {
        setIsLoading(true);
        try 
        {
            await addExpense(data);
            // Refetch expenses if adding the expense is successful.
            await fetchExpenses();
            // Refresh budget if adding the expense is successful.
            await refreshBudget(); 
        } 
        catch (error) 
        {
            // If the adding expense fails, reset loading and set error.
            setIsLoading(false); 
            setError(error);
            throw error;
        }
    }

    // Edit an expense
    const editUserExpense = async(data) => {
        setIsLoading(true);
        try
        {
            // Edit the expense
            await editExpense(data); 
            // Refetch expenses if the editing is successful.
            await fetchExpenses(); 
            // Refresh budget if adding the expense is successful.
            await refreshBudget(); 
        }
        catch (error)
        {
            // If editing the expense fails, reset loading and set error.
            setIsLoading(false); 
            setError(error)
            throw error;
        }
    }

    // Deleting an expense.
    const deleteUserExpense = async(id, data) => {
        setIsLoading(true);
        try
        {
            // Deleting the expense.
            await deleteExpense(id); 
            // Refetch expenses if the deletion is successful.
            await fetchExpenses(); 
            // Refresh budget if adding the expense is successful.
            await refreshBudget(); 
        }
        catch (error)
        {
            // If deleting the expense fails, reset loading and set error.
            setError(error)
            setIsLoading(false); 
        }
    }
    
    // Initial fetch of expenses and re-fetch when user/auth state changes
    useEffect(() => {
        if (authLoading) return;
        
        if (!user) {
            resetExpenses();
            setError(null);
            setIsLoading(false);
            return;
        }

        // Use a flag to prevent state updates if the component unmounts
        let isMounted = true; 
        
        const initialFetch = async () => {
            // Only set loading/error states if component is still mounted
            if (isMounted) setIsLoading(true);
            
            try 
            {
                const {data} = await getAllUserExpenses();
                if (isMounted) 
                {
                    // Check for nested data structure access based on your service structure
                    setExpenses(data.expenses);
                    setError(null);
                }
            } 
            catch (error) 
            {
                if (isMounted) 
                {
                    setError(error);
                }
            } 
            finally 
            {
                if (isMounted) 
                {
                    setIsLoading(false);
                }
            }
        };

        initialFetch();

        // Cleanup function to prevent state updates on an unmounted component
        return () => {
            isMounted = false;
        };
    }, [user, authLoading]); // Dependencies ensure this runs when user/auth state changes

    return (
        <ExpensesContext.Provider value={{ 
            expenses, 
            isLoading, 
            error, 
            fetchExpenses,
            addUserExpense, 
            editUserExpense, 
            deleteUserExpense,
            resetExpenses, 
        }}>
            {children}
        </ExpensesContext.Provider>
    )
}