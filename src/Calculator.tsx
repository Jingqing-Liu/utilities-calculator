import React, { useState, useEffect } from 'react';
import ComparisonChart from './ComparisonChart';
import './styles.css';

const defaultExpenses = [
    { id: 1, category: 'Water Bill', amount: 0 },
    { id: 2, category: 'Electricity Bill', amount: 0 },
    { id: 3, category: 'Internet Bill', amount: 0 },
];

interface Expense {
    id: number;
    category: string;
    amount: number;
}

export interface CalculationRecord {
    id: number;
    timestamp: number;
    expenses: Expense[];
    people: number;
    advanced: boolean;
    percentages: number[];
    result: string;
}

const Calculator: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
    const [people, setPeople] = useState<number>(0);
    const [result, setResult] = useState<string>('');
    const [newCategory, setNewCategory] = useState<string>('');
    const [advanced, setAdvanced] = useState<boolean>(false);
    const [percentages, setPercentages] = useState<number[]>([]);
    const [records, setRecords] = useState<CalculationRecord[]>([]);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [showComparison, setShowComparison] = useState<boolean>(false);

    useEffect(() => {
        const storedRecords = localStorage.getItem('calculationRecords');
        if (storedRecords) {
            setRecords(JSON.parse(storedRecords));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('calculationRecords', JSON.stringify(records));
    }, [records]);

    const handleExpenseChange = (id: number, value: number) => {
        setExpenses(expenses.map(exp => exp.id === id ? { ...exp, amount: value } : exp));
    };

    const addCategory = () => {
        if (newCategory.trim() === '') return;
        const newId = expenses.length > 0 ? Math.max(...expenses.map(exp => exp.id)) + 1 : 1;
        setExpenses([...expenses, { id: newId, category: newCategory, amount: 0 }]);
        setNewCategory('');
    };

    const deleteCategory = (id: number) => {
        setExpenses(expenses.filter(exp => exp.id !== id));
    };

    useEffect(() => {
        if (advanced && people > 0) {
            const equalPercentage = parseFloat((100 / people).toFixed(2));
            setPercentages(new Array(people).fill(equalPercentage));
        }
    }, [people, advanced]);

    const calculate = () => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        let calculatedResult = '';
        if (advanced) {
            const sumPercentages = percentages.reduce((sum, p) => sum + p, 0);
            if (Math.abs(sumPercentages - 100) > 0.01) {
                setResult(`Total percentages must equal 100%. Current total: ${sumPercentages.toFixed(2)}%`);
                return;
            }
            const results = percentages.map(
                (p, i) => `Person ${i + 1}: ${(total * (p / 100)).toFixed(2)} USD`
            );
            calculatedResult = results.join(' | ');
        } else {
            if (people <= 0) {
                setResult('Please enter a valid number of people (greater than 0)');
                return;
            }
            const perPerson = total / people;
            calculatedResult = `Total Expense: ${total.toFixed(2)} USD, Each Person Pays: ${perPerson.toFixed(2)} USD`;
        }
        setResult(calculatedResult);

        const newRecord: CalculationRecord = {
            id: Date.now(),
            timestamp: Date.now(),
            expenses: expenses.map(exp => ({ ...exp })), // 深拷贝
            people,
            advanced,
            percentages: [...percentages],
            result: calculatedResult,
        };
        setRecords([...records, newRecord]);
    };

    const clearValues = () => {
        setExpenses(expenses.map(exp => ({ ...exp, amount: 0 })));
        setPeople(0);
        setResult('');
        setNewCategory('');
        setPercentages([]);
    };

    const restoreDefaults = () => {
        setExpenses(defaultExpenses);
        setPeople(0);
        setResult('');
        setNewCategory('');
        setAdvanced(false);
        setPercentages([]);
    };

    const loadRecord = (record: CalculationRecord) => {
        setExpenses(record.expenses.map(exp => ({ ...exp })));
        setPeople(record.people);
        setAdvanced(record.advanced);
        setPercentages([...record.percentages]);
        setResult(record.result);
        setNewCategory('');
    };

    const deleteRecord = (id: number) => {
        setRecords(records.filter(record => record.id !== id));
        setSelectedRecordIds(selectedRecordIds.filter(rid => rid !== id));
    };

    const handleSelectRecord = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedRecordIds([...selectedRecordIds, id]);
        } else {
            setSelectedRecordIds(selectedRecordIds.filter(rid => rid !== id));
        }
    };

    const selectedRecords = records.filter(record => selectedRecordIds.includes(record.id));

    return (
        <div className="calculator-container">
            <div className="calculator">
                {expenses.map(exp => (
                    <div className="form-group" key={exp.id}>
                        <label>{exp.category}:</label>
                        <div className="expense-row">
                            <input
                                type="number"
                                placeholder="Enter expense"
                                value={exp.amount === 0 ? '' : exp.amount}
                                onChange={(e) => handleExpenseChange(exp.id, parseFloat(e.target.value) || 0)}
                            />
                            <button onClick={() => deleteCategory(exp.id)} className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
                <div className="form-group add-category">
                    <input
                        type="text"
                        placeholder="New Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button onClick={addCategory} className="add-btn">Add Category</button>
                </div>
                <div className="form-group">
                    <label>Number of People:</label>
                    <input
                        type="number"
                        placeholder="Enter number of people"
                        value={people === 0 ? '' : people}
                        onChange={(e) => setPeople(parseInt(e.target.value) || 0)}
                    />
                </div>
                <button onClick={() => setAdvanced(!advanced)} className="advanced-toggle">
                    {advanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>
                {advanced && (
                    <div className="advanced-options">
                        {percentages.map((p, index) => (
                            <div className="form-group" key={index}>
                                <label>Person {index + 1} Percentage (%):</label>
                                <input
                                    type="number"
                                    value={p}
                                    onChange={(e) => {
                                        const newPerc = parseFloat(e.target.value) || 0;
                                        const newPercentages = [...percentages];
                                        newPercentages[index] = newPerc;
                                        setPercentages(newPercentages);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <div className="button-group">
                    <button onClick={calculate} className="btn">Calculate</button>
                    <button onClick={clearValues} className="clear-btn">Clear Values</button>
                    <button onClick={restoreDefaults} className="clear-btn">Reset Defaults</button>
                </div>
                <div className="result" id="result">{result}</div>
            </div>
            {records.length > 0 && (
                <div className="records">
                    <h2>Saved Records</h2>
                    {records.map(record => (
                        <div className="record" key={record.id}>
                            <div className="record-info">
                                <input
                                    type="checkbox"
                                    checked={selectedRecordIds.includes(record.id)}
                                    onChange={(e) => handleSelectRecord(record.id, e.target.checked)}
                                />
                                <span>
                                    {new Date(record.timestamp).toLocaleString()} - {record.result}
                                </span>
                            </div>
                            <div className="record-actions">
                                <button onClick={() => loadRecord(record)} className="load-btn">Load</button>
                                <button onClick={() => deleteRecord(record.id)} className="delete-record-btn">Delete</button>
                            </div>
                        </div>
                    ))}
                    {selectedRecordIds.length > 0 && (
                        <button onClick={() => setShowComparison(true)} className="compare-btn">
                            Compare Selected Records
                        </button>
                    )}
                </div>
            )}
            {showComparison && selectedRecords.length > 0 && (
                <ComparisonChart records={selectedRecords} />
            )}
        </div>
    );
};

export default Calculator;
