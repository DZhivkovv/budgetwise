import { useState, useEffect } from "react";
import axios from "axios";

// A form component for adding and editing user budget.
// The component receives a 'mode' prop that determines whether the form will add or edit a user budget.
const BudgetForm = ({ mode, budget = null, currency = null }) => {
  // A state tracking the user's budget data
  const [budgetData, setBudgetData] = useState({
    budget: budget || "",
    currency: currency || "",
  });

  // Currencies available for selection
  const currencies = ["BGN", "EUR", "USD"];

  // Sync incoming props to state
  useEffect(() => {
    if (budget !== null) setBudgetData(prev => ({ ...prev, budget }));
    if (currency !== null) setBudgetData(prev => ({ ...prev, currency }));
  }, [budget, currency]);
  

  // Text that will appear in the form's submit button
  // The text will depend on the form's workmode (Add / Edit)
  const submitButtonText = mode === "add" ? "Add Budget" : "Edit Budget";

  // Function that will handle the form's submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If the workmode is 'Add', a post request will be sent in order to add a user budget
    if (mode === 'add')
    {
      await axios.post('http://localhost:3000/budget', {budget: budgetData.budget, currency: budgetData.currency}, { withCredentials: true }  );
    }
    // If the workmode is 'Edit', a patch request will be sent in order to update the user's budget
    else if ( mode === 'edit')
    {
      await axios.patch('http://localhost:3000/budget',{budget: budgetData.budget, currency: budgetData.currency}, { withCredentials: true }  );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Budget:</label>
        <input
          name="amount"
          type="number"
          value={budgetData.budget}
          onChange={(e) =>
            setBudgetData((prev) => ({ ...prev, budget: e.target.value }))
          }
        />
      </div>

      <label>Currency:</label>
      <select
        name="currency"
        value={budgetData.currency}
        onChange={(e) =>
          setBudgetData((prev) => ({ ...prev, currency: e.target.value }))
        }
      >
        <option value="">Choose a currency</option>
        {currencies.map((curr) => (
          <option key={curr} value={curr}>
            {curr}
          </option>
        ))}
      </select>

      <button type="submit">{submitButtonText}</button>
    </form>
  );
};

export default BudgetForm;


