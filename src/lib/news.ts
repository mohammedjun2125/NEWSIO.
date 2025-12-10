export type NewsArticle = {
  id?: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  pubDate: string;
  source: string;
  country: string;
  image?: string;
};

export async function fetchNewsFromRSS(country: string = 'global'): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`/api/news?country=${country}`);
    if (!response.ok) {
      console.error(`Failed to fetch news from API: ${response.statusText}`);
      return [];
    }
    const articles = await response.json();
    return articles;
  } catch (error) {
    console.error(`Failed to fetch news from API:`, error);
    return [];
  }
}
