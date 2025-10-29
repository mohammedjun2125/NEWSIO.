import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

type TrendingTagsProps = {
  tags: string[];
};

export function TrendingTags({ tags }: TrendingTagsProps) {
  if (!tags || tags.length === 0) {
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
