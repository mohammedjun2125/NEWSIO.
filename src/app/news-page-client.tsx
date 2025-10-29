'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';

import { TrendingTags } from '@/components/trending-tags';
import { CountrySelector } from '@/components/country-selector';
import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';

type NewsPageClientProps = {
    initialArticles?: NewsArticle[];
    initialTrendingTags?: string[];
    currentCountry?: string;
};

export function NewsPageClient({ initialArticles = [], initialTrendingTags = [], currentCountry = 'global' }: NewsPageClientProps) {
  const firestore = useFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [trendingTags, setTrendingTags] = useState<string[]>(initialTrendingTags);

  useEffect(() => {
    if (!firestore) return;
    
    // If we have initial articles, we're not in a hard-loading state.
    // The onSnapshot will update the list live without a skeleton.
    if(initialArticles.length > 0) {
        setLoading(false);
    } else {
        setLoading(true);
    }

    const articlesQuery = currentCountry === 'global'
      ? query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'))
      : query(collection(firestore, 'news_articles'), where('country', '==', currentCountry), orderBy('pubDate', 'desc'));

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      const fetchedArticles: NewsArticle[] = [];
      const tagCounts: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data() as NewsArticle;
        fetchedArticles.push({ ...data, id: doc.id });
        if (data.ai_processed_data && data.ai_processed_data.hashtags) {
          data.ai_processed_data.hashtags.forEach(tag => {
            const cleanTag = tag.replace('#', '');
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          });
        }
      });
      
      const sortedTags = Object.entries(tagCounts)
        .sort(([,a],[,b]) => b-a)
        .map(([tag]) => tag)
        .slice(0, 10);

      setTrendingTags(sortedTags);
      setArticles(fetchedArticles);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching articles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentCountry, firestore, initialArticles.length]);
  
  if (initialArticles.length === 0 && initialTrendingTags.length === 0) {
    return <CountrySelector currentCountry={currentCountry} />;
  }

  if (initialArticles.length > 0) {
     return loading ? <NewsGridSkeleton /> : <NewsGrid articles={articles} />;
  }
  
  if (initialTrendingTags.length > 0) {
      return <TrendingTags tags={trendingTags} />;
  }

  return null;
}
