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

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function extractImageUrl(item: Element): string | undefined {
    const mediaContent = item.querySelector('media\\:content');
    if (mediaContent && mediaContent.getAttribute('url')) {
        return mediaContent.getAttribute('url')!;
    }

    const enclosure = item.querySelector('enclosure');
    if (enclosure && enclosure.getAttribute('url')) {
        return enclosure.getAttribute('url')!;
    }
    
    const description = item.querySelector('description')?.textContent;
    if (description) {
        const match = description.match(/<img[^>]+src="([^">]+)"/);
        if (match) return match[1];
    }
    
    const contentEncoded = item.querySelector('content\\:encoded')?.textContent;
     if (contentEncoded) {
        const match = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
        if (match) return match[1];
    }

    return undefined;
}

async function fetchFeed(feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${CORS_PROXY}${feed.url}`);
    if (!response.ok) {
      console.error(`Failed to fetch feed from ${feed.url}: ${response.statusText}`);
      return [];
    }
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const items = Array.from(xml.querySelectorAll('item'));

    return items.map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      if (!title || !link) return null;
      
      const summaryContent = item.querySelector('description')?.textContent || item.querySelector('summary')?.textContent || '';
      const summary = summaryContent.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

      return {
        title,
        summary,
        content: item.querySelector('content\\:encoded')?.textContent || summary,
        url: link,
        pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
        source: feed.sourceName,
        country: feed.country,
        image: extractImageUrl(item) || `https://picsum.photos/seed/${link.length}/600/400`,
      };
    }).filter((article): article is NewsArticle => article !== null);

  } catch (error) {
    console.error(`Failed to parse feed from ${feed.url}:`, error);
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
