"use client";

import { useState } from 'react';
import { Display } from './display';
import { Trash, Delete } from 'lucide-react';

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
  const [hasDecimal, setHasDecimal] = useState(false);

  const evaluateExpression = (exp: string): string => {
    try {
      const evaluatableExpression = exp
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/--/g, '+');

      // Basic safety check
      if (/[^0-9+\-*/.() ]/.test(evaluatableExpression)) {
        return "Error";
      }

      // Avoid evaluating empty or incomplete expressions
      if (evaluatableExpression.trim() === '' || /[+\-*/.]$/.test(evaluatableExpression.trim())) {
        return display; // Return current display if expression is incomplete
      }

      const result = new Function(`return ${evaluatableExpression}`)();
      if (isNaN(result) || !isFinite(result)) return "Error";
      return String(Number(result.toPrecision(10)));
    } catch (error) {
      return "Error";
    }
  };

  const handleInput = (val: string) => {
    if (isResult) {
      setExpression(val);
      setDisplay(val);
      setIsResult(false);
    } else {
      setExpression(prev => (prev === '0' ? val : prev + val));
      setDisplay(prev => (prev === '0' ? val : prev + val));
    }
  };

  const handleOperator = (op: string) => {
    // If we have a result, use it as the start of the new expression
    if (isResult) {
      setExpression(display + ` ${op} `);
      setIsResult(false);
    } else if (expression && !expression.endsWith(' ')) {
      // If the last char is not an operator, add the new one
      setExpression(prev => prev + ` ${op} `);
    } else if (expression.endsWith(' ')) {
        // If the last char is an operator, replace it
        setExpression(prev => prev.slice(0, -3) + ` ${op} `)
    }
    setHasDecimal(false);
    // The display now shows the full expression
    setDisplay(expression + ` ${op} `);
  };
  
  const inputDecimal = () => {
    if (isResult) {
      setExpression('0.');
      setDisplay('0.');
      setIsResult(false);
      setHasDecimal(true);
      return;
    }

    const currentNumber = expression.split(/ [+\-×÷] /).pop() || '';
    if (!currentNumber.includes('.')) {
      const newExpression = expression + '.';
      setExpression(newExpression);
      setDisplay(newExpression);
      setHasDecimal(true);
    }
  };

  const handleEquals = () => {
    if (expression && !expression.endsWith(' ')) {
      const result = evaluateExpression(expression);
      setDisplay(result);
      setExpression(result);
      setIsResult(true);
      setHasDecimal(result.includes('.'));
    }
  };
  
  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
    setIsResult(false);
    setHasDecimal(false);
  };
  
  const handleBackspace = () => {
    if (isResult) return;
    if (expression.endsWith(' ')) {
        // remove operator and spaces
        setExpression(prev => prev.slice(0, -3));
        setDisplay(prev => prev.slice(0, -3));
    } else {
        const newExpression = expression.slice(0, -1) || '0';
        setExpression(newExpression);
        setDisplay(newExpression);
        if(!newExpression.split(/ [+\-×÷] /).pop()?.includes('.')) {
            setHasDecimal(false);
        }
    }
  };

  const toggleSign = () => {
    if (display === '0' || isResult) return;
    
    // This is a simplified toggle sign that prepends a minus, better logic would be needed for complex expressions
    if (display.startsWith('-')) {
      setDisplay(display.substring(1));
      setExpression(expression.substring(1));
    } else {
      setDisplay('-' + display);
      setExpression('-' + expression);
    }
  }
  
  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
       <Display value={display} expression={isResult ? `Ans = ${display}` : expression} />
       <div className="grid grid-cols-4 gap-2">
        <CalculatorButton onClick={clearDisplay} label="AC" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={handleBackspace} label={<Delete className="w-6 h-6" />} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
        <CalculatorButton onClick={toggleSign} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
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
