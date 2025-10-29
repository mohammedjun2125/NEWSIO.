'use server';
/**
 * @fileOverview A flow for summarizing news articles.
 *
 * - summarizeArticle - A function that handles the article summarization.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleContent: z.string().describe('The full text content of the news article to be summarized.'),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('A concise, easy-to-read summary of the provided article.'),
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {schema: SummarizeArticleInputSchema},
  output: {schema: SummarizeArticleOutputSchema},
  prompt: `You are an expert news analyst. Your task is to provide a clear and concise summary of the following news article. Extract the key points and present them in a paragraph.

Article Content:
{{{articleContent}}}`,
});

const summarizeArticleFlow = ai.defineFlow(
  {
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeArticlePrompt(input);
    return output!;
  }
);
