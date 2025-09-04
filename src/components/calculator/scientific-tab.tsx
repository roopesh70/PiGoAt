"use client";

import { useState } from 'react';
import { Display } from './display';
import { create, all } from 'mathjs';

const math = create(all);

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
    className={`flex items-center justify-center h-14 text-xl font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className}`}
  >
    {label}
  </button>
);

export default function ScientificTab() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [isResult, setIsResult] = useState(false);

  const evaluateExpression = (exp: string): string => {
    try {
        // Replace user-friendly symbols with mathjs compatible ones
        const evaluatableExpression = exp
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/\^/g, '^')
            // mathjs trig functions default to radians, so we need to specify if we're using degrees
            // For simplicity, we'll assume degree inputs from the calculator buttons
            .replace(/sin\(/g, 'sin(deg(')
            .replace(/cos\(/g, 'cos(deg(')
            .replace(/tan\(/g, 'tan(deg(')
            .replace(/log\(/g, 'log10(') // log is log10
            .replace(/ln\(/g, 'log('); // ln is natural log
            
      if (!evaluatableExpression) return '0';

      const result = math.evaluate(evaluatableExpression);
      if (result === undefined || result === null || typeof result === 'function') return 'Error';

      // Format the result to avoid floating point inaccuracies
      const formattedResult = math.format(result, { precision: 10 });
      return String(formattedResult);
    } catch (error) {
      console.error(error);
      return "Error";
    }
  };

  const handleInput = (char: string) => {
    if (isResult) {
      setExpression(char);
      setDisplay(char);
      setIsResult(false);
    } else {
      const newExpression = expression === '0' ? char : expression + char;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
  };

  const handleOperator = (op: string) => {
    if(isResult) {
      setExpression(display + op);
      setDisplay(display + op);
      setIsResult(false);
    } else if (expression !== '' && !/[+\-×÷^]$/.test(expression.trim().slice(-1))) {
        const newExpression = expression + op;
        setExpression(newExpression);
        setDisplay(newExpression);
    }
  };
  
  const handleFunction = (func: string) => {
    if(isResult) {
        setExpression(`${func}(`);
        setDisplay(`${func}(`);
        setIsResult(false);
    } else {
        const newExpression = expression + `${func}(`;
        setExpression(newExpression);
        setDisplay(newExpression);
    }
  };

  const handleConstant = (constant: string) => {
      if(isResult) {
          setExpression(constant);
          setDisplay(constant);
          setIsResult(false);
      } else {
         const newExpression = expression + constant;
         setExpression(newExpression);
         setDisplay(newExpression);
      }
  }

  const handleEquals = () => {
    if (expression && !expression.endsWith(' ')) {
      // Auto-close parentheses if needed
      const openParen = (expression.match(/\(/g) || []).length;
      const closeParen = (expression.match(/\)/g) || []).length;
      let finalExpression = expression;
      if (openParen > closeParen) {
        finalExpression += ')'.repeat(openParen - closeParen);
      }
      
      const result = evaluateExpression(finalExpression);
      setDisplay(result);
      setExpression(result);
      setIsResult(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setIsResult(false);
  };
  
  const backspace = () => {
    if (isResult) return;
    if (expression.length > 0) {
       const newExp = expression.slice(0,-1)
       setExpression(newExp);
       setDisplay(newExp || '0');
    }
  }
  
  return (
      <div className="w-full max-w-md mx-auto space-y-4">
          <Display value={display} expression={isResult ? `Ans = ${display}` : expression} />
          <div className="grid grid-cols-6 gap-2">
                <CalculatorButton onClick={() => handleFunction('sin')} label="sin" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('cos')} label="cos" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('tan')} label="tan" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleFunction('log')} label="log" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('ln')} label="ln" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleConstant('e')} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
                <CalculatorButton onClick={() => handleOperator('^')} label="xʸ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('(')} label="(" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput(')')} label=")" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={clear} label="AC" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={backspace} label="DEL" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('÷')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleFunction('sqrt')} label="√" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('!')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('×')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleConstant('π')} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('%')} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleFunction('abs')} label="|x|" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('^2')} label="x²" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleInput('1/')} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('0')} label="0" className="col-span-1 bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="col-span-2 bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
      </div>
  );
}
