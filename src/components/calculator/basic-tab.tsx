"use client";

import { useState } from 'react';
import { Display } from './display';

const CalculatorButton = ({
  onClick,
  label,
  className = '',
}: {
  onClick: () => void;
  label: string | React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center h-16 text-2xl font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className}`}
  >
    {label}
  </button>
);

export default function BasicTab() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const evaluateExpression = (exp: string): string => {
    try {
      // Replace visual operators with evaluatable ones
      const evaluatableExpression = exp.replace(/×/g, '*').replace(/÷/g, '/');
      // Basic safeguard
      if (/[^0-9+\-*/.%() ]/.test(evaluatableExpression)) {
        return "Error";
      }
      // Using Function constructor for safe evaluation
      const result = new Function(`return ${evaluatableExpression}`)();
       if (isNaN(result) || !isFinite(result)) return "Error";
      return String(Number(result.toPrecision(10)));
    } catch (error) {
      return "Error";
    }
  };

  const handleInput = (char: string) => {
    if (isResult) {
      setExpression(char);
      setDisplay(char);
      setIsResult(false);
    } else {
      setExpression(prev => (prev === '0' && char !== '.') ? char : prev + char);
      setDisplay(prev => (prev === '0' && char !== '.') ? char : prev + char);
    }
  };

  const handleOperator = (op: string) => {
     if (expression.slice(-1) === ' ') return; // Prevent multiple operators
     setExpression(prev => prev + ` ${op} `);
     setDisplay(op);
     setIsResult(false);
  }

  const handleEquals = () => {
    if (expression) {
        const finalExpression = expression.replace(/(\s[+\-×÷]\s)$/, ''); // Remove trailing operator
        const result = evaluateExpression(finalExpression);
        setDisplay(result);
        setExpression(result);
        setIsResult(true);
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
    setIsResult(false);
  };
  
  const toggleSign = () => {
     if (display !== '0' && !isResult) {
       const currentNumberMatch = expression.match(/(\d+\.?\d*)$/);
       if (currentNumberMatch) {
           const currentNumber = currentNumberMatch[0];
           const newNumber = String(parseFloat(currentNumber) * -1);
           setExpression(prev => prev.slice(0, -currentNumber.length) + `(${newNumber})`);
           setDisplay(newNumber);
       }
     }
  }
  
  const percentage = () => {
    if (!isResult && display !== '0') {
      const value = parseFloat(display) / 100;
      const cleanValue = String(Number(value.toPrecision(10)));
       const currentNumberMatch = expression.match(/(\d+\.?\d*)$/);
       if (currentNumberMatch) {
            const currentNumber = currentNumberMatch[0];
            setExpression(prev => prev.slice(0, -currentNumber.length) + cleanValue);
       }
       setDisplay(cleanValue);
    }
  }
  
  const inputDecimal = () => {
      if (!display.includes('.')) {
          handleInput('.');
      }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
       <Display value={display} expression={isResult ? '' : expression} />
       <div className="grid grid-cols-4 gap-2">
        <CalculatorButton onClick={clearDisplay} label="AC" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={toggleSign} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={percentage} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={() => handleOperator('÷')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />
        
        {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('×')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        <CalculatorButton onClick={() => handleInput('0')} label="0" className="col-span-2 bg-card hover:bg-muted" />
        <CalculatorButton onClick={inputDecimal} label="." className="bg-card hover:bg-muted" />
        <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
       </div>
    </div>
  );
}
