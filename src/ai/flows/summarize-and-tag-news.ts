'use server';
/**
 * @fileOverview This file defines a Genkit flow for processing news articles.
 * It summarizes the article, extracts SEO keywords and hashtags, categorizes it,
 * and generates an SEO-optimized meta description.
 *
 * - processNewsArticle - The main function to process a news article.
 * - NewsArticleInput - The input type for the processing flow.
 * - NewsArticleOutput - The output type for the processing flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const NewsArticleInputSchema = z.object({
  content: z.string().describe('The full text content of the news article.'),
});
export type NewsArticleInput = z.infer<typeof NewsArticleInputSchema>;

export const NewsArticleOutputSchema = z.object({
  summary: z.string().describe('A short summary of the article, under 100 words.'),
  category: z
    .string()
    .describe(
      'The detected topic of the article (e.g., politics, tech, sports, economy, world, entertainment).'
    ),
  keywords: z.array(z.string()).describe('3-5 relevant SEO keywords.'),
  hashtags: z.array(z.string()).describe('2-3 relevant hashtags (including the #).'),
  seo_meta: z
    .string()
    .describe(
      'A one-line SEO meta description optimized for tier-1 countries (US, UK, Canada, Australia, EU).'
    ),
});
export type NewsArticleOutput = z.infer<typeof NewsArticleOutputSchema>;

export async function processNewsArticle(
  input: NewsArticleInput
): Promise<NewsArticleOutput> {
  return newsProcessorFlow(input);
}

const newsProcessorPrompt = ai.definePrompt({
  name: 'newsProcessorPrompt',
  input: { schema: NewsArticleInputSchema },
  output: { schema: NewsArticleOutputSchema },
  system: `You are an autonomous AI assistant embedded inside a Firebase project.
Your job is to process and enhance publicly fetched news data — no API key or external API calls are required by the user.

Tasks:
1. Accept plain text news articles from Firestore (triggered by a Cloud Function or schedule).
2. Summarize each article in under 100 words.
3. Extract 3–5 relevant SEO keywords and 2–3 hashtags.
4. Generate a one-line SEO meta description optimized for tier-1 countries (US, UK, Canada, Australia, EU).
5. Detect and include the article’s topic (politics, tech, sports, economy, world, entertainment, etc.).
6. Return a structured JSON output that your Firestore-triggered Cloud Function can store in the summary, tags, and seo fields.

Important:
- Never call external APIs or require API keys.
- Work only on text provided by the Firebase system.
- Generate text in fluent English, optimized for search discoverability in tier-1 markets.
- Keep tone modern, factual, and professional.`,
  prompt: `Process the following news article content:

{{{content}}}
`,
});

const newsProcessorFlow = ai.defineFlow(
  {
    name: 'newsProcessorFlow',
    inputSchema: NewsArticleInputSchema,
    outputSchema: NewsArticleOutputSchema,
  },
  async (input) => {
    const { output } = await newsProcessorPrompt(input);
    if (!output) {
      throw new Error('Failed to process news article.');
    }
    return output;
  }
);
