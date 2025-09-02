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
  const [currentNumber, setCurrentNumber] = useState('0');

  const evaluateExpression = (exp: string): string => {
    try {
      const evaluatableExpression = exp.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      if (/[^0-9+\-*/.%() ]/.test(evaluatableExpression)) {
        return "Error";
      }
      const result = new Function(`return ${evaluatableExpression}`)();
       if (isNaN(result) || !isFinite(result)) return "Error";
      return String(Number(result.toPrecision(10)));
    } catch (error) {
      return "Error";
    }
  };

  const handleInput = (char: string) => {
    if (isResult) {
      clearDisplay();
      setCurrentNumber(char);
      setDisplay(char);
      setExpression(char);
      setIsResult(false);
      return;
    }
    
    const newCurrentNumber = currentNumber === '0' && char !== '.' ? char : currentNumber + char;
    setCurrentNumber(newCurrentNumber);
    setDisplay(newCurrentNumber);

    if (expression.match(/(\s[+\-×÷]\s)$/)) { // If last thing was operator
      setExpression(prev => prev + newCurrentNumber);
    } else if (expression.includes(' ')) { // If we are editing the second number
        const parts = expression.split(' ');
        parts[2] = newCurrentNumber;
        setExpression(parts.join(' '));
    } else { // First number
        setExpression(newCurrentNumber);
    }
  };

  const handleOperator = (op: string) => {
     if (expression.slice(-1) === ' ') return;
     if (isResult) {
        setIsResult(false);
     }
     setExpression(prev => prev + ` ${op} `);
     setCurrentNumber('0');
  }

  const handleEquals = () => {
    if (expression && !expression.endsWith(' ')) {
        const result = evaluateExpression(expression);
        setDisplay(result);
        setExpression(expression + ' =');
        setCurrentNumber(result);
        setIsResult(true);
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
    setCurrentNumber('0');
    setIsResult(false);
  };
  
  const toggleSign = () => {
     if (display !== '0' && !isResult) {
       const newValue = String(parseFloat(display) * -1);
       setDisplay(newValue);
       setCurrentNumber(newValue);
       // more complex expression update needed if we want to toggle in middle of expression
       setExpression(prev => {
           const parts = prev.split(' ');
           parts[parts.length -1] = newValue;
           return parts.join(' ');
       });
     }
  }
  
  const percentage = () => {
    if (!isResult && display !== '0') {
      const value = parseFloat(display) / 100;
      const cleanValue = String(Number(value.toPrecision(10)));
       setDisplay(cleanValue);
       setCurrentNumber(cleanValue);
       setExpression(prev => {
           const parts = prev.split(' ');
           parts[parts.length - 1] = cleanValue;
           return parts.join(' ');
       });
    }
  }
  
  const inputDecimal = () => {
      if (isResult) {
          clearDisplay();
          setCurrentNumber('0.');
          setDisplay('0.');
          setExpression('0.');
          setIsResult(false);
          return;
      }
      if (!currentNumber.includes('.')) {
          setCurrentNumber(prev => prev + '.');
          setDisplay(prev => prev + '.');
          setExpression(prev => prev + '.');
      }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
       <Display value={display} expression={isResult ? expression : expression.replace(/ =$/, '')} />
       <div className="grid grid-cols-4 gap-2">
        <CalculatorButton onClick={clearDisplay} label="AC" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={toggleSign} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={percentage} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={() => handleOperator('÷')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />
        
        {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('×')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('−')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        <CalculatorButton onClick={() => handleInput('0')} label="0" className="col-span-2 bg-card hover:bg-muted" />
        <CalculatorButton onClick={inputDecimal} label="." className="bg-card hover:bg-muted" />
        <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
       </div>
    </div>
  );
}
