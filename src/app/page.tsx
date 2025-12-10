import { Suspense } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import Loading from './loading';
import { CountrySelector } from '@/components/country-selector';
import { fetchNewsFromRSS, NewsArticle } from '@/lib/news';
import { NewsGrid } from '@/components/news-grid';

async function NewsFeed({ country }: { country: string }) {
  const articles = await fetchNewsFromRSS(country);
  
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
        <h3 className="text-2xl font-bold tracking-tight">No News Found</h3>
        <p className="text-muted-foreground mb-4">Could not fetch news articles. Please try again later.</p>
      </div>
    );
  }

  return <NewsGrid articles={articles} />;
}

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const country = typeof searchParams.country === 'string' ? searchParams.country : 'global';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <div className="space-y-8">
            {/* Future sidebar content can go here */}
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b sm:p-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <CountrySelector currentCountry={country} />
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="p-4 sm:p-6">
          <Suspense fallback={<Loading />}>
            <NewsFeed country={country} />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
