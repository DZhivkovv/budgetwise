import { MONTH_NAMES } from '../../../constants/monthNames'
import { VictoryPie } from 'victory'
import { VictoryTheme } from 'victory'
const ExpensesByCategoryPieChart = ({ date, onPrev, onNext, data, currency}) => {
  return (
    <div className='g_statistics-card'>
        <h3 className='g_card-title'>Expenses by Category:</h3>

        <div style={{display:'flex', justifyContent:'space-evenly'}}>
            <button onClick={onPrev}>&larr;</button>
            <span>{MONTH_NAMES[date.getMonth()]} {date.getFullYear()}</span>
            <button onClick={onNext}>&rarr;</button>
        </div>

        {
        data.length > 0 ? 
        <VictoryPie
            theme={VictoryTheme.material}
                    radius={100} 
            style={{ labels: { fontSize: 9, fill: "#37474f" } }}
            data={data}
            labels={({ datum }) => `${datum.x}\n ${datum.y.toFixed(0)} ${currency}`}
            labelRadius={({ radius }) => radius + 10}
            padding={{ top: 10, bottom: 10, left: 30, right: 30 }}
        /> 
        : 
        <p>No expenses for this month.</p>
        }
    </div>
  )
}

export default ExpensesByCategoryPieChart