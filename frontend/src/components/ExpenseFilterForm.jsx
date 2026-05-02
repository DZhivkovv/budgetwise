import { useEffect, useState } from 'react'
import useFetchExpenseCategories from '../hooks/useFetchExpenseCategories';
import useFilterExpenses from '../hooks/useFilterExpenses';

const ExpenseFilterForm = ({onClose}) => {
    const {expenseCategories, error: fetchingError, isLoading} = useFetchExpenseCategories();
    const {filters, error: filteringError, handleChange, handleSubmit} = useFilterExpenses();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        // Filter the expenses 
        const success = await handleSubmit(e);
        // If the filtering is successful, close the form
        if (success) onClose();
    };

    return isLoading ?
        <p>Loading categories...</p>
        :
        <form onSubmit={handleFormSubmit}>
            <h3>Filter expenses</h3>

            {/* Error message */}
            {fetchingError && <p className="g_error-message">{fetchingError}</p>}
            {filteringError && <p className="g_error-message">{filteringError}</p>}            

            <div>
            {expenseCategories.map((category) => (
                <label htmlFor={category.id} key={category.id}>

                <input 
                    type="checkbox" 
                    name={category.id} 
                    checked={filters.categories.includes(category.id)} 
                    onChange={handleChange} 
                />
                    {category.name}
                </label>
            ))}
            </div>
            <div>
                <label htmlFor='from'>
                    From:
                    <input 
                        type='date' 
                        name='from' 
                        value={filters.date.from || ""} 
                        onChange={handleChange}
                        className="g_form__input"
                    />
                </label>
            </div>
            <div>
                <label htmlFor='to'>
                    To:
                    <input 
                        type='date' 
                        name='to' 
                        value={filters.date.to || ""} 
                        onChange={handleChange}
                        className="g_form__input"
                    />
                </label>
            </div>
            <div>
                <label htmlFor='min'>
                    Minimal price:
                    <input
                        type='number' 
                        name='min' 
                        value={filters.price.min || ""} 
                        onChange={handleChange}
                        className="g_form__input"
                    />
                </label>
            </div>        
            <div>
                <label htmlFor='max'>
                    Maximal price:
                    <input 
                        type='number' 
                        name='max' 
                        value={filters.price.max || ""} 
                        onChange={handleChange}
                        className="g_form__input"
                    />
                </label>
            </div>        
            <div>
                <label htmlFor='notes'>
                    Notes:
                    <textarea 
                        name='notes' 
                        value={filters.notes} 
                        onChange={handleChange}
                        className="g_form__input"                        
                    />
                </label>
            </div>
            <button type="submit" className="g_form__submit">Submit</button>
        </form>            
}

export default ExpenseFilterForm