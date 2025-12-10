'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/lib/news';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Rss, Calendar, Globe } from 'lucide-react';

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className="flex flex-col md:flex-row h-full bg-card hover:bg-secondary/50 transition-all duration-300 transform hover:shadow-lg motion-reduce:transition-none motion-reduce:transform-none overflow-hidden">
        {article.image && (
          <div className="relative w-full md:w-1/3 h-48 md:h-auto">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              data-ai-hint="news article"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <div className={`flex flex-col flex-1 ${!article.image ? 'w-full' : 'md:w-2/3'}`}>
          <CardHeader>
            <CardTitle className="text-xl font-bold leading-tight font-headline group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {article.summary}
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full items-center text-xs text-muted-foreground">
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
                 <div className="flex items-center gap-1">
                    Read More
                    <Rss className="w-3 h-3" />
                </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    </a>
  );
}
