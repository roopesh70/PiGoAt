'use server';

/**
 * @fileOverview A smart conversion AI agent.
 *
 * - smartConvert - A function that handles natural language unit and currency conversions.
 * - SmartConversionInput - The input type for the smartConvert function.
 * - SmartConversionOutput - The return type for the smartConvert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartConversionInputSchema = z.object({
  query: z.string().describe('A natural language query for unit or currency conversion, e.g., "100 USD to INR" or "5km to miles".'),
});
export type SmartConversionInput = z.infer<typeof SmartConversionInputSchema>;

const SmartConversionOutputSchema = z.object({
  result: z.string().describe('The result of the conversion, formatted as a string, e.g., "100 USD = 8350.00 INR".'),
});
export type SmartConversionOutput = z.infer<typeof SmartConversionOutputSchema>;

export async function smartConvert(
  input: SmartConversionInput
): Promise<SmartConversionOutput> {
  return smartConvertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartConvertPrompt',
  input: {schema: SmartConversionInputSchema},
  output: {schema: SmartConversionOutputSchema},
  prompt: `You are a smart calculator that can perform unit and currency conversions based on a natural language query.
  
  Take the user's query, perform the calculation, and return only the formatted result string.
  
  Examples:
  Query: "100 USD to INR"
  Result: "100 USD = 8350.00 INR"
  
  Query: "5 km to miles"
  Result: "5 km = 3.11 miles"

  Query: "30 C to F"
  Result: "30°C = 86.00°F"
  
  Query: {{{query}}}
  `,
});

const smartConvertFlow = ai.defineFlow(
  {
    name: 'smartConvertFlow',
    inputSchema: SmartConversionInputSchema,
    outputSchema: SmartConversionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a valid conversion from the AI.');
    }
    return output;
  }
);
