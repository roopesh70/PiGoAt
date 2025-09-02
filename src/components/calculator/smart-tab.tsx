"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { smartConvert } from '@/ai/flows/smart-conversion';
import { Bot, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function SmartTab() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleQuery = async () => {
        setError(null);
        setResult(null);
        if (!query) {
            setError("Please enter a query.");
            return;
        }
        setIsLoading(true);
        try {
            const conversionResult = await smartConvert({ query });
            setResult(conversionResult.result);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    };

    const handleExampleClick = (exampleQuery: string) => {
        setQuery(exampleQuery);
        setError(null);
        setResult(null);
    };

    const examples = [
        '100 USD to INR',
        '5 km to miles',
        '10 kg to lbs',
        '30 C to F',
        '2500 kcal to kj',
        '150 hp to watts'
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-semibold">Smart Mode</h3>
                <p className="text-muted-foreground">For quick conversions and calculations.</p>
            </div>
            
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="text"
                    placeholder="e.g., 100 USD to INR or 5 km to miles"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />
                <Button onClick={handleQuery} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Bot />}
                     Go
                </Button>
            </div>

            {error && (
                 <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
                <Card className="animate-in fade-in duration-500">
                    <CardHeader>
                        <CardTitle>Conversion Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold font-mono text-primary">{result}</p>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                        Examples
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {examples.map((example, index) => (
                            <li key={index} >
                                <button onClick={() => handleExampleClick(example)} className="text-left hover:underline focus:outline-none focus:underline" disabled={isLoading}>
                                    {example}
                                </button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
