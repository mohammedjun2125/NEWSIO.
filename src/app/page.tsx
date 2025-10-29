import { Suspense } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

import { shouldFetchNews, fetchNewsAndStoreInFirestore, type NewsArticle } from '@/lib/news';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SubscriptionForm } from '@/components/subscription-form';
import Loading from './loading';
import { NewsPageClient } from './news-page-client';

async function getInitialArticles(country: string): Promise<NewsArticle[]> {
  const { firestore } = initializeFirebase();
  const articlesQuery = country === 'global'
      ? query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'), limit(50))
      : query(collection(firestore, 'news_articles'), where('country', '==', country), orderBy('pubDate', 'desc'), limit(50));

  const snapshot = await getDocs(articlesQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
}

async function getTrendingTags(): Promise<string[]> {
  const { firestore } = initializeFirebase();
  const articlesCollection = collection(firestore, 'news_articles');
  const snapshot = await getDocs(query(articlesCollection, orderBy('pubDate', 'desc'), limit(100)));

  const tagCounts: Record<string, number> = {};
  snapshot.forEach(doc => {
    const data = doc.data() as NewsArticle;
    if (data.ai_processed_data && data.ai_processed_data.hashtags) {
      data.ai_processed_data.hashtags.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts)
    .sort(([,a],[,b]) => b-a)
    .map(([tag]) => tag)
    .slice(0, 10);
}


export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const country = typeof searchParams.country === 'string' ? searchParams.country : 'global';

  if (await shouldFetchNews()) {
    console.log("⚠️ Stale or empty news collection, triggering fetch on server...");
    await fetchNewsAndStoreInFirestore();
  }
  
  const initialArticles = await getInitialArticles(country);
  const trendingTags = await getTrendingTags();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <div className="space-y-8">
             {/* TrendingTags and SubscriptionForm are client components, so they are fine here */}
            <NewsPageClient initialTrendingTags={trendingTags} />
            <SubscriptionForm />
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b sm:p-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
           {/* CountrySelector is a client component */}
          <NewsPageClient initialArticles={[]} currentCountry={country} />
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="p-4 sm:p-6">
          <Suspense fallback={<Loading />}>
            <NewsPageClient initialArticles={initialArticles} currentCountry={country} />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
