'use server';
/**
 * @fileOverview This file defines a Genkit flow to extract trending tags from news articles.
 *
 * The flow takes an array of news article summaries as input and returns an array of trending tags.
 * - `extractTrendingTags`: Extracts trending tags from the given news articles.
 * - `TrendingTagsInput`: The input type for the `extractTrendingTags` function.
 * - `TrendingTagsOutput`: The output type for the `extractTrendingTags` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingTagsInputSchema = z.object({
  newsArticles: z
    .array(z.string())
    .describe('An array of news article summaries.'),
});
export type TrendingTagsInput = z.infer<typeof TrendingTagsInputSchema>;

const TrendingTagsOutputSchema = z.object({
  trendingTags: z
    .array(z.string())
    .describe('An array of trending tags extracted from the news articles.'),
});
export type TrendingTagsOutput = z.infer<typeof TrendingTagsOutputSchema>;

export async function extractTrendingTags(input: TrendingTagsInput): Promise<TrendingTagsOutput> {
  return trendingTagsFlow(input);
}

const trendingTagsPrompt = ai.definePrompt({
  name: 'trendingTagsPrompt',
  input: {schema: TrendingTagsInputSchema},
  output: {schema: TrendingTagsOutputSchema},
  prompt: `You are an AI assistant that extracts trending tags from a list of news articles.

  News Articles:
  {{#each newsArticles}}
  - {{{this}}}
  {{/each}}

  Extract the trending tags from the above news articles. Return an array of strings.
  Do not include any descriptions or explanations, only the tags themselves.
  Limit the number of tags to 10.
  `,
});

const trendingTagsFlow = ai.defineFlow(
  {
    name: 'trendingTagsFlow',
    inputSchema: TrendingTagsInputSchema,
    outputSchema: TrendingTagsOutputSchema,
  },
  async input => {
    const {output} = await trendingTagsPrompt(input);
    return output!;
  }
);
