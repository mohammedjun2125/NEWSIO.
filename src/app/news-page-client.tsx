'use client';
import { useEffect, useState } from 'react';
import type { NewsArticle } from '@/lib/news';
import { fetchNewsFromRSS } from '@/lib/news';

import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';

type NewsPageClientProps = {
    currentCountry?: string;
};

export function NewsPageClient({ currentCountry = 'global' }: NewsPageClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getNews = async () => {
        setLoading(true);
        try {
            const fetchedArticles = await fetchNewsFromRSS(currentCountry);
            setArticles(fetchedArticles);
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setArticles([]); // Clear articles on error
        } finally {
            setLoading(false);
        }
    };
    
    getNews();
  }, [currentCountry]);
  
  if (loading) {
    return <NewsGridSkeleton />;
  }

  if (articles.length === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
        <h3 className="text-2xl font-bold tracking-tight">No News Found</h3>
        <p className="text-muted-foreground mb-4">Could not fetch news articles. Please try again later.</p>
      </div>
    );
  }

  return <NewsGrid articles={articles} />;
}
