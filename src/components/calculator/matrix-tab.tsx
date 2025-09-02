"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addMatrices, multiplyMatrices, determinant } from '@/lib/math-helpers';
import { toast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

type Matrix = number[][];
type UnaryOperationTarget = 'A' | 'B';

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

const SizeSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}:</label>
        <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger className="w-20">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {[1,2,3,4,5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
);


export default function MatrixTab() {
    const createEmptyMatrix = (rows: number, cols: number) => Array.from({ length: rows }, () => Array(cols).fill(0));

    const [rowsA, setRowsA] = useState(2);
    const [colsA, setColsA] = useState(2);
    const [rowsB, setRowsB] = useState(2);
    const [colsB, setColsB] = useState(2);

    const [matrixA, setMatrixA] = useState<Matrix>(createEmptyMatrix(2, 2));
    const [matrixB, setMatrixB] = useState<Matrix>(createEmptyMatrix(2, 2));
    const [result, setResult] = useState<Matrix | number | null>(null);
    const [unaryOpTarget, setUnaryOpTarget] = useState<UnaryOperationTarget>('A');


    const handleSizeChangeA = (dimension: 'rows' | 'cols', valueStr: string) => {
        const value = parseInt(valueStr, 10);
        let newRows = rowsA, newCols = colsA;
        if (dimension === 'rows') {
            newRows = value;
            setRowsA(value);
        } else {
            newCols = value;
            setColsA(value);
        }
        setMatrixA(createEmptyMatrix(newRows, newCols));
        setResult(null);
    };
    
    const handleSizeChangeB = (dimension: 'rows' | 'cols', valueStr: string) => {
        const value = parseInt(valueStr, 10);
        let newRows = rowsB, newCols = colsB;
        if (dimension === 'rows') {
            newRows = value;
            setRowsB(value);
        } else {
            newCols = value;
            setColsB(value);
        }
        setMatrixB(createEmptyMatrix(newRows, newCols));
        setResult(null);
    };

    const isMatrixASquare = rowsA > 0 && rowsA === colsA;
    const isMatrixBSquare = rowsB > 0 && rowsB === colsB;
    const isTargetMatrixSquare = unaryOpTarget === 'A' ? isMatrixASquare : isMatrixBSquare;

    const handleOperation = (op: 'add' | 'multiply' | 'determinant' | 'inverse' | 'eigenvalues') => {
        setResult(null);
        try {
            switch (op) {
                case 'add':
                    if (rowsA !== rowsB || colsA !== colsB) {
                        toast({ variant: 'destructive', title: 'Error', description: 'Matrices must have the same dimensions for addition.' });
                        return;
                    }
                    setResult(addMatrices(matrixA, matrixB));
                    break;
                case 'multiply':
                    if (colsA !== rowsB) {
                        toast({ variant: 'destructive', title: 'Error', description: "For multiplication, Matrix A's columns must equal Matrix B's rows." });
                        return;
                    }
                    setResult(multiplyMatrices(matrixA, matrixB));
                    break;
                case 'determinant':
                     if (!isTargetMatrixSquare) {
                        toast({ variant: 'destructive', title: 'Error', description: `Matrix ${unaryOpTarget} must be square for this operation.` });
                        return;
                    }
                    setResult(determinant(unaryOpTarget === 'A' ? matrixA : matrixB));
                    break;
                case 'inverse':
                case 'eigenvalues':
                     if (!isTargetMatrixSquare) {
                        toast({ variant: 'destructive', title: 'Error', description: `Matrix ${unaryOpTarget} must be square for this operation.` });
                        return;
                    }
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
            <div className="text-center">
                 <h3 className="text-2xl font-semibold">Matrix Operations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <h4 className="font-medium text-lg">Matrix A</h4>
                    <div className="flex gap-4">
                       <SizeSelector label="Rows" value={rowsA} onChange={(v) => handleSizeChangeA('rows', v)} />
                       <SizeSelector label="Cols" value={colsA} onChange={(v) => handleSizeChangeA('cols', v)} />
                    </div>
                    <MatrixInput matrix={matrixA} setMatrix={setMatrixA} />
                </div>
                <div className="space-y-4">
                    <h4 className="font-medium text-lg">Matrix B</h4>
                    <div className="flex gap-4">
                       <SizeSelector label="Rows" value={rowsB} onChange={(v) => handleSizeChangeB('rows', v)} />
                       <SizeSelector label="Cols" value={colsB} onChange={(v) => handleSizeChangeB('cols', v)} />
                    </div>
                    <MatrixInput matrix={matrixB} setMatrix={setMatrixB} />
                </div>
            </div>
            
            <Separator />

            <div className="space-y-4">
                <h4 className="font-medium text-center">Operations</h4>
                <div className="flex justify-center items-center gap-4">
                     <p className="text-sm font-medium">Target:</p>
                    <RadioGroup value={unaryOpTarget} onValueChange={(v) => setUnaryOpTarget(v as UnaryOperationTarget)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                           <RadioGroupItem value="A" id="r_a" />
                           <Label htmlFor="r_a">Matrix A</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                           <RadioGroupItem value="B" id="r_b" />
                           <Label htmlFor="r_b">Matrix B</Label>
                        </div>
                    </RadioGroup>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <Button onClick={() => handleOperation('add')}>A + B</Button>
                    <Button onClick={() => handleOperation('multiply')}>A × B</Button>
                    <Button onClick={() => handleOperation('determinant')} disabled={!isTargetMatrixSquare}>Determinant</Button>
                    <Button onClick={() => handleOperation('inverse')} disabled={!isTargetMatrixSquare}>Inverse</Button>
                    <Button onClick={() => handleOperation('eigenvalues')} disabled={!isTargetMatrixSquare}>Eigenvalues</Button>
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
                            <div className="space-y-2 overflow-x-auto">
                                {result.map((row, r) => (
                                    <div key={r} className="flex gap-2">
                                        {row.map((val, c) => (
                                            <div key={c} className="w-20 h-10 flex-shrink-0 flex items-center justify-center bg-muted rounded">
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
