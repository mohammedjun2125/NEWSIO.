import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/lib/news';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rss, Calendar, Globe } from 'lucide-react';

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="flex flex-col h-full bg-card/50 hover:bg-card/90 transition-colors duration-300 transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none">
      <CardHeader>
        <CardTitle className="text-lg font-bold leading-tight font-headline">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <Globe className="w-3 h-3"/>
                <span>{article.source}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3"/>
                <time dateTime={article.pubDate}>
                {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
                </time>
            </div>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read More
            <Rss className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
