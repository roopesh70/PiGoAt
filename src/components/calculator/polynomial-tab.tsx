"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { solveQuadratic, getDerivative, getIntegral } from '@/lib/math-helpers';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

type Coeffs = { a: number; b: number; c: number };

const chartConfig = {
  polynomial: {
    label: "P(x)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function PolynomialTab() {
    const [coeffs, setCoeffs] = useState<Coeffs>({ a: 1, b: -3, c: 2 });
    const [result, setResult] = useState<string | null>(null);

    const handleCoeffChange = (e: React.ChangeEvent<HTMLInputElement>, coeff: keyof Coeffs) => {
        setCoeffs({ ...coeffs, [coeff]: parseFloat(e.target.value) || 0 });
        setResult(null);
    };

    const handleOperation = (op: 'roots' | 'derivative' | 'integral') => {
        const { a, b, c } = coeffs;
        try {
            switch (op) {
                case 'roots':
                    if (a === 0) {
                        toast({ variant: 'destructive', title: 'Error', description: 'Coefficient "a" cannot be zero for a quadratic equation.' });
                        return;
                    }
                    const roots = solveQuadratic(a, b, c);
                    setResult(`Roots: ${roots}`);
                    break;
                case 'derivative':
                    const deriv = getDerivative(a, b);
                    setResult(`P'(x) = ${deriv.a}x + ${deriv.b}`);
                    break;
                case 'integral':
                    const integ = getIntegral(a, b, c);
                    setResult(`∫P(x)dx = ${integ.a.toFixed(2)}x³ + ${integ.b.toFixed(2)}x² + ${integ.c}x + C`);
                    break;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        }
    };
    
    const chartData = useMemo(() => {
        const { a, b, c } = coeffs;
        if(a === 0 && b === 0) return [];
        const data = [];
        for (let x = -10; x <= 10; x++) {
            data.push({ x, polynomial: a * x * x + b * x + c });
        }
        return data;
    }, [coeffs]);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center">Polynomial Solver (Quadratic)</h3>
            <div className="text-center text-muted-foreground">P(x) = ax² + bx + c</div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2">
                    <Input type="number" value={coeffs.a} onChange={(e) => handleCoeffChange(e, 'a')} className="w-20 text-center" />
                    <span className="font-medium">x² +</span>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="number" value={coeffs.b} onChange={(e) => handleCoeffChange(e, 'b')} className="w-20 text-center" />
                    <span className="font-medium">x +</span>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="number" value={coeffs.c} onChange={(e) => handleCoeffChange(e, 'c')} className="w-20 text-center" />
                </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button onClick={() => handleOperation('roots')}>Find Roots</Button>
                <Button onClick={() => handleOperation('derivative')}>Derivative</Button>
                <Button onClick={() => handleOperation('integral')}>Integral</Button>
            </div>

            {result && (
                <Card className="animate-in fade-in duration-500">
                    <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-mono text-primary">{result}</p></CardContent>
                </Card>
            )}

            <Card className="animate-in fade-in duration-500">
                <CardHeader><CardTitle>Graph of P(x)</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full h-64">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="polynomial" stroke="var(--color-polynomial)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
