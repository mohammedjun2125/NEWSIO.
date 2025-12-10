import type { NewsArticle } from '@/lib/news';
import { NewsCard } from './news-card';

type NewsGridProps = {
  articles: NewsArticle[];
};

export function NewsGrid({ articles }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
        <h3 className="text-2xl font-bold tracking-tight">No News Found</h3>
        <p className="text-muted-foreground">Try selecting a different country or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {articles.map((article, index) => (
        <NewsCard key={`${article.url}-${index}`} article={article} />
      ))}
    </div>
  );
}
