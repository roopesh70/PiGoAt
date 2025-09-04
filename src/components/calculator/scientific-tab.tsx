
"use client";

import { useState } from 'react';
import { Display } from './display';
import { create, all } from 'mathjs';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';


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
    className={`flex items-center justify-center h-12 text-lg font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${className}`}
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
        .replace(/−/g, '-')
        .replace(/\|([^|]+)\|/g, 'abs($1)');
        

      if (isSecondFunctionActive) {
          evaluatableExpression = evaluatableExpression
              .replace(/asin\(/g, 'asin(')
              .replace(/acos\(/g, 'acos(')
              .replace(/atan\(/g, 'atan(')
      }

      if (!evaluatableExpression) return '0';
      
      const openParen = (evaluatableExpression.match(/\(/g) || []).length;
      const closeParen = (evaluatableExpression.match(/\)/g) || []).length;
      if (openParen > closeParen) {
        evaluatableExpression += ')'.repeat(openParen - closeParen);
      }

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
  
  const handleAbs = () => {
    if (isResult) {
      setExpression('abs(');
      setDisplay('abs(');
      setIsResult(false);
    } else {
      setExpression(prev => prev + 'abs(');
      setDisplay(prev => prev + 'abs(');
    }
  }

  const handleEquals = () => {
    if (expression) {
      const result = evaluateExpression(expression);
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
    if (isResult) {
      const currentVal = parseFloat(display);
      if (!isNaN(currentVal)) {
        const newVal = String(currentVal * -1);
        setDisplay(newVal);
        setExpression(newVal);
      }
      return;
    }

    if (expression === '0' || expression === '') return;

    // Regex to find the last number in the expression.
    const lastNumberRegex = /([+\-×÷(]|^)([\d.]+)$/;
    const match = expression.match(lastNumberRegex);

    if (match) {
        const prefix = match[1] || ''; // Operator or start of string
        let number = match[2];
        let newExpression;

        const matchIndex = expression.lastIndexOf(match[0]);
        const expressionPrefix = expression.substring(0, matchIndex);

        if (prefix === '+') {
            newExpression = `${expressionPrefix}-` + number;
        } else if (prefix === '-') {
            newExpression = `${expressionPrefix}+` + number;
        } else if (prefix === '' || prefix === '(') {
            newExpression = `${expressionPrefix}${prefix}-` + number;
        } else if (prefix === '×' || prefix === '÷') {
             newExpression = `${expressionPrefix}${prefix}(-` + number + ')';
        }
         
        if (newExpression) {
            setExpression(newExpression);
            setDisplay(newExpression);
        }
    } else if (!isNaN(parseFloat(expression))) {
        const num = parseFloat(expression);
        const newExp = String(num * -1);
        setExpression(newExp);
        setDisplay(newExp);
    }
};


  // Memory functions
    const handleMemoryClear = () => setMemory(math.bignumber(0));
    const handleMemoryRecall = () => {
      const memVal = math.format(memory);
      handleInput(memVal);
    }
    const handleMemoryStore = () => {
        try {
            const currentDisplayValue = evaluateExpression(isResult ? display : expression);
            if (currentDisplayValue === "Error") return;
            setMemory(math.bignumber(currentDisplayValue || '0'));
        } catch(e) {
            console.error("Invalid expression for MS");
        }
    }
    const handleMemoryAdd = () => {
      try {
        const currentDisplayValue = evaluateExpression(isResult ? display : expression);
        if (currentDisplayValue === "Error") return;
        const currentValue = math.bignumber(currentDisplayValue || '0');
        setMemory(math.add(memory, currentValue));
      } catch (e) {
        console.error("Invalid expression for M+");
      }
    };
    const handleMemorySubtract = () => {
       try {
        const currentDisplayValue = evaluateExpression(isResult ? display : expression);
        if (currentDisplayValue === "Error") return;
        const currentValue = math.bignumber(currentDisplayValue || '0');
        setMemory(math.subtract(memory, currentValue));
      } catch (e) {
        console.error("Invalid expression for M-");
      }
    };

    const funcBtnClass = "bg-secondary hover:bg-secondary/80";

  return (
      <div className="w-full max-w-sm mx-auto space-y-4">
          <Display value={display} expression={`${angleMode.toUpperCase()} | ${isResult ? `Ans = ${display}` : expression}`} />
          <div className="space-y-2">
            {/* Advanced Functions */}
            <div className="grid grid-cols-5 gap-2">
              <CalculatorButton onClick={() => setIsSecondFunctionActive(prev => !prev)} label="2nd" className={funcBtnClass} isActive={isSecondFunctionActive} />
              <CalculatorButton onClick={handleMemoryClear} label="MC" className={funcBtnClass} />
              <CalculatorButton onClick={handleMemoryRecall} label="MR" className={funcBtnClass} />
              <CalculatorButton onClick={handleMemoryAdd} label="M+" className={funcBtnClass} />
              <CalculatorButton onClick={handleMemorySubtract} label="M-" className={funcBtnClass} />
              
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'asin' : 'sin')} label={isSecondFunctionActive ? <InlineMath math="sin^{-1}" /> : "sin"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'acos' : 'cos')} label={isSecondFunctionActive ? <InlineMath math="cos^{-1}" /> : "cos"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'atan' : 'tan')} label={isSecondFunctionActive ? <InlineMath math="tan^{-1}" /> : "tan"} className={funcBtnClass} />
              <CalculatorButton onClick={toggleAngleMode} label={angleMode.toUpperCase()} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleConstant('pi')} label="π" className={funcBtnClass} />

              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'asinh' : 'sinh')} label={isSecondFunctionActive ? <InlineMath math="sinh^{-1}" /> : "sinh"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'acosh' : 'cosh')} label={isSecondFunctionActive ? <InlineMath math="cosh^{-1}" /> : "cosh"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'atanh' : 'tanh')} label={isSecondFunctionActive ? <InlineMath math="tanh^{-1}" /> : "tanh"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleConstant('e')} label="e" className={funcBtnClass} />
              <CalculatorButton onClick={() => handleOperator('!')} label="n!" className={funcBtnClass} />
              
              <CalculatorButton onClick={() => handleFunction('log')} label={"log"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction(isSecondFunctionActive ? 'log2' : 'ln')} label={isSecondFunctionActive ? <InlineMath math="log_2"/> : "ln"} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleFunction('exp')} label={<InlineMath math="e^x" />} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleOperator(isSecondFunctionActive ? '^3' : '^2')} label={isSecondFunctionActive ? <InlineMath math="x^3" /> : <InlineMath math="x^2" />} className={funcBtnClass} />
              <CalculatorButton onClick={() => handleOperator('^')} label={<InlineMath math="x^y" />} className={funcBtnClass} />
              
              <CalculatorButton onClick={() => handleOperator('sqrt(')} label="√" className={funcBtnClass} />
              <CalculatorButton onClick={() => handleOperator(isSecondFunctionActive ? '^(1/3)' : '^(1/')} label={isSecondFunctionActive ? <InlineMath math="\sqrt[3]{x}" /> : <InlineMath math="\sqrt[y]{x}" />} className={funcBtnClass} />
              <CalculatorButton onClick={handleReciprocal} label={<InlineMath math="1/x" />} className={funcBtnClass} />
              <CalculatorButton onClick={handleAbs} label="|x|" className={funcBtnClass} />
               <CalculatorButton onClick={backspace} label="⌫" className={funcBtnClass}/>
            </div>

            {/* Basic Numpad */}
            <div className="grid grid-cols-4 gap-2">
                <CalculatorButton onClick={clear} label="C" className="bg-secondary hover:bg-secondary/80 col-span-1" />
                <CalculatorButton onClick={toggleSign} label="±" className="bg-muted text-muted-foreground hover:bg-muted/80" />
                <CalculatorButton onClick={() => handleOperator('%')} label="%" className="bg-muted text-muted-foreground hover:bg-muted/80" />
                <CalculatorButton onClick={() => handleOperator('/')} label="÷" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleInput('7')} label="7" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('8')} label="8" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('9')} label="9" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('*')} label="×" className="bg-accent text-accent-foreground hover:bg-accent/80" />

                <CalculatorButton onClick={() => handleInput('4')} label="4" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('5')} label="5" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('6')} label="6" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('-')} label="−" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleInput('1')} label="1" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('2')} label="2" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleInput('3')} label="3" className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={() => handleOperator('+')} label="+" className="bg-accent text-accent-foreground hover:bg-accent/80" />
                
                <CalculatorButton onClick={() => handleInput('0')} label="0" className="bg-card hover:bg-muted col-span-2" />
                <CalculatorButton onClick={() => handleInput('.')} label="." className="bg-card hover:bg-muted" />
                <CalculatorButton onClick={handleEquals} label="=" className="bg-primary text-primary-foreground hover:bg-primary/90" />
            </div>
          </div>
      </div>
  );
}
