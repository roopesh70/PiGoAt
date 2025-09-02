
"use client";

import { useState } from 'react';

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

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
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
  };
  
  const backspace = () => {
    setDisplay(display.slice(0, -1) || '0');
  }
  
  const toggleSign = () => {
      setDisplay(String(parseFloat(display) * -1));
  }
  
  const percentage = () => {
      setDisplay(String(parseFloat(display) / 100));
  }

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }
    
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };
  
  const handleEquals = () => {
    if (operator && firstOperand !== null) {
      const result = calculate(firstOperand, parseFloat(display), operator);
      setDisplay(String(result));
      setFirstOperand(result); // Allow for chaining operations after equals
      setWaitingForSecondOperand(true);
      setOperator(null);
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second === 0 ? NaN : first / second; // Handle division by zero
      default: return second;
    }
  };
  
  const getDisplayValue = () => {
      if (isNaN(parseFloat(display))) return "Error";
      return display;
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
       <div className="bg-muted/50 p-4 rounded-lg text-right h-20 flex items-center justify-end">
        <p className="text-4xl font-mono font-light break-all">{getDisplayValue()}</p>
      </div>
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
