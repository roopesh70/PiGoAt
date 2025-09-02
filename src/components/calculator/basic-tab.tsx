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
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      const newDisplay = display === '0' ? digit : display + digit;
      setDisplay(newDisplay);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
        setDisplay('0.');
        setWaitingForSecondOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setExpression('');
  };
  
  const backspace = () => {
    if (waitingForSecondOperand) return;
    setDisplay(display.slice(0, -1) || '0');
  }
  
  const toggleSign = () => {
      setDisplay(String(parseFloat(display) * -1));
  }
  
  const percentage = () => {
      const value = parseFloat(display) / 100;
      setDisplay(String(value));
      setExpression(`${display} / 100 = ${value}`);
      setWaitingForSecondOperand(true);
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      setExpression(`${firstOperand} ${nextOperator}`);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
      setExpression(`${firstOperand} ${operator} ${inputValue} = ${result}`);
    } else {
        setExpression(`${inputValue} ${nextOperator}`);
    }
    
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    if(firstOperand !== null) {
        setExpression(`${firstOperand} ${nextOperator}`);
    } else {
        setExpression(`${inputValue} ${nextOperator}`);
    }
  };
  
  const handleEquals = () => {
    if (operator && firstOperand !== null) {
      const inputValue = parseFloat(display);
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setExpression(`${firstOperand} ${operator} ${inputValue} = ${result}`);
      setFirstOperand(null); // Reset for new calculation
      setOperator(null);
      setWaitingForSecondOperand(true);
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second === 0 ? NaN : first / second;
      default: return second;
    }
  };
  
  const getDisplayValue = () => {
      if (isNaN(parseFloat(display))) return "Error";
      return display;
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
       <Display value={getDisplayValue()} expression={expression} />
       <div className="grid grid-cols-4 gap-2">
        <CalculatorButton onClick={clearDisplay} label="AC" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={toggleSign} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={percentage} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={() => performOperation('/')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />
        
        {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => performOperation('*')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => performOperation('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
        <CalculatorButton onClick={() => performOperation('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />

        <CalculatorButton onClick={() => inputDigit('0')} label="0" className="col-span-2 bg-card hover:bg-muted" />
        <CalculatorButton onClick={inputDecimal} label="." className="bg-card hover:bg-muted" />
        <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
       </div>
    </div>
  );
}
