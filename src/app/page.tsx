
import { Suspense } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SubscriptionForm } from '@/components/subscription-form';
import Loading from './loading';
import { NewsPageClient } from './news-page-client';
import { TrendingTags } from '@/components/trending-tags';
import { CountrySelector } from '@/components/country-selector';

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
            <Suspense fallback={<div className="space-y-2"><div className="h-4 w-1/3 bg-muted rounded animate-pulse" /><div className="flex flex-wrap gap-2">{[...Array(8)].map((_, i) => (<div key={i} className="h-6 w-20 bg-muted rounded-full animate-pulse" />))}</div></div>}>
              <TrendingTags />
            </Suspense>
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
          <Suspense fallback={<Loading />}>
            <NewsPageClient currentCountry={country} />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
