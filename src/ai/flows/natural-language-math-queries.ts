// src/ai/flows/natural-language-math-queries.ts
'use server';

/**
 * @fileOverview A natural language math query AI agent.
 *
 * - naturalLanguageMathQuery - A function that handles natural language math queries.
 * - NaturalLanguageMathQueryInput - The input type for the naturalLanguageMathQuery function.
 * - NaturalLanguageMathQueryOutput - The return type for the naturalLanguageMathQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageMathQueryInputSchema = z.object({
  query: z.string().describe('The natural language math query.'),
});
export type NaturalLanguageMathQueryInput = z.infer<
  typeof NaturalLanguageMathQueryInputSchema
>;

const NaturalLanguageMathQueryOutputSchema = z.object({
  result: z.string().describe('The result of the math query.'),
  explanation: z
    .string()
    .describe('The step-by-step explanation of how the result was obtained.'),
});
export type NaturalLanguageMathQueryOutput = z.infer<
  typeof NaturalLanguageMathQueryOutputSchema
>;

export async function naturalLanguageMathQuery(
  input: NaturalLanguageMathQueryInput
): Promise<NaturalLanguageMathQueryOutput> {
  return naturalLanguageMathQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'naturalLanguageMathQueryPrompt',
  input: {schema: NaturalLanguageMathQueryInputSchema},
  output: {schema: NaturalLanguageMathQueryOutputSchema},
  prompt: `You are a mathematical expert. You will take the user's math query and return the result and step by step explanation.

Query: {{{query}}}

Result: 
Explanation: `,
});

const naturalLanguageMathQueryFlow = ai.defineFlow(
  {
    name: 'naturalLanguageMathQueryFlow',
    inputSchema: NaturalLanguageMathQueryInputSchema,
    outputSchema: NaturalLanguageMathQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
