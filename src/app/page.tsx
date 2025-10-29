'use client';
import { Suspense, useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

import { useFirestore, initializeFirebase } from '@/firebase';
import type { NewsArticle } from '@/lib/news';

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { TrendingTags } from '@/components/trending-tags';
import { SubscriptionForm } from '@/components/subscription-form';
import { CountrySelector } from '@/components/country-selector';
import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';
import { useSearchParams } from 'next/navigation';
import { FirebaseProvider } from '@/firebase/provider';


function PageContent() {
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || 'global';
  const firestore = useFirestore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    let articlesQuery;
    if (country === 'global') {
      articlesQuery = query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'));
    } else {
      articlesQuery = query(collection(firestore, 'news_articles'), where('country', '==', country), orderBy('pubDate', 'desc'));
    }

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      const fetchedArticles: NewsArticle[] = [];
      const tagCounts: Record<string, number> = {};

      snapshot.forEach(doc => {
        const data = doc.data() as NewsArticle;
        fetchedArticles.push({ ...data, id: doc.id });
        if (data.hashtags) {
          data.hashtags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
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
  const { firebaseApp, firestore, auth } = initializeFirebase();
  
  if (!firebaseApp) {
    return <NewsGridSkeleton />;
  }

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore!} auth={auth!}>
      <Suspense fallback={<NewsGridSkeleton />}>
        <PageContent />
      </Suspense>
    </FirebaseProvider>
  )
}
