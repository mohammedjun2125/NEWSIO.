'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';
import { triggerNewsFetch } from '@/app/actions';

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
    if (!firestore) return;
    
    setLoading(true);

    const checkAndFetchNews = async () => {
      const articlesQuery = query(collection(firestore, 'news_articles'), limit(1));
      const initialSnapshot = await getDocs(articlesQuery);
      
      if (initialSnapshot.empty) {
        console.log("Firestore is empty, triggering news fetch...");
        await triggerNewsFetch();
      }
    };

    checkAndFetchNews();

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
      console.error("Error fetching articles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentCountry, firestore]);
  
  if (loading) {
    return <NewsGridSkeleton />;
  }

  return <NewsGrid articles={articles} />;
}
