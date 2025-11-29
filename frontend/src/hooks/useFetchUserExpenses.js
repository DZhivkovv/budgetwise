import { useEffect, useState } from "react";
import axios from "axios";

// Custom hook for fetching all expenses belonging to the authenticated user
const useFetchUserExpenses = () => {
    // Stores the list of user expenses returned from the backend
    const [expenses, setExpenses] = useState([]);
    // Tracks whether the request is still loading
    const [loading, setLoading] = useState(true);
    // Stores any error that occurs during the request
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize controller that allows to cancel the request if the component unmounts
        const controller = new AbortController();

        // Fetch user expenses
        const fetchExpenses = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:3000/expense",
                    {
                        withCredentials: true,
                        signal: controller.signal, // attaches abort signal to request
                    }
                );

                // Update state with the fetched expenses
                setExpenses(res.data.expenses);
            } catch (err) {
                // Ignore the error if the request was intentionally canceled
                if (axios.isCancel(err)) return;

                // Store the error for UI handling
                setError(err);
            } finally {
                // Loading is finished regardless of success or failure
                setLoading(false);
            }
        };

        // Trigger the fetch on mount
        fetchExpenses();

        // Cleanup function: aborts the request if the component unmounts
        return () => controller.abort();
    }, []);

    // Return the data, loading state, and error for consumption in components
    return { expenses, loading, error };
};

export default useFetchUserExpenses;
