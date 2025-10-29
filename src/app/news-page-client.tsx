'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';

import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';

type NewsPageClientProps = {
    currentCountry?: string;
};

export function NewsPageClient({ currentCountry = 'global' }: NewsPageClientProps) {
  const firestore = useFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
        // Firestore might not be available on first render, so we wait.
        return;
    }
    
    setLoading(true);

    const articlesQuery = currentCountry === 'global'
      ? query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'), limit(50))
      : query(collection(firestore, 'news_articles'), where('country', '==', currentCountry), orderBy('pubDate', 'desc'), limit(50));

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      const fetchedArticles: NewsArticle[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsArticle));
      
      setArticles(fetchedArticles);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching articles in real-time:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentCountry, firestore]);
  
  if (loading) {
    return <NewsGridSkeleton />;
  }

  return <NewsGrid articles={articles} />;
}
