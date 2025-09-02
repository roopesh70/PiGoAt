"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseSmartQuery } from '@/lib/conversion-helpers';
import { Bot, Lightbulb } from 'lucide-react';

export default function SmartTab() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleQuery = () => {
        setError(null);
        setResult(null);
        if (!query) {
            setError("Please enter a query.");
            return;
        }
        try {
            const conversionResult = parseSmartQuery(query);
            setResult(conversionResult);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
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
                />
                <Button onClick={handleQuery}>
                    <Bot className="mr-2 h-4 w-4" /> Go
                </Button>
            </div>

            {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
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
                                <button onClick={() => handleExampleClick(example)} className="text-left hover:underline focus:outline-none focus:underline">
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
