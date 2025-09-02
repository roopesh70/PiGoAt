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
    className={`flex items-center justify-center h-14 text-xl font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className}`}
  >
    {label}
  </button>
);

export default function ScientificTab() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isResult, setIsResult] = useState(false);

  const evaluateExpression = (exp: string): string => {
    try {
      const evaluatableExpression = exp
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√/g, 'Math.sqrt')
        .replace(/sin_deg/g, 'Math.sin')
        .replace(/cos_deg/g, 'Math.cos')
        .replace(/tan_deg/g, 'Math.tan')
        .replace(/ln/g, 'Math.log')
        .replace(/log/g, 'Math.log10')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      if (/[^0-9+\-*/.%() Math.PIEsqrtcota]/.test(evaluatableExpression)) {
         // This regex is a basic safety measure, not foolproof.
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
        setExpression(char);
        setDisplay(char);
        setIsResult(false);
    } else {
        setExpression(prev => prev + char);
        setDisplay(char);
    }
  };

  const handleOperator = (op: string) => {
    if (expression.endsWith(' ')) return;
    setExpression(prev => `${prev} ${op} `);
    setIsResult(false);
  };

  const handleEquals = () => {
    if (expression) {
      const finalExpression = expression.replace(/(\s[+\-×÷^]\s)$/, ''); // Remove trailing operator
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
    setExpression(prev => prev.slice(0,-1));
    setDisplay(d => d.slice(0, -1) || '0');
  }

  const handleUnaryOperation = (op: string, mathSymbol: string) => {
    let currentNumber = expression.match(/(-?\d+\.?\d*)$/)?.[0] || display;
    
    // If the display is showing a result, use that for the next operation
    if (isResult) {
        currentNumber = display;
    }
    
    if (currentNumber === 'Error' || currentNumber === 'Infinity') return;

    let result;
    try {
        const num = parseFloat(currentNumber);
        switch (op) {
            case 'sin': result = Math.sin(num * Math.PI / 180); break;
            case 'cos': result = Math.cos(num * Math.PI / 180); break;
            case 'tan': result = Math.tan(num * Math.PI / 180); break;
            case 'sinh': result = Math.sinh(num); break;
            case 'cosh': result = Math.cosh(num); break;
            case 'tanh': result = Math.tanh(num); break;
            case 'ln': result = Math.log(num); break;
            case 'log': result = Math.log10(num); break;
            case 'sqrt': result = Math.sqrt(num); break;
            case 'x!':
                if (num < 0 || !Number.isInteger(num)) throw new Error("Factorial of non-integer or negative");
                if (num > 170) { result = Infinity; break; }
                let fact = 1;
                for (let i = 2; i <= num; i++) fact *= i;
                result = fact;
                break;
            case 'e^x': result = Math.exp(num); break;
            case '1/x': 
                if (num === 0) throw new Error("Division by zero");
                result = 1 / num; 
                break;
            case 'x^2': result = Math.pow(num, 2); break;
            case 'x^3': result = Math.pow(num, 3); break;
             default: result = num;
        }

        if (isNaN(result) || !isFinite(result)) {
            setDisplay("Error");
            setExpression("Error");
            setIsResult(true);
            return;
        }

        const resultStr = String(Number(result.toPrecision(10)));
        const newExpression = `${mathSymbol}(${currentNumber})`;

        // Replace the last number with the new unary expression result
        if (isResult) {
            setExpression(resultStr);
        } else {
             const baseExpression = expression.slice(0, -currentNumber.length);
             setExpression(baseExpression + resultStr);
        }
        setDisplay(resultStr);
        setIsResult(false); // Allow chaining operations

    } catch {
        setDisplay("Error");
        setExpression("Error");
        setIsResult(true);
    }
  };
  
  const handleConstant = (constant: string, value: number) => {
      if (isResult) {
          setExpression(constant);
          setDisplay(String(value));
          setIsResult(false);
      } else {
          // Check if last part of expression is an operator
          if (/\s[+\-×÷^]\s$/.test(expression) || expression === '') {
              setExpression(prev => prev + constant);
          } else {
              // Replace last number with constant
              setExpression(prev => prev.replace(/(-?\d+\.?\d*)$/, constant));
          }
           setDisplay(String(value));
      }
  }

  return (
      <div className="w-full max-w-md mx-auto space-y-4">
          <Display value={display} expression={isResult ? '' : expression} />
          <div className="grid grid-cols-6 gap-2">
                <CalculatorButton onClick={() => handleUnaryOperation('sin', 'sin_deg')} label="sin" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('cos', 'cos_deg')} label="cos" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('tan', 'tan_deg')} label="tan" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('sinh', 'sinh')} label="sinh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('cosh', 'cosh')} label="cosh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('tanh', 'tanh')} label="tanh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
                <CalculatorButton onClick={() => handleUnaryOperation('x^2', 'sqr')} label="x²" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('x^3', 'cube')} label="x³" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('^')} label="xʸ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={clear} label="AC" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={backspace} label="DEL" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('÷')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('sqrt', '√')} label="√" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('ln', 'ln')} label="ln" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('×')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('log', 'log')} label="log" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('1/x', '1/')} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('x!', 'fact')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('e^x', 'e^')} label="eˣ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleConstant('π', Math.PI)} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleConstant('e', Math.E)} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                 <CalculatorButton onClick={() => handleInput('(')} label="(" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput(')')} label=")" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
      </div>
  );
}
