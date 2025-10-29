'use client';
import { useEffect, useState, useTransition } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';
import { triggerNewsFetch } from '@/app/actions';

import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';
import { Button } from '@/components/ui/button';

type NewsPageClientProps = {
    currentCountry?: string;
};

export function NewsPageClient({ currentCountry = 'global' }: NewsPageClientProps) {
  const firestore = useFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, startFetching] = useTransition();

  useEffect(() => {
    if (!firestore) {
        return;
    }
    
    setLoading(true);

    const articlesQuery = currentCountry === 'global'
      ? query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'), limit(50))
      : query(collection(firestore, 'news_articles'), where('country', '==', currentCountry), orderBy('pubDate', 'desc'), limit(50));

    // Perform an initial check to see if we need to fetch news
    getDocs(articlesQuery).then(initialSnapshot => {
        if (initialSnapshot.empty) {
            console.log('Firestore is empty, triggering server-side fetch...');
            startFetching(async () => {
                await triggerNewsFetch();
                // The onSnapshot listener below will automatically pick up the new data.
            });
        }
    });

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
  
  if (loading || isFetching) {
    return <NewsGridSkeleton />;
  }

  if (articles.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
        <h3 className="text-2xl font-bold tracking-tight">No News Found</h3>
        <p className="text-muted-foreground mb-4">It looks like there are no articles right now. Try fetching them.</p>
        <Button onClick={() => startFetching(async () => { await triggerNewsFetch() })} disabled={isFetching}>
            {isFetching ? 'Fetching...' : 'Fetch News'}
        </Button>
      </div>
    );
  }

  return <NewsGrid articles={articles} />;
}
