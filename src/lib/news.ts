import Parser from 'rss-parser';

export type NewsArticle = {
  title: string;
  summary: string;
  url: string;
  pubDate: string;
  source: string;
};

type FeedSource = {
  sourceName: string;
  url: string;
};

const feeds: Record<string, FeedSource[]> = {
  us: [
    { sourceName: 'New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
    { sourceName: 'CNN', url: 'http://rss.cnn.com/rss/cnn_topstories.rss' },
  ],
  uk: [
    { sourceName: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
    { sourceName: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
  ],
  in: [
    { sourceName: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
    { sourceName: 'The Hindu', url: 'https://www.thehindu.com/feeder/default.rss' },
  ],
};

const parser = new Parser();

async function fetchFeed(feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const parsedFeed = await parser.parseURL(feed.url);
    return parsedFeed.items
      .map((item) => ({
        title: item.title || '',
        summary: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/gm, '').substring(0, 300) + '...',
        url: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.sourceName,
      }))
      .filter((item) => item.title && item.url);
  } catch (error) {
    console.error(`Failed to fetch feed from ${feed.url}:`, error);
    return [];
  }
}

export async function fetchNews(country: string): Promise<NewsArticle[]> {
  let feedsToFetch: FeedSource[] = [];

  if (country === 'global') {
    feedsToFetch = Object.values(feeds).flat();
  } else if (feeds[country]) {
    feedsToFetch = feeds[country];
  }

  if (feedsToFetch.length === 0) {
    return [];
  }
  
  const allArticles = await Promise.all(feedsToFetch.map(fetchFeed));
  
  const flattenedArticles = allArticles.flat();

  flattenedArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return flattenedArticles.slice(0, 50);
}
