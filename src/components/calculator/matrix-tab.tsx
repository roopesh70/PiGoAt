"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addMatrices, multiplyMatrices, determinant } from '@/lib/math-helpers';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

type Matrix = number[][];

const MatrixInput = ({ matrix, setMatrix }: { matrix: Matrix, setMatrix: (m: Matrix) => void }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, r: number, c: number) => {
        const newMatrix = matrix.map(row => [...row]);
        newMatrix[r][c] = parseFloat(e.target.value) || 0;
        setMatrix(newMatrix);
    };

    return (
        <div className="space-y-2">
            {matrix.map((row, r) => (
                <div key={r} className="flex gap-2">
                    {row.map((val, c) => (
                        <Input
                            key={c}
                            type="number"
                            value={val}
                            onChange={(e) => handleInputChange(e, r, c)}
                            className="w-16 text-center"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default function MatrixTab() {
    const [size, setSize] = useState(2);
    const createEmptyMatrix = (s: number) => Array.from({ length: s }, () => Array(s).fill(0));

    const [matrixA, setMatrixA] = useState<Matrix>(createEmptyMatrix(2));
    const [matrixB, setMatrixB] = useState<Matrix>(createEmptyMatrix(2));
    const [result, setResult] = useState<Matrix | number | null>(null);

    const handleSizeChange = (newSizeStr: string) => {
        const newSize = parseInt(newSizeStr, 10);
        setSize(newSize);
        setMatrixA(createEmptyMatrix(newSize));
        setMatrixB(createEmptyMatrix(newSize));
        setResult(null);
    };

    const handleOperation = (op: 'add' | 'multiply' | 'determinantA' | 'inverseA' | 'eigenvaluesA') => {
        setResult(null);
        try {
            switch (op) {
                case 'add':
                    setResult(addMatrices(matrixA, matrixB));
                    break;
                case 'multiply':
                    setResult(multiplyMatrices(matrixA, matrixB));
                    break;
                case 'determinantA':
                    setResult(determinant(matrixA));
                    break;
                case 'inverseA':
                case 'eigenvaluesA':
                    toast({ title: 'Coming Soon!', description: 'This feature is under development.' });
                    break;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Matrix Operations</h3>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Size:</label>
                    <Select value={String(size)} onValueChange={handleSizeChange}>
                        <SelectTrigger className="w-24">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2x2</SelectItem>
                            <SelectItem value="3">3x3</SelectItem>
                            <SelectItem value="4">4x4</SelectItem>
                            <SelectItem value="5">5x5</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <h4 className="font-medium mb-2">Matrix A</h4>
                    <MatrixInput matrix={matrixA} setMatrix={setMatrixA} />
                </div>
                <div>
                    <h4 className="font-medium mb-2">Matrix B</h4>
                    <MatrixInput matrix={matrixB} setMatrix={setMatrixB} />
                </div>
            </div>
            
            <Separator />

            <div className="space-y-2">
                <h4 className="font-medium">Operations</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <Button onClick={() => handleOperation('add')}>A + B</Button>
                    <Button onClick={() => handleOperation('multiply')}>A × B</Button>
                    <Button onClick={() => handleOperation('determinantA')}>det(A)</Button>
                    <Button onClick={() => handleOperation('inverseA')}>inv(A)</Button>
                    <Button onClick={() => handleOperation('eigenvaluesA')}>eig(A)</Button>
                </div>
            </div>

            {result !== null && (
                <Card className="animate-in fade-in duration-500">
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {typeof result === 'number' ? (
                            <p className="text-3xl font-mono font-bold text-primary">{result}</p>
                        ) : (
                            <div className="space-y-2">
                                {result.map((row, r) => (
                                    <div key={r} className="flex gap-2">
                                        {row.map((val, c) => (
                                            <div key={c} className="w-16 h-10 flex items-center justify-center bg-muted rounded">
                                                {val.toFixed(2)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
