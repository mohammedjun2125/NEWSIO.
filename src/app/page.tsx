import { Suspense } from 'react';
import { headers } from 'next/headers';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import Loading from './loading';
import { CountrySelector } from '@/components/country-selector';
import type { NewsArticle } from '@/lib/news';
import { NewsGrid } from '@/components/news-grid';

async function NewsFeed({ country }: { country: string }) {
  const headerValues = headers();
  const host = headerValues.get('host') || 'localhost:9002';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const articles = await fetch(`${baseUrl}/api/news?country=${country}`)
    .then(res => {
      if (!res.ok) {
        console.error(`Failed to fetch news from API: ${res.statusText}`);
        return [];
      }
      return res.json();
    })
    .catch(error => {
      console.error(`Failed to fetch news from API:`, error);
      return [];
    });
  
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

export default function Home({ searchParams, params }: { 
    searchParams: { [key: string]: string | string[] | undefined },
    params: { country: string } 
}) {
  const countryFromPath = params.country;
  const countryFromQuery = typeof searchParams.country === 'string' ? searchParams.country : null;
  const country = countryFromPath || countryFromQuery || 'global';

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
