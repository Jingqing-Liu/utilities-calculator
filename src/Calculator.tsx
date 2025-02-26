import React, { useState, useEffect } from 'react';
import './styles.css';

// 初始费用种类
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

interface CalculationRecord {
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

    // 加载本地记录
    useEffect(() => {
        const storedRecords = localStorage.getItem('calculationRecords');
        if (storedRecords) {
            setRecords(JSON.parse(storedRecords));
        }
    }, []);

    // 当记录发生变化时，保存到本地
    useEffect(() => {
        localStorage.setItem('calculationRecords', JSON.stringify(records));
    }, [records]);

    // 更新费用项数值
    const handleExpenseChange = (id: number, value: number) => {
        setExpenses(expenses.map(exp => exp.id === id ? { ...exp, amount: value } : exp));
    };

    // 添加新费用种类
    const addCategory = () => {
        if (newCategory.trim() === '') return;
        const newId = expenses.length > 0 ? Math.max(...expenses.map(exp => exp.id)) + 1 : 1;
        setExpenses([...expenses, { id: newId, category: newCategory, amount: 0 }]);
        setNewCategory('');
    };

    // 删除费用种类
    const deleteCategory = (id: number) => {
        setExpenses(expenses.filter(exp => exp.id !== id));
    };

    // 当高级模式开启且人数大于0时，初始化或更新百分比分配
    useEffect(() => {
        if (advanced && people > 0) {
            const equalPercentage = parseFloat((100 / people).toFixed(2));
            setPercentages(new Array(people).fill(equalPercentage));
        }
    }, [people, advanced]);

    // 计算总费用及各自应付金额，并保存记录到本地
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

    // 清零当前数据（保留费用种类）
    const clearValues = () => {
        setExpenses(expenses.map(exp => ({ ...exp, amount: 0 })));
        setPeople(0);
        setResult('');
        setNewCategory('');
        setPercentages([]);
    };

    // 恢复初始状态（包括费用种类）
    const restoreDefaults = () => {
        setExpenses(defaultExpenses);
        setPeople(0);
        setResult('');
        setNewCategory('');
        setAdvanced(false);
        setPercentages([]);
    };

    // 加载某条记录，更新当前状态
    const loadRecord = (record: CalculationRecord) => {
        setExpenses(record.expenses.map(exp => ({ ...exp })));
        setPeople(record.people);
        setAdvanced(record.advanced);
        setPercentages([...record.percentages]);
        setResult(record.result);
        setNewCategory('');
    };

    // 删除指定记录
    const deleteRecord = (id: number) => {
        setRecords(records.filter(record => record.id !== id));
    };

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
                            <span>
                                {new Date(record.timestamp).toLocaleString()} - {record.result}
                            </span>
                            <div className="record-actions">
                                <button onClick={() => loadRecord(record)} className="load-btn">Load</button>
                                <button onClick={() => deleteRecord(record.id)} className="delete-record-btn">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Calculator;
