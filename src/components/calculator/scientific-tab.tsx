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
            .replace(/sin\(/g, 'sin(deg(')
            .replace(/cos\(/g, 'cos(deg(')
            .replace(/tan\(/g, 'tan(deg(')
            .replace(/log\(/g, 'log10(')
            .replace(/ln\(/g, 'log('); // mathjs uses log() for natural log
            
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
      setExpression(prev => (prev === '0' ? char : prev + char));
      setDisplay(prev => (prev === '0' ? char : prev + char));
    }
  };

  const handleOperator = (op: string) => {
    if(isResult) {
      setIsResult(false);
    }
    // Prevent adding operator if last part is already an operator
    if (/\s[+\-×÷^]\s$/.test(expression)) {
        // Replace the last operator
        setExpression(prev => prev.slice(0, -3) + ` ${op} `);
    } else if(expression !== '') {
        setExpression(prev => `${prev} ${op} `);
    }
    setDisplay(expression + ` ${op} `);
  };
  
  const handleUnaryOperation = (op: string) => {
    if(isResult) setIsResult(false);
    setExpression(prev => `${op}(${prev})`);
    setDisplay(`${op}(${expression})`);
  };

  const handleConstant = (constant: string) => {
      if(isResult) {
          setExpression(constant);
          setDisplay(constant);
          setIsResult(false);
      } else {
         setExpression(prev => prev + constant);
         setDisplay(expression + constant);
      }
  }


  const handleEquals = () => {
    if (expression && !expression.endsWith(' ')) {
      const result = evaluateExpression(expression);
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
    if (expression.endsWith(' ')) {
       setExpression(prev => prev.slice(0,-3));
       setDisplay(prev => prev.slice(0, -3));
    } else {
       const newExp = expression.slice(0,-1)
       setExpression(newExp);
       setDisplay(newExp || '0');
    }
  }
  
  return (
      <div className="w-full max-w-md mx-auto space-y-4">
          <Display value={display} expression={isResult ? `Ans = ${display}` : expression} />
          <div className="grid grid-cols-6 gap-2">
                <CalculatorButton onClick={() => handleUnaryOperation('sin')} label="sin" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('cos')} label="cos" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('tan')} label="tan" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleUnaryOperation('log')} label="log" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('ln')} label="ln" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleConstant('e')} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
                <CalculatorButton onClick={() => handleOperator('^')} label="xʸ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('(')} label="(" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput(')')} label=")" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={clear} label="AC" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={backspace} label="DEL" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('÷')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('sqrt')} label="√" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleUnaryOperation('!')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('×')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleConstant('π')} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleInput('%')} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleUnaryOperation('abs')} label="|x|" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => { setExpression(prev => `(${prev})^2`); setDisplay(`(${expression})^2`);}} label="x²" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => { setExpression(prev => `1/(${prev})`); setDisplay(`1/(${expression})`);}} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('0')} label="0" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="col-span-3 bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
      </div>
  );
}
