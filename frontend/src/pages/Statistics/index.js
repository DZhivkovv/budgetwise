import { MONTH_NAMES } from "../../constants/monthNames";
import { useContext, useEffect, useMemo, useState } from "react";

import ExpensesByCategoryPieChart from "./charts/ExpensesByCategoryPieChart";
import YearlyMonthlyBarChart from "./charts/YearlyMonthlyBarChart";

import { ExpensesContext } from "../../context/ExpensesContext";
import { BudgetContext } from "../../context/BudgetContext";

const StatisticsPage = () => {
  // Date / Year State
  const [pieDate, setPieDate] = useState(new Date());
  const [ringDate, setRingDate] = useState(new Date());
  const [barYear, setBarYear] = useState(new Date().getFullYear());
  const [comparisonYear, setComparisonYear] = useState(
    new Date().getFullYear(),
  );

  // Context
  const { expenses } = useContext(ExpensesContext);
  const { budget, refreshBudget, allBudgets, getAllBudgets } =
    useContext(BudgetContext);

  // Fetch all budgets
  useEffect(() => {
    const controller = new AbortController();

    const loadBudgets = async () => {
      try {
        getAllBudgets();
      } catch (error) {
        if (error.name !== "CanceledError") {
          //setBudgetError("Failed to load budgets");
        }
      }
    };

    loadBudgets();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    refreshBudget();
  }, []);

  // Helpers
  const isSameMonth = (date, ref) =>
    date.getMonth() === ref.getMonth() &&
    date.getFullYear() === ref.getFullYear();

  // Derived Data (useMemo)
  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      const date = new Date(e.date);
      if (!isSameMonth(date, pieDate)) return acc;

      const category = e.category?.name || "Uncategorized";
      acc[category] = (acc[category] || 0) + Number(e.amount);
      return acc;
    }, {});
  }, [expenses, pieDate]);

  const recurringVsNonRecurring = useMemo(() => {
    return expenses.reduce((acc, e) => {
      const date = new Date(e.date);
      if (!isSameMonth(date, ringDate)) return acc;

      const key = e.isPeriodic ? "Periodic" : "Non-periodic";
      acc[key] = (acc[key] || 0) + Number(e.amount);
      return acc;
    }, {});
  }, [expenses, ringDate]);

  const yearlyMonthlyTotals = useMemo(() => {
    return expenses.reduce((acc, e) => {
      const date = new Date(e.date);
      if (date.getFullYear() !== barYear) return acc;

      const month = date.getMonth();
      acc[month] = (acc[month] || 0) + Number(e.amount);
      return acc;
    }, {});
  }, [expenses, barYear]);

  // Chart Data
  const pieChartData = Object.entries(expensesByCategory).map(([x, y]) => ({
    x,
    y,
  }));
  const ringChartData = Object.entries(recurringVsNonRecurring).map(
    ([x, y]) => ({ x, y }),
  );
  const barChartData = Object.entries(yearlyMonthlyTotals).map(([m, y]) => ({
    x: MONTH_NAMES[m],
    y,
  }));

  return (
    <div>
      <div className="g_items-in-a-row">
        <ExpensesByCategoryPieChart
          date={pieDate}
          onPrev={() =>
            setPieDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
          }
          onNext={() =>
            setPieDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))
          }
          data={pieChartData}
          currency={budget.currency}
        />
      </div>

      <YearlyMonthlyBarChart
        year={barYear}
        onPrev={() => setBarYear((y) => y - 1)}
        onNext={() => setBarYear((y) => y + 1)}
        data={barChartData}
        currency={budget.currency}
      />
    </div>
  );
};

export default StatisticsPage;
