import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

type NewsArticle = {
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

function extractImageUrl(item: Parser.Item): string | undefined {
    if (item.enclosure && item.enclosure.url) {
        return item.enclosure.url;
    }
    if (item['media:content'] && item['media:content'].$.url) {
        return item['media:content'].$.url;
    }
     if (item.content) {
        const imageRegexs = [
          /<img[^>]+src="([^">]+)"/,
          /<figure[^>]*>.*?<img[^>]+src="([^">]+)"/s,
          /image"\s*:\s*"([^"]+)"/,
        ];

        for (const regex of imageRegexs) {
            const match = item.content.match(regex);
            if (match && match[1]) {
                return match[1];
            }
        }
    }
    return undefined;
}


async function fetchFeed(parser: Parser, feed: FeedSource): Promise<NewsArticle[]> {
  try {
    const feedData = await parser.parseURL(feed.url);
    
    return feedData.items.map(item => {
      const title = item.title || '';
      const link = item.link || '';
      if (!title || !link) return null;
      
      const summaryContent = item.contentSnippet || item.content || '';
      const summary = summaryContent.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

      return {
        title,
        summary,
        content: item.content || summary,
        url: link,
        pubDate: item.pubDate || new Date().toISOString(),
        source: feed.sourceName,
        country: feed.country,
        image: extractImageUrl(item),
      };
    }).filter((article): article is NewsArticle => article !== null);

  } catch (error) {
    console.error(`Failed to fetch or parse feed from ${feed.url}:`, error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'global';
  
  const targetFeeds = country === 'global' ? feeds : feeds.filter(f => f.country === country);
  
  const parser = new Parser({
      customFields: {
        item: [['media:content', 'media:content', {keepArray: false}]],
      }
  });

  const allArticles = await Promise.all(targetFeeds.map(feed => fetchFeed(parser, feed)));
  
  const sortedArticles = allArticles
    .flat()
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);

  return NextResponse.json(sortedArticles);
}
