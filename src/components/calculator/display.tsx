"use client";

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface DisplayProps {
  value: string;
  expression?: string;
  isLatex?: boolean;
}

export const Display: React.FC<DisplayProps> = ({ value, expression, isLatex = false }) => {
  const formatNumber = (num: string) => {
    if (num === 'Error' || num === 'Infinity' || num === '-Infinity' || num === 'NaN') {
      return 'Error';
    }
    
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return 'Error';
    
    if (Math.abs(parsed) > 1e12 || (Math.abs(parsed) < 1e-9 && parsed !== 0)) {
      return parsed.toExponential(6);
    }
    
    return parsed.toLocaleString(undefined, { maximumFractionDigits: 10 });
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-4 text-right min-h-[112px] flex flex-col justify-end">
      {expression && (
        <div className="text-base text-muted-foreground mb-1 truncate" title={expression}>
          {isLatex ? (
            <InlineMath math={expression} />
          ) : (
            <span className="font-mono">{expression}</span>
          )}
        </div>
      )}
      
      <div className="text-right">
        {isLatex ? (
          <BlockMath math={value} />
        ) : (
          <div className="text-5xl font-mono overflow-x-auto overflow-y-hidden pb-1 break-all font-light">
            {formatNumber(value)}
          </div>
        )}
      </div>
    </div>
  );
};
