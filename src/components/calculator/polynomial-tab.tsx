"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { solveQuadratic, getDerivative, getIntegral, formatPolynomial, evaluatePolynomial } from '@/lib/math-helpers';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { PlusCircle, MinusCircle } from 'lucide-react';

const chartConfig = {
  polynomial: {
    label: "P(x)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function PolynomialTab() {
    const [coeffs, setCoeffs] = useState<number[]>([1, -3, 2]); // Start with quadratic
    const [result, setResult] = useState<string | null>(null);

    const degree = coeffs.length - 1;

    const handleCoeffChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newCoeffs = [...coeffs];
        newCoeffs[index] = parseFloat(e.target.value) || 0;
        setCoeffs(newCoeffs);
        setResult(null);
    };
    
    const addTerm = () => {
        setCoeffs([0, ...coeffs]);
        setResult(null);
    };

    const removeTerm = () => {
        if (coeffs.length > 2) {
            setCoeffs(coeffs.slice(1));
            setResult(null);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot have less than a linear equation.' });
        }
    };

    const handleOperation = (op: 'roots' | 'derivative' | 'integral') => {
        try {
            switch (op) {
                case 'roots':
                    if (degree === 2) {
                        const [a, b, c] = coeffs;
                        if (a === 0) {
                           toast({ variant: 'destructive', title: 'Error', description: 'Coefficient "a" cannot be zero for a quadratic equation.' });
                           return;
                        }
                        const roots = solveQuadratic(a, b, c);
                        setResult(`Roots: ${roots}`);
                    } else {
                       toast({ title: 'Info', description: 'Root finding is only supported for quadratic equations currently.' });
                    }
                    break;
                case 'derivative':
                    const deriv = getDerivative(coeffs);
                    setResult(`P'(x) = ${formatPolynomial(deriv)}`);
                    break;
                case 'integral':
                    const integ = getIntegral(coeffs);
                    setResult(`∫P(x)dx = ${formatPolynomial(integ)} + C`);
                    break;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        }
    };
    
    const chartData = useMemo(() => {
        if(coeffs.every(c => c === 0)) return [];
        const data = [];
        const minX = -10, maxX = 10;
        for (let x = minX; x <= maxX; x+= 0.5) {
            data.push({ x, polynomial: evaluatePolynomial(coeffs, x) });
        }
        return data;
    }, [coeffs]);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center">Polynomial Solver</h3>
            <div className="text-center text-muted-foreground break-all px-2">P(x) = {formatPolynomial(coeffs)}</div>

            <div className="space-y-3">
                {coeffs.map((coeff, i) => (
                    <div key={degree - i} className="flex items-center gap-2 justify-center">
                        <Input 
                            type="number" 
                            value={coeff} 
                            onChange={(e) => handleCoeffChange(e, i)} 
                            className="w-24 text-center" />
                         {degree - i > 1 && <span className="font-medium">x<sup>{degree - i}</sup> +</span>}
                         {degree - i === 1 && <span className="font-medium">x +</span>}
                         {degree - i === 0 && <span className="font-medium">(constant)</span>}
                    </div>
                ))}
            </div>
            
             <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={addTerm}>
                    <PlusCircle className="mr-2" /> Add Term
                </Button>
                <Button variant="outline" size="sm" onClick={removeTerm} disabled={coeffs.length <= 2}>
                    <MinusCircle className="mr-2" /> Remove Term
                </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={() => handleOperation('roots')} disabled={degree !== 2}>Find Roots</Button>
                <Button onClick={() => handleOperation('derivative')}>Derivative</Button>
                <Button onClick={() => handleOperation('integral')}>Integral</Button>
            </div>

            {result && (
                <Card className="animate-in fade-in duration-500">
                    <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-mono text-primary break-all">{result}</p></CardContent>
                </Card>
            )}

            <Card className="animate-in fade-in duration-500">
                <CardHeader><CardTitle>Graph of P(x)</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full h-64">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="polynomial" stroke="var(--color-polynomial)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
