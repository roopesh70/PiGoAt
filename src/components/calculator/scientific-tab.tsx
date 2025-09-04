
"use client";

import { useState } from 'react';
import { Display } from './display';
import { create, all } from 'mathjs';
import { InlineMath } from 'react-katex';

const math = create(all, {
  number: 'BigNumber',
  precision: 64,
});

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

  math.config({
      number: 'BigNumber',
      precision: 64,
      epsilon: 1e-12,
  });

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
        .replace(/E/g, 'e')
        .replace(/−/g, '-');

      if (!evaluatableExpression) return '0';

      const result = math.evaluate(evaluatableExpression, { angle: angleMode });
      if (result === undefined || result === null || typeof result === 'function') return "Error";
      
      return math.format(result, { notation: 'auto', precision: 10 });
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
    } else if (expression !== '' || ['-', 'sqrt('].includes(op)) {
        const newExpression = expression + op;
        setExpression(newExpression);
        setDisplay(newExpression);
    } else if (op === '-') {
        setExpression(op);
        setDisplay(op);
    }
  };
  
  const handleFunction = (func: string) => {
     if (isResult) {
      setExpression(func + '(');
      setDisplay(func + '(');
      setIsResult(false);
    } else {
      setExpression(prev => prev + func + '(');
      setDisplay(prev => prev + func + '(');
    }
  };

  const handleConstant = (constant: string) => {
     if (isResult) {
       setExpression(constant);
       setDisplay(constant);
       setIsResult(false);
     } else {
       setExpression(prev => prev + constant);
       setDisplay(prev => prev + constant);
     }
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
                <CalculatorButton onClick={toggleAngleMode} label={angleMode === 'deg' ? 'RAD' : 'DEG'} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
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
                <CalculatorButton onClick={() => handleOperator('/')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleFunction('sqrt')} label="√" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('!')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('*')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

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
                <CalculatorButton onClick={() => handleOperator('*10^')} label={<InlineMath math="10^x" />} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('^(1/')} label="ʸ√x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
      </div>
  );
}

  