'use client';
import { useEffect, useState, Suspense } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';
import { triggerNewsFetch } from '@/app/actions';

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { TrendingTags } from '@/components/trending-tags';
import { SubscriptionForm } from '@/components/subscription-form';
import { CountrySelector } from '@/components/country-selector';
import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';

function PageContent() {
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || 'global';
  const firestore = useFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (!firestore) return;

    const articlesCollection = collection(firestore, 'news_articles');

    const fetchInitialNews = async () => {
      const snapshot = await getDocs(query(articlesCollection, where('country', '==', 'us'))); // Check one source
      if (snapshot.empty) {
        console.warn("⚠️ Firestore empty — fetching fallback news...");
        await triggerNewsFetch();
      }
      // The onSnapshot listener will handle displaying the data once it's available
    };

    fetchInitialNews();

    const articlesQuery = country === 'global'
      ? query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'))
      : query(collection(firestore, 'news_articles'), where('country', '==', country), orderBy('pubDate', 'desc'));

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
  }, [country, firestore]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <div className="space-y-8">
            <TrendingTags tags={trendingTags} />
            <SubscriptionForm />
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b sm:p-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <CountrySelector currentCountry={country} />
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="p-4 sm:p-6">
          {loading ? <NewsGridSkeleton /> : <NewsGrid articles={articles} />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<NewsGridSkeleton />}>
      <PageContent />
    </Suspense>
  );
}