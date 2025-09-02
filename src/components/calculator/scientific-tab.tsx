
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
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);


    const calculate = (first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return first / second;
            case '^': return Math.pow(first, second);
            default: return second;
        }
    };

    const clear = () => {
        setDisplay('0');
        setExpression('');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const backspace = () => {
        if (waitingForSecondOperand) return;
        setDisplay(display.slice(0, -1) || '0');
    };

    const inputDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            const newDisplay = display === '0' ? digit : display + digit;
            setDisplay(newDisplay.length > 15 ? display : newDisplay);
        }
    };

    const chooseOperator = (nextOperator: string) => {
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
            const resultStr = String(Number(result.toPrecision(10)));
            setDisplay(resultStr);
            setFirstOperand(result);
            setExpression(`${firstOperand} ${operator} ${inputValue} = ${resultStr}`);
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
        if (!operator || firstOperand === null) return;
        const inputValue = parseFloat(display);
        const result = calculate(firstOperand, inputValue, operator);
        const resultStr = String(Number(result.toPrecision(10)));
        setExpression(`${firstOperand} ${operator} ${inputValue} = ${resultStr}`);
        setDisplay(resultStr);
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const handleUnaryOperation = (op: string) => {
        const value = parseFloat(display);
        let result = 0;
        let opSymbol = op;
        try {
            switch(op) {
              case 'sin': result = Math.sin(value * Math.PI / 180); opSymbol = "sin_deg"; break;
              case 'cos': result = Math.cos(value * Math.PI / 180); opSymbol = "cos_deg"; break;
              case 'tan': result = Math.tan(value * Math.PI / 180); opSymbol = "tan_deg"; break;
              case 'sinh': result = Math.sinh(value); break;
              case 'cosh': result = Math.cosh(value); break;
              case 'tanh': result = Math.tanh(value); break;
              case 'ln': result = Math.log(value); break;
              case 'log': result = Math.log10(value); break;
              case 'sqrt': result = Math.sqrt(value); opSymbol = "√"; break;
              case 'x!':
                if (value < 0 || !Number.isInteger(value)) {
                    setDisplay("Error"); setWaitingForSecondOperand(true); return;
                }
                if (value > 170) {
                    setDisplay("Infinity"); setWaitingForSecondOperand(true); return;
                }
                let fact = 1;
                for (let i = 2; i <= value; i++) fact *= i;
                result = fact;
                break;
              case 'e^x': result = Math.exp(value); opSymbol = "e^"; break;
              case '1/x': 
                if (value === 0) {
                    setDisplay("Error"); setWaitingForSecondOperand(true); return;
                }
                result = 1 / value; break;
              case 'x^2': result = Math.pow(value, 2); opSymbol = "sqr"; break;
              case 'x^3': result = Math.pow(value, 3); opSymbol = "cube"; break;
            }
            if (isNaN(result) || !isFinite(result)) {
                setDisplay("Error");
            } else {
                 const resultStr = String(Number(result.toPrecision(10)));
                 setExpression(`${opSymbol}(${value}) = ${resultStr}`);
                 setDisplay(resultStr);
            }
        } catch {
            setDisplay("Error");
        }
        setWaitingForSecondOperand(true);
      };
      
    const getDisplayValue = () => {
        if (isNaN(parseFloat(display))) return "Error";
        return display;
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <Display value={getDisplayValue()} expression={expression} />
            <div className="grid grid-cols-6 gap-2">
                <CalculatorButton onClick={() => handleUnaryOperation('sin')} label="sin" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('cos')} label="cos" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('tan')} label="tan" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('sinh')} label="sinh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('cosh')} label="cosh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('tanh')} label="tanh" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
                <CalculatorButton onClick={() => handleUnaryOperation('x^2')} label="x²" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('x^3')} label="x³" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => chooseOperator('^')} label="xʸ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={clear} label="AC" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={backspace} label="DEL" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => chooseOperator('/')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('sqrt')} label="√" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('ln')} label="ln" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => chooseOperator('*')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('log')} label="log" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('1/x')} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => chooseOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleUnaryOperation('x!')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleUnaryOperation('e^x')} label="eˣ" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => inputDigit(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => chooseOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => { setDisplay(String(Math.PI)); setWaitingForSecondOperand(true); }} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => { setDisplay(String(Math.E)); setWaitingForSecondOperand(true); }} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => setDisplay(String(parseFloat(display) * -1))} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => inputDigit('0')} label="0" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => inputDigit('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
        </div>
    );
}
