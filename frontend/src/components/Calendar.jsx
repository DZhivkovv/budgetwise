import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// Calendar component that displays the user's expenses.
export default function Calendar({onDateClick, expenses, onExpenseDataChange, currency}) {
  // Convert expenses to FullCalendar format when expensesData changes
  const formattedExpenses = useMemo(() => {
    // If there are no expenses, returns an empty array.
    if (!expenses) return [];

    return expenses.map(expense => ({
      // Title includes category name, amount, and currency
      title: `${expense.category.name} - ${expense.amount} ${currency}`,
      date: expense.date, 
      // Store all original data in extendedProps for easy access on eventClick
      extendedProps: {
        id: expense.id,
        categoryId: expense.categoryId,
        amount: expense.amount,
        currency: currency,
        date: expense.date,
        isPeriodic: expense.isPeriodic,
        recurringPeriod: expense.recurringPeriod,
        notes: expense.notes,
      }
    }));
  }, [expenses, currency]); // Added currency to dependency array

  return (
    <div className='g_calendar-wrapper'>
      <FullCalendar
        plugins={[ interactionPlugin, dayGridPlugin]}
        initialView="dayGridMonth"
        events={formattedExpenses}
        dateClick={(info) => {
          info.jsEvent.preventDefault();
          onDateClick(info.dateStr);
        }}
        eventClick={info => {
          info.jsEvent.preventDefault();
          // Extract data from extendedProps to populate the edit form
          const { id, categoryId, amount, currency, date, isPeriodic, recurringPeriod, notes } = info.event.extendedProps;
          // Call onExpenseDataChange to trigger showing the edit form.
          onExpenseDataChange({id, categoryId, amount, currency, date, isPeriodic, recurringPeriod, notes});
        }}
      />
    </div>
  );
}