import { useState, useEffect, createContext, useContext } from 'react'
import { getAllUserExpenses, addExpense, editExpense, deleteExpense } from '../services/expenseService';
import { AuthContext } from './AuthContext';
import { BudgetContext } from './BudgetContext';

import buildQueryParams from '../utils/buildQueryParams';
import { filterExpenses } from '../services/expenseService';

export const ExpensesContext = createContext({
    expenses: [],
    filters: {},
    loading: false,
    error: null,
    fetchExpenses: () => {},
    addUserExpense: () => {},
    editUserExpense: () => {},
    deleteUserExpense: () => {}, 
    resetExpenses: () => {},
    removeFilters: () => {},
});

// Initial expense filters
const initialFilters = {
    categories: [],
    date: {
        from: null,
        to: null
    },
    price: {
        min: "",
        max: ""
    },
    notes: ""
};

// Checks if filters are applied
const hasActiveFilters = (filters) => {
    return Boolean(
        filters.categories.length > 0 ||
        filters.date.from ||
        filters.date.to ||
        filters.price.min ||
        filters.price.max ||
        filters.notes.trim() !== ""
    );
};

export default function ExpensesProvider({children}) {
    // Contexts
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { refreshBudget } = useContext(BudgetContext);

    // State
    const [expenses, setExpenses] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [filtersAreApplied, setFiltersAreApplied] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    // Reset expenses
    const resetExpenses = () => {
        setExpenses([]);
    };

    // Fetch expenses
    const fetchExpenses = async (filter = null) => {
        setIsLoading(true); // Loading started
        setError(null);     // Clear errors        

        try
        {
            // Check if filters are applied and set state accordingly
            const activeFilters = filter || filters;
            setFiltersAreApplied(hasActiveFilters(activeFilters));
            
            // Get filtered or all expenses depending on whether filters are applied
            const params = buildQueryParams(activeFilters);
            const { data } = await filterExpenses(params);
            setExpenses(data.expenses);
        }
        catch (error) 
        {
            // Set and throw error
            setError(error);
            throw error;
        }
        finally
        {
            setIsLoading(false); // Loading ended
        }
    };

    // Add expense    
    const addUserExpense = async(data) => {
        setIsLoading(true); // Loading
        try 
        {
            await addExpense(data); // Add expense
            await fetchExpenses();  // Refetch expenses
            await refreshBudget();  // Refresh budget 
        } 
        catch (error) 
        {
            // Set and throw error
            setError(error);
            throw error;
        }
        finally
        {
            setIsLoading(false); // Loading ended
        }
    }

    // Edit an expense
    const editUserExpense = async(data) => {
        setIsLoading(true); // Loading started
        try
        {
            await editExpense(data); // Edit the expense
            await fetchExpenses();   // Refetch expenses
            await refreshBudget();   // Refresh budget 
        }
        catch (error)
        {
            // Set and throw error
            setError(error)
            throw error;
        }
        finally
        {
            setIsLoading(false); // Loading ended
        }
    }

    // Delete expense.
    const deleteUserExpense = async(id, data) => {
        setIsLoading(true); // Loading started

        try
        {
            await deleteExpense(id); // Delete expense
            await fetchExpenses();   // Refetch expenses
            await refreshBudget();   // Refresh budget

        }
        catch (error)
        {
            // Set and throw error
            setError(error); // Set error
            throw error
        }
        finally
        {
            setIsLoading(false); // Loading ended
        }
    }

    // Remove filters.
    const removeFilters = async() => {
        // Remove filters
        setFilters(initialFilters);
        // Fetch all expenses
        await fetchExpenses(initialFilters);
    }

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;
        fetchExpenses();
    }, [user]);

    return (
        <ExpensesContext.Provider value={{ 
            expenses, 
            filters,
            filtersAreApplied,
            setFilters,
            isLoading, 
            error, 
            fetchExpenses,
            addUserExpense, 
            editUserExpense, 
            deleteUserExpense,
            resetExpenses, 
            removeFilters
        }}>
            {children}
        </ExpensesContext.Provider>
    )
}