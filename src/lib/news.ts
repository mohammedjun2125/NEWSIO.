'use server';
import Parser from 'rss-parser';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

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
  // AI-generated fields
  category?: string;
  keywords?: string[];
  hashtags?: string[];
  seo_meta?: string;
  ai_processed?: boolean;
  createdAt?: any;
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


async function fetchAndStoreFeed(feed: FeedSource, db: FirebaseFirestore.Firestore) {
  try {
    const parsedFeed = await parser.parseURL(feed.url);
    const articlesCollection = collection(db, 'news_articles');

    for (const item of parsedFeed.items) {
      if (!item.title || !item.link) continue;

      const q = query(articlesCollection, where('url', '==', item.link));
      const existingDocs = await getDocs(q);

      if (existingDocs.empty) {
        const article: Omit<NewsArticle, 'id'> = {
          title: item.title,
          summary: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
          content: item.content || item.contentSnippet || '',
          url: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          source: feed.sourceName,
          country: feed.country,
          image: extractImageUrl(item) || `https://picsum.photos/seed/${item.link.length}/600/400`,
          ai_processed: false,
          createdAt: serverTimestamp(),
        };
        await addDoc(articlesCollection, article);
      }
    }
    console.log(`Fetched and stored articles from ${feed.sourceName}`);
  } catch (error) {
    console.error(`Failed to fetch feed from ${feed.url}:`, error);
  }
}

export async function fetchNewsAndStoreInFirestore() {
  const { firestore: db } = initializeFirebase();
  console.log('Starting RSS fetch...');
  
  await Promise.all(feeds.map(feed => fetchAndStoreFeed(feed, db)));
  
  console.log('Finished fetching all RSS feeds.');
}
