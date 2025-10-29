import Parser from 'rss-parser';

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

type FeedSource = {
  sourceName: string;
  url: string;
  country: string;
};

const feeds: FeedSource[] = [
    { sourceName: 'New York Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', country: 'us' },
    { sourceName: 'CNN', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', country: 'us' },
    { sourceName: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', country: 'uk' },
    { sourceName: 'The Guardian', url: 'https://www.theguardian.com/world/rss', country: 'uk' },
    { sourceName: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', country: 'in' },
    { sourceName: 'The Hindu', url: 'https://www.thehindu.com/feeder/default.rss', country: 'in' },
];

const parser = new Parser();
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function extractImageUrl(item: Parser.Item): string | undefined {
    if (item.enclosure && item.enclosure.url) {
        return item.enclosure.url;
    }
    if (item['media:content'] && item['media:content'].$.url) {
        return item['media:content'].$.url;
    }
    if (item.content) {
        const match = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (match) return match[1];
    }
    return undefined;
}

async function fetchFeed(feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const parsedFeed = await parser.parseURL(`${CORS_PROXY}${feed.url}`);
    if (!parsedFeed?.items) return [];

    return parsedFeed.items.map(item => {
      if (!item.title || !item.link) return null;
      return {
        title: item.title,
        summary: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        content: item.content || item.contentSnippet || '',
        url: item.link,
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.sourceName,
        country: feed.country,
        image: extractImageUrl(item) || `https://picsum.photos/seed/${item.link.length}/600/400`,
      };
    }).filter((article): article is NewsArticle => article !== null);
  } catch (error) {
    console.error(`Failed to fetch feed from ${feed.url}:`, error);
    return [];
  }
}

export async function fetchNewsFromRSS(country: string = 'global'): Promise<NewsArticle[]> {
  const targetFeeds = country === 'global' ? feeds : feeds.filter(f => f.country === country);
  
  const allArticles = await Promise.all(targetFeeds.map(feed => fetchFeed(feed)));
  
  return allArticles
    .flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);
}
