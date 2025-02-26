import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { CalculationRecord } from './Calculator';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface ComparisonChartProps {
    records: CalculationRecord[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ records }) => {
    const categoriesSet = new Set<string>();
    records.forEach(record => {
        record.expenses.forEach(exp => {
            categoriesSet.add(exp.category);
        });
    });
    const categories = Array.from(categoriesSet);

    const datasets = records.map(record => {
        const data = categories.map(category => {
            const expense = record.expenses.find(exp => exp.category === category);
            return expense ? expense.amount : 0;
        });
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        return {
            label: new Date(record.timestamp).toLocaleString(),
            data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
        };
    });

    const dataBar = {
        labels: categories,
        datasets: datasets,
    };

    const optionsBar = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Comparison Chart (Bar)' },
        },
    };

    const dataLine = {
        labels: categories,
        datasets: datasets.map(ds => ({
            ...ds,
            fill: false,
            tension: 0.1,
        })),
    };

    const optionsLine = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Comparison Chart (Line)' },
        },
    };

    return (
        <div className="comparison-chart">
            <h2>Comparison of Selected Records</h2>
            <div className="chart-container">
                <Bar data={dataBar} options={optionsBar} redraw />
            </div>
            <div className="chart-container">
                <Line data={dataLine} options={optionsLine} redraw />
            </div>
            <h3>Data Table</h3>
            <table>
                <thead>
                    <tr>
                        <th>Record</th>
                        {categories.map(category => (
                            <th key={category}>{category}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {records.map(record => (
                        <tr key={record.id}>
                            <td>{new Date(record.timestamp).toLocaleString()}</td>
                            {categories.map(category => {
                                const expense = record.expenses.find(exp => exp.category === category);
                                return <td key={category}>{expense ? expense.amount : 0}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ComparisonChart;
