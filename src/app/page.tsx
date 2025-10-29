import { Suspense } from 'react';
import { fetchNews } from '@/lib/news';

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { TrendingTags } from '@/components/trending-tags';
import { SubscriptionForm } from '@/components/subscription-form';
import { CountrySelector } from '@/components/country-selector';
import { NewsGrid } from '@/components/news-grid';
import { NewsGridSkeleton } from '@/components/news-grid-skeleton';

export const revalidate = 3600; // Revalidate every hour

export default async function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const country = typeof searchParams?.country === 'string' ? searchParams.country : 'global';

  const articles = await fetchNews(country);

  // AI logic will be handled by a separate backend process.
  const trendingTags: string[] = []; // This will be populated from Firestore in a future step.

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
          <Suspense fallback={<NewsGridSkeleton />}>
            <NewsGrid articles={articles} />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
