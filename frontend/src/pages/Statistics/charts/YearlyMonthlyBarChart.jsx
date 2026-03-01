import { VictoryTheme, VictoryChart, VictoryAxis, VictoryBar } from 'victory';

const YearlyMonthlyBarChart = ({ year, onPrev, onNext, data, currency}) => {
  return (
    <div className='g_statistics-card g_statistics-card--width--full'>
        <h3 className='g_card-title'>Monthly Expenses (Yearly View)</h3>

        <div>
            <button onClick={onPrev}>&larr;</button>
            <span>{year}</span>
            <button onClick={onNext}>&rarr;</button>
        </div>

        {data.length > 0 ? 
        <VictoryChart 
            theme={VictoryTheme.material} 
            width={1540} 
            height={250} 
        >
            <VictoryAxis 
                style={{ 
                    tickLabels: { fontSize: 9, padding: 5, fill: "#4b5563" }, 
                    axis: { stroke: "#b0bec5" }
                }}
            />
               <VictoryAxis dependentAxis 
                   // Y-axis: Amount
                   tickFormat={(x) => (`${x.toFixed(0)} ${currency}`)} 
                   style={{ 
                       tickLabels: { fontSize: 9, fill: "#4b5563" },
                       axis: { stroke: "#b0bec5" },
                       grid: { stroke: "#e0e0e0" }
                   }}
               />
               <VictoryBar 
                   data={data} 
                   barRatio={0.7}
                   labels={({ datum }) => `${datum.y.toFixed(0)} ${currency}`}
               />
             </VictoryChart> : <p>No expenses found for {year}.</p>}
    </div>
  )
}

export default YearlyMonthlyBarChart;