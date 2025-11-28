import { useEffect, use, useState } from "react";
import axios from "axios";
// Custom hook that fetches expense categories
const useFetchExpenseCategories = () => {
    const [expenseCategories, setExpenseCategories] = useState([]);

    useEffect(()=>{
        axios.get("http://localhost:3000/category", { withCredentials: true })
        .then(res => setExpenseCategories(res.data));
    },[]);

    return expenseCategories;
};

export default useFetchExpenseCategories;