'use client';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { NewsArticle } from '@/lib/news';

import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { Skeleton } from './ui/skeleton';

export function TrendingTags() {
  const firestore = useFirestore();
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const articlesQuery = query(collection(firestore, 'news_articles'), orderBy('pubDate', 'desc'), limit(100));

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
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
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([tag]) => tag)
        .slice(0, 10);
      
      setTags(sortedTags);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trending tags:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);


  if (loading) {
    return (
        <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight font-headline">
          <Flame className="w-5 h-5 text-primary" />
          Trending Tags
        </h2>
        <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
        </div>
      </div>
    )
  }

  if (tags.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight font-headline">
        <Flame className="w-5 h-5 text-primary" />
        Trending Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-sm cursor-pointer hover:bg-accent transition-colors">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
