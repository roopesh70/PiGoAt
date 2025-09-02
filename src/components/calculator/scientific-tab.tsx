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
    className={`flex items-center justify-center h-14 text-xl font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className}`}
  >
    {label}
  </button>
);

export default function ScientificTab() {
    const [currentValue, setCurrentValue] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [overwrite, setOverwrite] = useState(true);

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
        setCurrentValue('0');
        setPreviousValue(null);
        setOperator(null);
        setOverwrite(true);
    };

    const backspace = () => {
        if (currentValue.length > 1) {
            setCurrentValue(currentValue.slice(0, -1));
        } else {
            setCurrentValue('0');
            setOverwrite(true);
        }
    };

    const inputDigit = (digit: string) => {
        if (overwrite) {
            setCurrentValue(digit);
            setOverwrite(false);
        } else {
            if (currentValue === '0' && digit !== '.') {
                setCurrentValue(digit);
            } else if (digit === '.' && currentValue.includes('.')) {
                return;
            } 
            else {
                setCurrentValue(`${currentValue}${digit}`);
            }
        }
    };

    const chooseOperator = (nextOperator: string) => {
        if (previousValue && operator && !overwrite) {
            const result = calculate(parseFloat(previousValue), parseFloat(currentValue), operator);
            const resultStr = String(result);
            setCurrentValue(resultStr);
            setPreviousValue(resultStr);
        } else {
            setPreviousValue(currentValue);
        }
        
        setOperator(nextOperator);
        setOverwrite(true);
    };

    const handleEquals = () => {
        if (!previousValue || !operator) return;
        const result = calculate(parseFloat(previousValue), parseFloat(currentValue), operator);
        setCurrentValue(String(result));
        setPreviousValue(null);
        setOperator(null);
        setOverwrite(true);
    };

    const handleUnaryOperation = (op: string) => {
        const value = parseFloat(currentValue);
        let result = 0;
        try {
            switch(op) {
              case 'sin': result = Math.sin(value * Math.PI / 180); break;
              case 'cos': result = Math.cos(value * Math.PI / 180); break;
              case 'tan': result = Math.tan(value * Math.PI / 180); break;
              case 'sinh': result = Math.sinh(value); break;
              case 'cosh': result = Math.cosh(value); break;
              case 'tanh': result = Math.tanh(value); break;
              case 'ln': result = Math.log(value); break;
              case 'log': result = Math.log10(value); break;
              case 'sqrt': result = Math.sqrt(value); break;
              case 'x!':
                if (value < 0 || !Number.isInteger(value)) {
                    setCurrentValue("Error"); setOverwrite(true); return;
                }
                if (value > 170) {
                    setCurrentValue("Infinity"); setOverwrite(true); return;
                }
                let fact = 1;
                for (let i = 2; i <= value; i++) fact *= i;
                result = fact;
                break;
              case 'e^x': result = Math.exp(value); break;
              case '1/x': 
                if (value === 0) {
                    setCurrentValue("Error"); setOverwrite(true); return;
                }
                result = 1 / value; break;
              case 'x^2': result = Math.pow(value, 2); break;
              case 'x^3': result = Math.pow(value, 3); break;
            }
            if (isNaN(result) || !isFinite(result)) {
                setCurrentValue("Error");
            } else {
                setCurrentValue(String(result));
            }
        } catch {
            setCurrentValue("Error");
        }
        setOverwrite(true);
      };

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-right h-20 flex items-center justify-end">
                <p className="text-4xl font-mono font-light break-all">{currentValue}</p>
            </div>
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
                
                <CalculatorButton onClick={() => { setCurrentValue(String(Math.PI)); setOverwrite(true); }} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => { setCurrentValue(String(Math.E)); setOverwrite(true); }} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => setCurrentValue(String(parseFloat(currentValue) * -1))} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => inputDigit('0')} label="0" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => inputDigit('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
        </div>
    );