'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/lib/news';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rss, Calendar, Globe, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { summarizeArticle } from '@/ai/flows/summarize-article-flow';

type NewsCardProps = {
  article: NewsArticle;
};

export function NewsCard({ article }: NewsCardProps) {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSummarize = async () => {
    if (!article.content) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeArticle({ articleContent: article.content });
      setSummary(result.summary);
    } catch (error) {
      console.error("Failed to summarize article:", error);
      setSummary("Sorry, we couldn't generate a summary for this article.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  return (
    <Card className="flex flex-col h-full bg-card/50 hover:bg-card/90 transition-colors duration-300 transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:transform-none">
      {article.image && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full h-48">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg"
              data-ai-hint="news article"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </a>
      )}
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
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex justify-between w-full items-center">
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
            <div className="flex gap-2">
               <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" onClick={handleSummarize}>
                    Summarize
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Summary</DialogTitle>
                    <DialogDescription className="text-left py-2">
                     A brief summary of: "{article.title}"
                    </DialogDescription>
                  </DialogHeader>
                  {isSummarizing ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed max-h-[300px] overflow-y-auto">{summary}</p>
                  )}
                </DialogContent>
              </Dialog>
              <Button asChild variant="ghost" size="sm">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More
                    <Rss className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
