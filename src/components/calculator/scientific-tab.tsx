"use client";

import { useState } from 'react';
import { Display } from './display';
import { create, all } from 'mathjs';

const math = create(all, {});

// Overwrite the default config to use degrees instead of radians for trig functions
// This is more intuitive for a calculator interface.
// The user can switch between modes.
const originalSin = math.sin;
const originalCos = math.cos;
const originalTan = math.tan;

(math.sin as any) = (x: number) => originalSin(x * Math.PI / 180);
(math.cos as any) = (x: number) => originalCos(x * Math.PI / 180);
(math.tan as any) = (x: number) => originalTan(x * Math.PI / 180);

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
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  const evaluateExpression = (exp: string): string => {
    try {
        let evaluatableExpression = exp
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√/g, 'sqrt')
            .replace(/π/g, 'pi')
            .replace(/\^/g, '^')
            .replace(/log\(/g, 'log10(')
            .replace(/ln\(/g, 'log(')
            .replace(/E/g, 'e');

      if (!evaluatableExpression) return '0';

      // Handle trig functions based on mode
      if (angleMode === 'rad') {
          evaluatableExpression = evaluatableExpression
              .replace(/sin\(/g, 'sin(rad(')
              .replace(/cos\(/g, 'cos(rad(')
              .replace(/tan\(/g, 'tan(rad(');
      }
      
      const result = math.evaluate(evaluatableExpression);
      if (result === undefined || result === null || typeof result === 'function') return 'Error';

      const formattedResult = math.format(result, { notation: 'auto', precision: 10 });
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
      const newExpression = expression === '' && char !== '.' ? char : expression + char;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
  };

  const handleOperator = (op: string) => {
    if(isResult) {
      setExpression(display + op);
      setDisplay(display + op);
      setIsResult(false);
    } else if (expression !== '' || op ==='-') { // allow starting with minus
        const newExpression = expression + op;
        setExpression(newExpression);
        setDisplay(newExpression);
    }
  };
  
  const handleFunction = (func: string) => {
    const newExpression = expression + `${func}(`;
    setExpression(newExpression);
    setDisplay(newExpression);
    setIsResult(false);
  };

  const handleConstant = (constant: string) => {
     const newExpression = expression + constant;
     setExpression(newExpression);
     setDisplay(newExpression);
     setIsResult(false);
  }
  
  const handleReciprocal = () => {
    handleOperator('^(-1)');
  }

  const handleEquals = () => {
    if (expression && !expression.endsWith(' ')) {
      let finalExpression = expression;
      
      const openParen = (finalExpression.match(/\(/g) || []).length;
      const closeParen = (finalExpression.match(/\)/g) || []).length;
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

  const toggleAngleMode = () => {
    setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg');
  }
  
  return (
      <div className="w-full max-w-md mx-auto space-y-4">
          <Display value={display} expression={`${angleMode.toUpperCase()} | ${isResult ? `Ans = ${display}` : expression}`} />
          <div className="grid grid-cols-6 gap-2">
                <CalculatorButton onClick={toggleAngleMode} label={`${angleMode === 'deg' ? 'RAD' : 'DEG'}`} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('sin')} label="sin" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('cos')} label="cos" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('tan')} label="tan" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleFunction('log')} label="log" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction('ln')} label="ln" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
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

                <CalculatorButton onClick={() => handleConstant('pi')} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('%')} label="%" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleConstant('e')} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('^2')} label="x²" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={handleReciprocal} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('0')} label="0" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('10^')} label="10ˣ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('^(1/')} label="ʸ√x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
      </div>
  );
}
