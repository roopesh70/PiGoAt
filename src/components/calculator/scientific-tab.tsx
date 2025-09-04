
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
  isActive = false,
}: {
  onClick: () => void;
  label: string | React.ReactNode;
  className?: string;
  isActive?: boolean;
}) => (
  <button
    onClick={onClick}
    data-active={isActive}
    className={`flex items-center justify-center h-14 text-xl font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className} ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
  >
    {label}
  </button>
);

export default function ScientificTab() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [isResult, setIsResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState('0');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState(math.bignumber(0));
  const [isSecondFunctionActive, setIsSecondFunctionActive] = useState(false);

  math.config({
      angle: angleMode,
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
        .replace(/ans/g, `(${lastAnswer})`)
        .replace(/−/g, '-');
        

      if (isSecondFunctionActive) {
          evaluatableExpression = evaluatableExpression
              .replace(/asin\(/g, 'asin(')
              .replace(/acos\(/g, 'acos(')
              .replace(/atan\(/g, 'atan(')
      }

      if (!evaluatableExpression) return '0';

      const result = math.evaluate(evaluatableExpression);
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
      if(result !== 'Error') {
          setLastAnswer(result);
      }
      setDisplay(result);
      setExpression(result);
      setIsResult(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setIsResult(false);
    setLastAnswer('0');
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
    setAngleMode(prev => {
        const newMode = prev === 'deg' ? 'rad' : 'deg';
        math.config({angle: newMode});
        return newMode;
    });
  }
  
  const toggleSign = () => {
    if (display === '0' || isResult) return;
    setExpression(prev => prev.startsWith('(-') ? prev.slice(2, -1) : `(-${prev})`);
    setDisplay(prev => prev.startsWith('(-') ? prev.slice(2, -1) : `(-${prev})`);
  };

  // Memory functions
    const handleMemoryClear = () => setMemory(math.bignumber(0));
    const handleMemoryRecall = () => {
      const memVal = math.format(memory);
      handleInput(memVal);
    }
    const handleMemoryAdd = () => {
      try {
        const currentValue = math.bignumber(evaluateExpression(expression) || '0');
        setMemory(math.add(memory, currentValue));
      } catch (e) {
        console.error("Invalid expression for M+");
      }
    };
    const handleMemorySubtract = () => {
       try {
        const currentValue = math.bignumber(evaluateExpression(expression) || '0');
        setMemory(math.subtract(memory, currentValue));
      } catch (e) {
        console.error("Invalid expression for M-");
      }
    };

  return (
      <div className="w-full max-w-xl mx-auto space-y-4">
          <Display value={display} expression={`${angleMode.toUpperCase()} | ${isResult ? `Ans = ${display}` : expression}`} />
          <div className="grid grid-cols-7 gap-2">
                <CalculatorButton onClick={() => setIsSecondFunctionActive(prev => !prev)} label="2nd" isActive={isSecondFunctionActive} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 data-[active=true]:bg-primary" />
                <CalculatorButton onClick={() => handleConstant('pi')} label="π" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleConstant('e')} label="e" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={clear} label="AC" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={backspace} label="DEL" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive" />
                <CalculatorButton onClick={() => handleInput('(')} label="(" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleInput(')')} label=")" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                
                <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'asin' : 'sin')} label={isSecondFunctionActive ? <InlineMath math="sin^{-1}" /> : "sin"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'acos' : 'cos')} label={isSecondFunctionActive ? <InlineMath math="cos^{-1}" /> : "cos"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'atan' : 'tan')} label={isSecondFunctionActive ? <InlineMath math="tan^{-1}" /> : "tan"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator(isSecondFunctionActive ? '^(3)' : '^2')} label={isSecondFunctionActive ? <InlineMath math="x^3" /> : <InlineMath math="x^2" />} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('!')} label="x!" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={toggleAngleMode} label={angleMode === 'deg' ? 'RAD' : 'DEG'} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('/')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleOperator(isSecondFunctionActive ? '^(1/3)' : 'sqrt(')} label={isSecondFunctionActive ? <InlineMath math="\sqrt[3]{x}" /> : "√"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator(isSecondFunctionActive ? '^' : '^(1/')} label={isSecondFunctionActive ? <InlineMath math="x^y" /> : <InlineMath math="\sqrt[y]{x}" />} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'log2' : 'log')} label={isSecondFunctionActive ? <InlineMath math="log_2"/> : "log"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'exp' : 'ln')} label={isSecondFunctionActive ? <InlineMath math="e^x" />: "ln"} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={toggleSign} label="±" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('*10^')} label={<InlineMath math=" \times 10^{x}" />} className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleOperator('*')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={handleMemoryClear} label="MC" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={handleMemoryAdd} label="M+" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['7', '8', '9'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={handleMemorySubtract} label="M-" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={handleMemoryRecall} label="MR" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['4', '5', '6'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={() => handleInput('0')} label="0" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={handleReciprocal} label="1/x" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                <CalculatorButton onClick={() => handleConstant('ans')} label="Ans" className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />
                {['1', '2', '3'].map(digit => <CalculatorButton key={digit} onClick={() => handleInput(digit)} label={digit} className="bg-card hover:bg-muted" />)}
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90 col-span-2" />
            </div>
      </div>
  );
}
